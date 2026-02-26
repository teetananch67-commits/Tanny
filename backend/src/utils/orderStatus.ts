import { OrderStatus } from '@prisma/client';

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: [OrderStatus.PAID, OrderStatus.CANCELLED],
  PAID: [OrderStatus.CONFIRMED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.COOKING, OrderStatus.CANCELLED],
  COOKING: [OrderStatus.READY],
  READY: [OrderStatus.COMPLETED],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: []
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return allowedTransitions[from]?.includes(to) ?? false;
}
