import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

interface AuthPayload {
  userId: string;
}

export class AuthService {
  async register(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = await UserModel.create({ email, password });
    const token = this.generateToken(user.id);

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user.id);

    return { user, token };
  }

  generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  verifyToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
  }
}

export const authService = new AuthService();
