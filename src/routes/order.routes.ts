import { Router, RequestHandler } from 'express';
import { OrderController } from '../controllers/order.controller.js';

export function createOrderRoutes(
  orderController: OrderController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware);

  router.post('/', (req, res, next) => orderController.create(req, res, next));
  router.get('/', (req, res, next) => orderController.list(req, res, next));
  router.get('/:id', (req, res, next) => orderController.getById(req, res, next));
  router.patch('/:id/advance', (req, res, next) => orderController.advance(req, res, next));

  return router;
}
