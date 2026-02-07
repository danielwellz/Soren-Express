import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from 'src/common/enums';
import { assertValidOrderTransition } from './order-state-machine';

describe('order state machine', () => {
  it('rejects invalid status transitions', () => {
    expect(() =>
      assertValidOrderTransition(OrderStatus.CREATED, OrderStatus.FULFILLED),
    ).toThrow(BadRequestException);
  });

  it('allows valid status transitions', () => {
    expect(() =>
      assertValidOrderTransition(OrderStatus.CREATED, OrderStatus.PENDING_PAYMENT),
    ).not.toThrow();
    expect(() =>
      assertValidOrderTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.PAID),
    ).not.toThrow();
  });
});
