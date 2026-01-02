import { z } from 'zod';
import { OrderState, ServiceStatus } from '../domain/enums/order.enum.js';

export const createOrderSchema = z.object({
  lab: z.string().min(1, 'Lab is required'),
  patient: z.string().min(1, 'Patient is required'),
  customer: z.string().min(1, 'Customer is required'),
  services: z
    .array(
      z.object({
        name: z.string().min(1, 'Service name is required'),
        value: z.number().min(0, 'Service value must be positive'),
        status: z.nativeEnum(ServiceStatus).optional().default(ServiceStatus.PENDING),
      })
    )
    .min(1, 'At least one service is required'),
});

export const listOrdersSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  state: z.nativeEnum(OrderState).optional(),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
export type ListOrdersDTO = z.infer<typeof listOrdersSchema>;
