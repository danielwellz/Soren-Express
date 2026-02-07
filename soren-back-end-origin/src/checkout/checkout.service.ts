import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { CartService } from 'src/cart/cart.service';
import {
  Cart,
  Coupon,
  Inventory,
  Order,
  OrderItem,
  Payment,
  Shipment,
  ShippingRule,
  TaxRule,
  User,
} from 'src/entities';
import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  ShipmentStatus,
} from 'src/common/enums';
import { Repository } from 'typeorm';
import {
  ConfirmPaymentInput,
  CreateOrderInput,
  CreatePaymentIntentInput,
  CheckoutTotalsInput,
} from './checkout.inputs';
import {
  CheckoutPreview,
  CheckoutTotals,
  ConfirmPaymentPayload,
  PaymentIntentPayload,
} from './checkout.types';
import { PricingService } from './pricing.service';
import { NotificationService } from 'src/notifications/notification.service';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
    @InjectRepository(TaxRule)
    private readonly taxRulesRepository: Repository<TaxRule>,
    @InjectRepository(ShippingRule)
    private readonly shippingRulesRepository: Repository<ShippingRule>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Shipment)
    private readonly shipmentsRepository: Repository<Shipment>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly cartService: CartService,
    private readonly pricingService: PricingService,
    private readonly analyticsService: AnalyticsService,
    private readonly notificationService: NotificationService,
  ) {}

  async previewTotals(input: CheckoutTotalsInput, user?: User): Promise<CheckoutPreview> {
    const cart = await this.cartService.getCartForUserOrSession(user, input.sessionId);
    if (!cart.items?.length) {
      throw new BadRequestException('Cart is empty');
    }

    const totals = await this.calculateTotals(cart, input.region, input.couponCode);

    await this.analyticsService.trackEvent({
      eventType: 'checkout_start',
      user,
      sessionId: input.sessionId,
      metadata: { region: input.region, couponCode: input.couponCode },
    });

    return { cart, totals };
  }

  async createOrder(input: CreateOrderInput, user: User): Promise<Order> {
    const cart = await this.cartService.getCartForUserOrSession(user, input.sessionId);

    if (!cart.items?.length) {
      throw new BadRequestException('Cart is empty');
    }

    const totals = await this.calculateTotals(
      cart,
      input.shippingRegion,
      input.couponCode,
    );

    const coupon = totals.coupon;

    const order = this.ordersRepository.create({
      user,
      coupon,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      status: OrderStatus.PENDING,
      shippingName: input.shippingName,
      shippingAddress: input.shippingAddress,
      shippingCity: input.shippingCity,
      shippingRegion: input.shippingRegion,
      shippingPostalCode: input.shippingPostalCode,
    });

    const savedOrder = await this.ordersRepository.save(order);

    for (const cartItem of cart.items) {
      const orderItem = this.orderItemsRepository.create({
        order: savedOrder,
        variant: cartItem.variant,
        productName: cartItem.variant.product.name,
        variantLabel: `${cartItem.variant.color || 'Default'} / ${cartItem.variant.size || 'One Size'}`,
        sku: cartItem.variant.sku,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        lineTotal: Number(cartItem.unitPrice) * cartItem.quantity,
      });
      await this.orderItemsRepository.save(orderItem);
    }

    cart.active = false;
    await this.cartService.clearCart(cart);

    await this.analyticsService.trackEvent({
      eventType: 'order_created',
      user,
      order: savedOrder,
      metadata: { orderId: savedOrder.id },
    });

    return this.ordersRepository.findOne(savedOrder.id, {
      relations: ['items', 'items.variant', 'items.variant.product', 'payment', 'shipment'],
    });
  }

  async createPaymentIntent(
    input: CreatePaymentIntentInput,
    user: User,
  ): Promise<PaymentIntentPayload> {
    const order = await this.ordersRepository.findOne(input.orderId, {
      relations: ['user', 'items', 'items.variant', 'items.variant.inventory'],
    });

    if (!order || order.user.id !== user.id) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not payable');
    }

    const existing = await this.paymentsRepository.findOne({ where: { order } });
    if (existing) {
      return {
        payment: existing,
        clientSecret: `fake_secret_${existing.intentId}`,
      };
    }

    const payment = await this.paymentsRepository.save(
      this.paymentsRepository.create({
        order,
        provider: PaymentProvider.FAKEPAY,
        status: PaymentStatus.REQUIRES_CONFIRMATION,
        intentId: `pi_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
        amount: order.total,
        currency: 'USD',
      }),
    );

    return {
      payment,
      clientSecret: `fake_secret_${payment.intentId}`,
    };
  }

  async confirmPayment(input: ConfirmPaymentInput, user: User): Promise<ConfirmPaymentPayload> {
    const payment = await this.paymentsRepository.findOne({
      where: { intentId: input.intentId },
      relations: ['order', 'order.user', 'order.items', 'order.items.variant', 'order.items.variant.inventory'],
    });

    if (!payment || payment.order.user.id !== user.id) {
      throw new NotFoundException('Payment intent not found');
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      return {
        payment,
        order: payment.order,
      };
    }

    for (const item of payment.order.items) {
      const inventory = await this.inventoryRepository.findOne({ where: { variant: item.variant } });
      if (!inventory || inventory.quantity - inventory.reserved < item.quantity) {
        throw new BadRequestException(`Insufficient inventory for SKU ${item.sku}`);
      }
    }

    for (const item of payment.order.items) {
      const inventory = await this.inventoryRepository.findOne({ where: { variant: item.variant } });
      inventory.quantity -= item.quantity;
      await this.inventoryRepository.save(inventory);
    }

    payment.status = PaymentStatus.SUCCEEDED;
    payment.last4 = input.cardLast4;
    await this.paymentsRepository.save(payment);

    payment.order.status = OrderStatus.PAID;
    await this.ordersRepository.save(payment.order);

    const shipment = await this.shipmentsRepository.save(
      this.shipmentsRepository.create({
        order: payment.order,
        status: ShipmentStatus.PENDING,
      }),
    );

    await this.analyticsService.trackEvent({
      eventType: 'purchase',
      user,
      order: payment.order,
      metadata: { paymentId: payment.id, total: payment.order.total },
    });

    await this.notificationService.sendEmail(
      user.email,
      `Order #${payment.order.id} confirmed`,
      'Your payment was confirmed with FakePay. We will start fulfillment shortly.',
    );

    if (user.phone) {
      await this.notificationService.sendSms(
        user.phone,
        `Order #${payment.order.id} paid successfully.`,
      );
    }

    const order = await this.ordersRepository.findOne(payment.order.id, {
      relations: ['items', 'items.variant', 'payment', 'shipment', 'coupon', 'user'],
    });

    return {
      payment,
      order: {
        ...order,
        shipment,
      },
    };
  }

  async calculateTotals(
    cart: Cart,
    region: string,
    couponCode?: string,
  ): Promise<CheckoutTotals> {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    let coupon: Coupon;
    if (couponCode) {
      coupon = await this.couponsRepository.findOne({ where: { code: couponCode } });
      if (!coupon || !coupon.active) {
        throw new BadRequestException('Invalid coupon');
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        throw new BadRequestException('Coupon expired');
      }
    }

    const shippingRule = await this.shippingRulesRepository.findOne({ where: { region, active: true } });
    const taxRule = await this.taxRulesRepository.findOne({ where: { region, active: true } });

    return this.pricingService.calculateTotals({
      subtotal,
      coupon,
      shippingRule,
      taxRule,
    });
  }
}
