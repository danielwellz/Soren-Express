import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  CREATED = 'CREATED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
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

export enum ReturnRequestStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum NewsletterSubscriptionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}

export enum SupportMessageStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
}

registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(OrderStatus, { name: 'OrderStatus' });
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });
registerEnumType(PaymentProvider, { name: 'PaymentProvider' });
registerEnumType(ShipmentStatus, { name: 'ShipmentStatus' });
registerEnumType(ReviewStatus, { name: 'ReviewStatus' });
registerEnumType(CouponType, { name: 'CouponType' });
registerEnumType(ReturnRequestStatus, { name: 'ReturnRequestStatus' });
registerEnumType(NewsletterSubscriptionStatus, { name: 'NewsletterSubscriptionStatus' });
registerEnumType(SupportMessageStatus, { name: 'SupportMessageStatus' });
