import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { generalRateLimiter } from './middlewares/rate-limit.middleware.js';
import { createAuthMiddleware } from './middlewares/auth.middleware.js';
import { healthRouter } from './routes/health.routes.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { createOrderRoutes } from './routes/order.routes.js';
import { UserRepository } from './repositories/user.repository.js';
import { OrderRepository } from './repositories/order.repository.js';
import { AuthService } from './services/auth.service.js';
import { OrderService } from './services/order.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { OrderController } from './controllers/order.controller.js';

export function createApp(): Application {
  const app = express();

  // Repositories
  const userRepository = new UserRepository();
  const orderRepository = new OrderRepository();

  // Services
  const authService = new AuthService(userRepository);
  const orderService = new OrderService(orderRepository);

  // Controllers
  const authController = new AuthController(authService);
  const orderController = new OrderController(orderService);

  // Middleware
  const authMiddleware = createAuthMiddleware(userRepository);

  // Global middlewares
  app.use(helmet());
  app.use(cors());
  app.use(generalRateLimiter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/health', healthRouter);
  app.use('/auth', createAuthRoutes(authController));
  app.use('/orders', createOrderRoutes(orderController, authMiddleware));

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
