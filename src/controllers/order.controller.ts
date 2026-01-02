import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service.js';
import { createOrderSchema, listOrdersSchema } from '../dtos/order.dto.js';
import { AppError } from '../shared/AppError.js';

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const data = createOrderSchema.parse(req.body);
      const order = await this.orderService.create({
        ...data,
        userId: req.userId,
      });

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
      const result = await this.orderService.list({
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

      const order = await this.orderService.getById(req.params.id, req.userId);

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

      const order = await this.orderService.advance(req.params.id, req.userId);

      res.status(200).json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }
}
