import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../dtos/auth.dto.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const result = await this.authService.register(data);

      res.status(201).json({
        status: 'success',
        data: {
          user: { id: result.user.id, email: result.user.email },
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const result = await this.authService.login(data);

      res.status(200).json({
        status: 'success',
        data: {
          user: { id: result.user.id, email: result.user.email },
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
