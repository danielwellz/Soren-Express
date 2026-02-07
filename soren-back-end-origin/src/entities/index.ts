import { AnalyticsEvent } from './analytics-event.entity';
import { Brand } from './brand.entity';
import { CartItem } from './cart-item.entity';
import { Cart } from './cart.entity';
import { Category } from './category.entity';
import { Coupon } from './coupon.entity';
import { Inventory } from './inventory.entity';
import { NotificationLog } from './notification-log.entity';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';
import { Payment } from './payment.entity';
import { ProductVariant } from './product-variant.entity';
import { Product } from './product.entity';
import { Review } from './review.entity';
import { Shipment } from './shipment.entity';
import { ShippingRule } from './shipping-rule.entity';
import { TaxRule } from './tax-rule.entity';
import { User } from './user.entity';

export const ENTITIES = [
  User,
  Category,
  Brand,
  Product,
  ProductVariant,
  Inventory,
  Cart,
  CartItem,
  Coupon,
  Order,
  OrderItem,
  Payment,
  Shipment,
  Review,
  AnalyticsEvent,
  TaxRule,
  ShippingRule,
  NotificationLog,
];

export {
  AnalyticsEvent,
  Brand,
  Cart,
  CartItem,
  Category,
  Coupon,
  Inventory,
  NotificationLog,
  Order,
  OrderItem,
  Payment,
  Product,
  ProductVariant,
  Review,
  Shipment,
  ShippingRule,
  TaxRule,
  User,
};
