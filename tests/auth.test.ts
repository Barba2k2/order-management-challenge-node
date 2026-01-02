import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { UserModel } from '../src/models/user.model.js';

describe('Auth Routes', () => {
  const app = createApp();

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'invalid-email', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should fail with short password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password456' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already registered');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });
    });

    it('should login successfully', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
