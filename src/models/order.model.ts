import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderState, OrderStatus, ServiceStatus } from '../domain/enums/order.enum.js';

export interface IServiceDocument {
  name: string;
  value: number;
  status: ServiceStatus;
}

export interface IOrderDocument extends Document {
  lab: string;
  patient: string;
  customer: string;
  state: OrderState;
  status: OrderStatus;
  services: IServiceDocument[];
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IServiceDocument>(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    value: {
      type: Number,
      required: [true, 'Service value is required'],
      min: [0, 'Service value must be positive'],
    },
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.PENDING,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    lab: {
      type: String,
      required: [true, 'Lab is required'],
      trim: true,
    },
    patient: {
      type: String,
      required: [true, 'Patient is required'],
      trim: true,
    },
    customer: {
      type: String,
      required: [true, 'Customer is required'],
      trim: true,
    },
    state: {
      type: String,
      enum: Object.values(OrderState),
      default: OrderState.CREATED,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ACTIVE,
    },
    services: {
      type: [serviceSchema],
      validate: {
        validator: function (services: IServiceDocument[]) {
          return services && services.length > 0;
        },
        message: 'At least one service is required',
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ state: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ user: 1 });

export const OrderModel = mongoose.model<IOrderDocument>('Order', orderSchema);
