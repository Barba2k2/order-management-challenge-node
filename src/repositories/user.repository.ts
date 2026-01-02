import { UserEntity } from '../domain/entities/user.entity.js';
import { UserModel, IUserDocument } from '../models/user.model.js';

interface CreateUserData {
  email: string;
  password: string;
}

export class UserRepository {
  private toEntity(doc: IUserDocument): UserEntity {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await UserModel.create(data);
    return this.toEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.toEntity(user) : null;
  }

  async findByEmailWithPassword(
    email: string
  ): Promise<(UserEntity & { comparePassword(password: string): Promise<boolean> }) | null> {
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) return null;

    const entity = this.toEntity(user);
    return {
      ...entity,
      comparePassword: (password: string) => user.comparePassword(password),
    };
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await UserModel.findById(id);
    return user ? this.toEntity(user) : null;
  }
}
