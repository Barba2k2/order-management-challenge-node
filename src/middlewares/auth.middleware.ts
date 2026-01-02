import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import { AppError } from '../shared/AppError.js';
import { env } from '../config/env.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface AuthPayload {
  userId: string;
}

export function createAuthMiddleware(userRepository: UserRepository) {
  return async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('No token provided', 401);
      }

      const token = authHeader.split(' ')[1];

      let payload: AuthPayload;
      try {
        payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      } catch {
        throw new AppError('Invalid or expired token', 401);
      }

      const user = await userRepository.findById(payload.userId);

      if (!user) {
        throw new AppError('User not found', 401);
      }

      req.userId = payload.userId;
      next();
    } catch (error) {
      next(error);
    }
  };
}
