import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { UserModel } from '../src/models/user.model.js';
import { OrderModel } from '../src/models/order.model.js';
import { OrderState } from '../src/domain/enums/order.enum.js';

describe('Order Routes', () => {
  const app = createApp();
  let token: string;

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});

    const registerResponse = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    token = registerResponse.body.data.token;
  });

  describe('POST /orders', () => {
    it('should create an order successfully', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          lab: 'Lab Test',
          patient: 'John Doe',
          customer: 'Customer A',
          services: [{ name: 'Service 1', value: 100 }],
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.order.state).toBe(OrderState.CREATED);
      expect(response.body.data.order.status).toBe('ACTIVE');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          lab: 'Lab Test',
          patient: 'John Doe',
          customer: 'Customer A',
          services: [{ name: 'Service 1', value: 100 }],
        });

      expect(response.status).toBe(401);
    });

    it('should fail without services', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          lab: 'Lab Test',
          patient: 'John Doe',
          customer: 'Customer A',
          services: [],
        });

      expect(response.status).toBe(400);
    });

    it('should fail with zero total value', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          lab: 'Lab Test',
          patient: 'John Doe',
          customer: 'Customer A',
          services: [{ name: 'Service 1', value: 0 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Total value of services must be greater than zero');
    });
  });

  describe('GET /orders', () => {
    beforeEach(async () => {
      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          lab: 'Lab 1',
          patient: 'Patient 1',
          customer: 'Customer 1',
          services: [{ name: 'Service 1', value: 100 }],
        });

      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          lab: 'Lab 2',
          patient: 'Patient 2',
          customer: 'Customer 2',
          services: [{ name: 'Service 2', value: 200 }],
        });
    });

    it('should list orders with pagination', async () => {
      const response = await request(app).get('/orders').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter orders by state', async () => {
      const response = await request(app)
        .get('/orders?state=CREATED')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('PATCH /orders/:id/advance', () => {
    let orderId: string;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          lab: 'Lab Test',
          patient: 'John Doe',
          customer: 'Customer A',
          services: [{ name: 'Service 1', value: 100 }],
        });

      orderId = createResponse.body.data.order.id;
    });

    it('should advance from CREATED to ANALYSIS', async () => {
      const response = await request(app)
        .patch(`/orders/${orderId}/advance`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.order.state).toBe(OrderState.ANALYSIS);
    });

    it('should advance from ANALYSIS to COMPLETED and mark services as DONE', async () => {
      await request(app)
        .patch(`/orders/${orderId}/advance`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .patch(`/orders/${orderId}/advance`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.order.state).toBe(OrderState.COMPLETED);
      expect(response.body.data.order.services.every((s: { status: string }) => s.status === 'DONE')).toBe(true);
    });

    it('should not advance from COMPLETED', async () => {
      await request(app)
        .patch(`/orders/${orderId}/advance`)
        .set('Authorization', `Bearer ${token}`);

      await request(app)
        .patch(`/orders/${orderId}/advance`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .patch(`/orders/${orderId}/advance`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Cannot advance from state COMPLETED');
    });
  });
});
