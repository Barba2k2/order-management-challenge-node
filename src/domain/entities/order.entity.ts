import { OrderState, OrderStatus, ServiceStatus } from '../enums/order.enum.js';

export interface ServiceEntity {
  name: string;
  value: number;
  status: ServiceStatus;
}

export interface OrderEntity {
  id: string;
  lab: string;
  patient: string;
  customer: string;
  state: OrderState;
  status: OrderStatus;
  services: ServiceEntity[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
