import { OrderRepository } from '../repositories/order.repository.js';
import { OrderEntity } from '../domain/entities/order.entity.js';
import { OrderState } from '../domain/enums/order.enum.js';
import { AppError } from '../shared/AppError.js';

const STATE_TRANSITIONS: Record<OrderState, OrderState | null> = {
  [OrderState.CREATED]: OrderState.ANALYSIS,
  [OrderState.ANALYSIS]: OrderState.COMPLETED,
  [OrderState.COMPLETED]: null,
};

interface CreateOrderInput {
  userId: string;
  lab: string;
  patient: string;
  customer: string;
  services: { name: string; value: number }[];
}

interface ListOrdersInput {
  userId: string;
  page: number;
  limit: number;
  state?: OrderState;
}

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async create(input: CreateOrderInput): Promise<OrderEntity> {
    if (!input.services || input.services.length === 0) {
      throw new AppError('At least one service is required', 400);
    }

    const totalValue = input.services.reduce((sum, s) => sum + s.value, 0);
    if (totalValue <= 0) {
      throw new AppError('Total value of services must be greater than zero', 400);
    }

    return this.orderRepository.create(input);
  }

  async list(input: ListOrdersInput) {
    const result = await this.orderRepository.findAll(input);

    return {
      orders: result.data,
      pagination: {
        page: input.page,
        limit: input.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / input.limit),
      },
    };
  }

  async getById(orderId: string, userId: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(orderId, userId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  async advance(orderId: string, userId: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(orderId, userId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const nextState = STATE_TRANSITIONS[order.state];
    if (!nextState) {
      throw new AppError(`Cannot advance from state ${order.state}. Order is already completed.`, 400);
    }

    return this.orderRepository.updateState(order.id, nextState);
  }

  static getNextState(currentState: OrderState): OrderState | null {
    return STATE_TRANSITIONS[currentState];
  }

  static canAdvance(currentState: OrderState): boolean {
    return STATE_TRANSITIONS[currentState] !== null;
  }
}
