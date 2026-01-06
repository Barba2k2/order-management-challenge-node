import mongoose from 'mongoose';
import { OrderEntity } from '../domain/entities/order.entity.js';
import { OrderState, OrderStatus, ServiceStatus } from '../domain/enums/order.enum.js';
import { OrderModel, IOrderDocument } from '../models/order.model.js';
import { AppError } from '../shared/AppError.js';

interface CreateOrderData {
  userId: string;
  lab: string;
  patient: string;
  customer: string;
  services: { name: string; value: number }[];
}

interface ListOrdersParams {
  userId: string;
  page: number;
  limit: number;
  state?: OrderState;
}

export class OrderRepository {
  private toEntity(doc: IOrderDocument): OrderEntity {
    return {
      id: doc._id.toString(),
      lab: doc.lab,
      patient: doc.patient,
      customer: doc.customer,
      state: doc.state,
      status: doc.status,
      services: doc.services.map((s) => ({
        name: s.name,
        value: s.value,
        status: s.status,
      })),
      userId: doc.user.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(data: CreateOrderData): Promise<OrderEntity> {
    const order = await OrderModel.create({
      ...data,
      user: new mongoose.Types.ObjectId(data.userId),
    });
    return this.toEntity(order);
  }

  async findById(id: string, userId: string): Promise<OrderEntity | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError('Unauthorized', 401);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Order not found', 404);
    }

    const order = await OrderModel.findOne({
      _id: id,
      user: userId,
      status: OrderStatus.ACTIVE,
    });
    return order ? this.toEntity(order) : null;
  }

  async findAll(params: ListOrdersParams) {
    const { userId, page, limit, state } = params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError('Unauthorized', 401);
    }
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      user: userId,
      status: OrderStatus.ACTIVE,
    };

    if (state) {
      query.state = state;
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      OrderModel.countDocuments(query),
    ]);

    return {
      data: orders.map((order) => this.toEntity(order)),
      total,
    };
  }

  async updateState(id: string, state: OrderState): Promise<OrderEntity> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Order not found', 404);
    }

    const updateData: Record<string, unknown> = { state };

    if (state === OrderState.COMPLETED) {
      updateData['services.$[].status'] = ServiceStatus.DONE;
    }

    const order = await OrderModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return this.toEntity(order);
  }
}
