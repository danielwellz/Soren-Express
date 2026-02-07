import { AnalyticsEvent } from './analytics-event.entity';
import { AddressBookEntry } from './address-book-entry.entity';
import { BackInStockSubscription } from './back-in-stock-subscription.entity';
import { Brand } from './brand.entity';
import { CartItem } from './cart-item.entity';
import { Cart } from './cart.entity';
import { Category } from './category.entity';
import { CheckoutProfile } from './checkout-profile.entity';
import { Coupon } from './coupon.entity';
import { Inventory } from './inventory.entity';
import { IdempotencyRecord } from './idempotency-record.entity';
import { NewsletterSubscription } from './newsletter-subscription.entity';
import { NotificationLog } from './notification-log.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { Order } from './order.entity';
import { Payment } from './payment.entity';
import { ProductVariant } from './product-variant.entity';
import { Product } from './product.entity';
import { Review } from './review.entity';
import { ReturnRequest } from './return-request.entity';
import { Shipment } from './shipment.entity';
import { ShippingRule } from './shipping-rule.entity';
import { SupportMessage } from './support-message.entity';
import { TaxRule } from './tax-rule.entity';
import { User } from './user.entity';
import { WishlistItem } from './wishlist-item.entity';

export const ENTITIES = [
  User,
  AddressBookEntry,
  CheckoutProfile,
  Category,
  Brand,
  Product,
  ProductVariant,
  Inventory,
  IdempotencyRecord,
  WishlistItem,
  BackInStockSubscription,
  Cart,
  CartItem,
  Coupon,
  Order,
  OrderItem,
  OrderStatusHistory,
  ReturnRequest,
  Payment,
  Shipment,
  Review,
  NewsletterSubscription,
  SupportMessage,
  AnalyticsEvent,
  TaxRule,
  ShippingRule,
  NotificationLog,
];

export {
  AddressBookEntry,
  AnalyticsEvent,
  BackInStockSubscription,
  Brand,
  Cart,
  CartItem,
  Category,
  CheckoutProfile,
  Coupon,
  Inventory,
  IdempotencyRecord,
  NewsletterSubscription,
  NotificationLog,
  Order,
  OrderItem,
  OrderStatusHistory,
  Payment,
  Product,
  ProductVariant,
  Review,
  ReturnRequest,
  Shipment,
  ShippingRule,
  SupportMessage,
  TaxRule,
  User,
  WishlistItem,
};
