import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  REQUIRES_CONFIRMATION = 'REQUIRES_CONFIRMATION',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export enum PaymentProvider {
  FAKEPAY = 'FAKEPAY',
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum CouponType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(OrderStatus, { name: 'OrderStatus' });
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });
registerEnumType(PaymentProvider, { name: 'PaymentProvider' });
registerEnumType(ShipmentStatus, { name: 'ShipmentStatus' });
registerEnumType(ReviewStatus, { name: 'ReviewStatus' });
registerEnumType(CouponType, { name: 'CouponType' });
