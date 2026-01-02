import { OrderModel, IOrder, OrderState, OrderStatus, IService } from '../models/order.model.js';
import { AppError } from '../utils/AppError.js';

interface CreateOrderInput {
  lab: string;
  patient: string;
  customer: string;
  services: IService[];
}

interface ListOrdersInput {
  userId: string;
  page: number;
  limit: number;
  state?: OrderState;
}

interface PaginatedOrders {
  orders: IOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const STATE_TRANSITIONS: Record<OrderState, OrderState | null> = {
  [OrderState.CREATED]: OrderState.ANALYSIS,
  [OrderState.ANALYSIS]: OrderState.COMPLETED,
  [OrderState.COMPLETED]: null,
};

export class OrderService {
  async create(userId: string, input: CreateOrderInput): Promise<IOrder> {
    if (!input.services || input.services.length === 0) {
      throw new AppError('At least one service is required', 400);
    }

    const totalValue = input.services.reduce((sum, service) => sum + service.value, 0);

    if (totalValue <= 0) {
      throw new AppError('Total value of services must be greater than zero', 400);
    }

    const order = await OrderModel.create({
      ...input,
      user: userId,
      state: OrderState.CREATED,
      status: OrderStatus.ACTIVE,
    });

    return order;
  }

  async list(input: ListOrdersInput): Promise<PaginatedOrders> {
    const { userId, page, limit, state } = input;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      user: userId,
      status: OrderStatus.ACTIVE,
    };

    if (state) {
      query.state = state;
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      OrderModel.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(orderId: string, userId: string): Promise<IOrder> {
    const order = await OrderModel.findOne({
      _id: orderId,
      user: userId,
      status: OrderStatus.ACTIVE,
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  async advanceState(orderId: string, userId: string): Promise<IOrder> {
    const order = await this.findById(orderId, userId);

    const nextState = STATE_TRANSITIONS[order.state];

    if (!nextState) {
      throw new AppError(`Cannot advance from state ${order.state}. Order is already completed.`, 400);
    }

    order.state = nextState;
    await order.save();

    return order;
  }

  getNextState(currentState: OrderState): OrderState | null {
    return STATE_TRANSITIONS[currentState];
  }

  canAdvance(currentState: OrderState): boolean {
    return STATE_TRANSITIONS[currentState] !== null;
  }
}

export const orderService = new OrderService();
