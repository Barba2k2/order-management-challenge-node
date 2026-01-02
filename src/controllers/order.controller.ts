import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { orderService } from '../services/order.service.js';
import { OrderState, ServiceStatus } from '../models/order.model.js';
import { AppError } from '../utils/AppError.js';

const createOrderSchema = z.object({
  lab: z.string().min(1, 'Lab is required'),
  patient: z.string().min(1, 'Patient is required'),
  customer: z.string().min(1, 'Customer is required'),
  services: z
    .array(
      z.object({
        name: z.string().min(1, 'Service name is required'),
        value: z.number().min(0, 'Service value must be positive'),
        status: z.nativeEnum(ServiceStatus).optional().default(ServiceStatus.PENDING),
      })
    )
    .min(1, 'At least one service is required'),
});

const listOrdersSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  state: z.nativeEnum(OrderState).optional(),
});

export class OrderController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const data = createOrderSchema.parse(req.body);
      const order = await orderService.create(req.userId, data);

      res.status(201).json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { page, limit, state } = listOrdersSchema.parse(req.query);
      const result = await orderService.list({
        userId: req.userId,
        page,
        limit,
        state,
      });

      res.status(200).json({
        status: 'success',
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const order = await orderService.findById(req.params.id, req.userId);

      res.status(200).json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  async advance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const order = await orderService.advanceState(req.params.id, req.userId);

      res.status(200).json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
