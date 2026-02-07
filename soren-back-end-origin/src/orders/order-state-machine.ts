import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from 'src/common/enums';

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.FULFILLED],
  [OrderStatus.FULFILLED]: [],
  [OrderStatus.CANCELLED]: [],
};

export function isValidOrderTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) {
    return true;
  }

  return ORDER_STATUS_TRANSITIONS[current]?.includes(next) || false;
}

export function assertValidOrderTransition(current: OrderStatus, next: OrderStatus): void {
  if (!isValidOrderTransition(current, next)) {
    throw new BadRequestException(
      `Invalid order status transition: ${current} -> ${next}`,
    );
  }
}
