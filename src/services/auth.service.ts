import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import { UserEntity } from '../domain/entities/user.entity.js';
import { AppError } from '../shared/AppError.js';
import { env } from '../config/env.js';

interface AuthInput {
  email: string;
  password: string;
}

interface AuthOutput {
  user: UserEntity;
  token: string;
}

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(input: AuthInput): Promise<AuthOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = await this.userRepository.create(input);
    const token = this.generateToken(user.id);

    return { user, token };
  }

  async login(input: AuthInput): Promise<AuthOutput> {
    const user = await this.userRepository.findByEmailWithPassword(input.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user.id);

    return { user, token };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }
}
