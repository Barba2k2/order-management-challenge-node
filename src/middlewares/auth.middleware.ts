import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { UserModel } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function authMiddleware(
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
    const { userId } = authService.verifyToken(token);

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
}
