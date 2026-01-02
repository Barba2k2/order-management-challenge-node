import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middlewares/rate-limit.middleware.js';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/register', authRateLimiter, (req, res, next) =>
    authController.register(req, res, next)
  );

  router.post('/login', authRateLimiter, (req, res, next) =>
    authController.login(req, res, next)
  );

  return router;
}
