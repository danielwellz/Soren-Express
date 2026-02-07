import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { CartService } from 'src/cart/cart.service';
import {
  AddressBookEntry,
  Cart,
  CheckoutProfile,
  Coupon,
  InventoryReservation,
  IdempotencyRecord,
  Inventory,
  Order,
  OrderItem,
  OrderStatusHistory,
  Payment,
  Shipment,
  ShippingRule,
  TaxRule,
  User,
} from 'src/entities';
import {
  OrderStatus,
  InventoryReservationStatus,
  PaymentProvider,
  PaymentStatus,
  ShipmentStatus,
} from 'src/common/enums';
import { assertValidOrderTransition } from 'src/orders/order-state-machine';
import { Repository } from 'typeorm';
import {
  ConfirmPaymentInput,
  CreateOrderInput,
  CreatePaymentIntentInput,
  CheckoutTotalsInput,
  ShippingEstimateInput,
} from './checkout.inputs';
import {
  CheckoutPreview,
  CheckoutTotals,
  ConfirmPaymentPayload,
  PaymentIntentPayload,
  ShippingEstimate,
} from './checkout.types';
import { PricingService } from './pricing.service';
import { NotificationService } from 'src/notifications/notification.service';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  private readonly reservationLocks = new Map<number, Promise<void>>();

  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
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
    @InjectRepository(AddressBookEntry)
    private readonly addressBookRepository: Repository<AddressBookEntry>,
    @InjectRepository(CheckoutProfile)
    private readonly checkoutProfileRepository: Repository<CheckoutProfile>,
    @InjectRepository(OrderStatusHistory)
    private readonly orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    @InjectRepository(IdempotencyRecord)
    private readonly idempotencyRepository: Repository<IdempotencyRecord>,
    @InjectRepository(InventoryReservation)
    private readonly inventoryReservationsRepository: Repository<InventoryReservation>,
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

    const activeCouponCode = input.couponCode || cart.promoCode;
    const totals = await this.calculateTotals(cart, input.region, activeCouponCode);

    return { cart, totals };
  }

  async createOrder(input: CreateOrderInput, user: User, idempotencyKey?: string): Promise<Order> {
    const correlationId = this.buildCorrelationId('create-order', idempotencyKey);
    const scopeKey = this.resolveIdempotencyScope(user, input.sessionId);

    return this.runIdempotent<Order>(
      'createOrder',
      scopeKey,
      idempotencyKey,
      { userId: user.id, input },
      async () => {
        const cart = await this.cartService.getCartForUserOrSession(user, input.sessionId);

        if (!cart.items?.length) {
          throw new BadRequestException('Cart is empty');
        }

        let shippingName = input.shippingName;
        let shippingAddress = input.shippingAddress;
        let shippingCity = input.shippingCity;
        let shippingRegion = input.shippingRegion;
        let shippingPostalCode = input.shippingPostalCode;

        if (input.savedAddressId) {
          const savedAddress = await this.addressBookRepository.findOne({
            where: { id: input.savedAddressId, user },
          });

          if (!savedAddress) {
            throw new NotFoundException('Saved address not found');
          }

          shippingName = savedAddress.fullName;
          shippingAddress = savedAddress.line1;
          shippingCity = savedAddress.city;
          shippingRegion = savedAddress.region;
          shippingPostalCode = savedAddress.postalCode;
        }

        const totals = await this.calculateTotals(
          cart,
          shippingRegion,
          input.couponCode || cart.promoCode,
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
          status: OrderStatus.CREATED,
          shippingName,
          shippingAddress,
          shippingCity,
          shippingRegion,
          shippingPostalCode,
        });

        const savedOrder = await this.ordersRepository.save(order);
        await this.recordOrderStatus(
          savedOrder,
          OrderStatus.CREATED,
          'Order created',
          correlationId,
        );

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

        if (input.saveAddress) {
          await this.saveOrUpdateAddress(user, {
            fullName: shippingName,
            line1: shippingAddress,
            city: shippingCity,
            region: shippingRegion,
            postalCode: shippingPostalCode,
          });
        }

        if (input.saveCheckoutProfile !== false) {
          await this.upsertCheckoutProfile(user, {
            shippingName,
            shippingLine1: shippingAddress,
            shippingCity,
            shippingRegion,
            shippingPostalCode,
          });
        }

        cart.promoCode = null;
        cart.active = false;
        await this.cartsRepository.save(cart);
        await this.cartService.clearCart(cart);

        await this.analyticsService.trackEvent({
          eventType: 'order_created',
          user,
          order: savedOrder,
          metadata: { orderId: savedOrder.id, correlationId },
        });

        return this.ordersRepository.findOne(savedOrder.id, {
          relations: [
            'items',
            'items.variant',
            'items.variant.product',
            'payment',
            'shipment',
            'statusHistory',
          ],
        });
      },
    );
  }

  async createPaymentIntent(
    input: CreatePaymentIntentInput,
    user: User,
    idempotencyKey?: string,
  ): Promise<PaymentIntentPayload> {
    const correlationId = this.buildCorrelationId('create-payment-intent', idempotencyKey);
    const scopeKey = this.resolveIdempotencyScope(user);

    return this.runIdempotent<PaymentIntentPayload>(
      'createPaymentIntent',
      scopeKey,
      idempotencyKey,
      { userId: user.id, input },
      async () => {
        const order = await this.ordersRepository.findOne(input.orderId, {
          relations: ['user', 'items', 'items.variant', 'items.variant.inventory'],
        });

        if (!order || order.user.id !== user.id) {
          throw new NotFoundException('Order not found');
        }

        if (
          order.status !== OrderStatus.CREATED &&
          order.status !== OrderStatus.PENDING_PAYMENT
        ) {
          throw new BadRequestException('Order is not payable');
        }

        await this.reserveInventoryForOrder(
          order,
          user,
          undefined,
          correlationId,
        );

        const existing = await this.paymentsRepository.findOne({ where: { order } });
        if (existing) {
          if (order.status === OrderStatus.CREATED) {
            await this.transitionOrderStatus(
              order,
              OrderStatus.PENDING_PAYMENT,
              'Payment intent reused',
              correlationId,
            );
          }

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

        if (order.status === OrderStatus.CREATED) {
          await this.transitionOrderStatus(
            order,
            OrderStatus.PENDING_PAYMENT,
            'Payment intent created',
            correlationId,
          );
        }

        return {
          payment,
          clientSecret: `fake_secret_${payment.intentId}`,
        };
      },
    );
  }

  async confirmPayment(
    input: ConfirmPaymentInput,
    user: User,
    idempotencyKey?: string,
  ): Promise<ConfirmPaymentPayload> {
    const correlationId = this.buildCorrelationId('confirm-payment', idempotencyKey);
    const scopeKey = this.resolveIdempotencyScope(user);

    return this.runIdempotent<ConfirmPaymentPayload>(
      'confirmPayment',
      scopeKey,
      idempotencyKey,
      { userId: user.id, input },
      async () => {
        const payment = await this.paymentsRepository.findOne({
          where: { intentId: input.intentId },
          relations: [
            'order',
            'order.user',
            'order.items',
            'order.items.variant',
            'order.items.variant.inventory',
            'order.shipment',
          ],
        });

        if (!payment || payment.order.user.id !== user.id) {
          throw new NotFoundException('Payment intent not found');
        }

        if (
          payment.status !== PaymentStatus.REQUIRES_CONFIRMATION &&
          payment.status !== PaymentStatus.SUCCEEDED
        ) {
          throw new BadRequestException('Payment is not in confirmable state');
        }

        if (
          payment.order.status !== OrderStatus.PENDING_PAYMENT &&
          payment.order.status !== OrderStatus.PAID
        ) {
          throw new BadRequestException('Order is not in a confirmable payment state');
        }

        if (payment.status === PaymentStatus.SUCCEEDED) {
          return {
            payment,
            order: payment.order,
          };
        }

        await this.commitReservationsForOrder(payment.order, correlationId);

        payment.status = PaymentStatus.SUCCEEDED;
        payment.last4 = input.cardLast4;
        await this.paymentsRepository.save(payment);

        await this.transitionOrderStatus(
          payment.order,
          OrderStatus.PAID,
          'Payment confirmed',
          correlationId,
        );

        const shipment =
          payment.order.shipment ||
          (await this.shipmentsRepository.save(
            this.shipmentsRepository.create({
              order: payment.order,
              status: ShipmentStatus.PENDING,
            }),
          ));

        await this.analyticsService.trackEvent({
          eventType: 'purchase',
          user,
          order: payment.order,
          metadata: { paymentId: payment.id, total: payment.order.total, correlationId },
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

        await this.upsertCheckoutProfile(user, {
          shippingName: payment.order.shippingName,
          shippingLine1: payment.order.shippingAddress,
          shippingCity: payment.order.shippingCity,
          shippingRegion: payment.order.shippingRegion,
          shippingPostalCode: payment.order.shippingPostalCode,
          cardholderName: input.cardholderName,
          cardLast4: input.cardLast4,
          cardExpiry: input.cardExpiry,
        });

        const order = await this.ordersRepository.findOne(payment.order.id, {
          relations: [
            'items',
            'items.variant',
            'payment',
            'shipment',
            'coupon',
            'user',
            'statusHistory',
          ],
        });

        return {
          payment,
          order: {
            ...order,
            shipment,
          },
        };
      },
    );
  }

  async getShippingEstimate(input: ShippingEstimateInput): Promise<ShippingEstimate> {
    const rule =
      (await this.shippingRulesRepository.findOne({
        where: { region: input.region, active: true },
      })) ||
      (await this.shippingRulesRepository.findOne({
        where: { region: 'US-DEFAULT', active: true },
      }));

    const flatRate = Number(rule?.flatRate || 0);
    const freeShippingOver = Number(rule?.freeShippingOver || 0);
    const subtotal = Number(input.subtotal || 0);
    const eligibleForFreeShipping = subtotal >= freeShippingOver;
    const remainingForFreeShipping = eligibleForFreeShipping
      ? 0
      : Number(Math.max(freeShippingOver - subtotal, 0).toFixed(2));

    return {
      region: input.region,
      flatRate,
      freeShippingOver,
      remainingForFreeShipping,
      eligibleForFreeShipping,
      estimatedMinDays: 2,
      estimatedMaxDays: 5,
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

  async processPaymentWebhook(
    payload: {
      id: string;
      type: string;
      intentId: string;
      metadata?: Record<string, unknown>;
    },
    signature?: string,
  ): Promise<{ received: boolean; duplicate?: boolean; ignored?: boolean; orderId?: number }> {
    this.assertValidWebhookSignature(payload, signature);
    const correlationId = this.buildCorrelationId(`webhook-${payload.id}`, payload.id);

    return this.runIdempotent<{ received: boolean; duplicate?: boolean; ignored?: boolean; orderId?: number }>(
      'processPaymentWebhookEvent',
      'webhook',
      payload.id,
      payload,
      async () => {
        if (payload.type !== 'payment.succeeded') {
          return { received: true, ignored: true };
        }

        const payment = await this.paymentsRepository.findOne({
          where: { intentId: payload.intentId },
          relations: ['order', 'order.user', 'order.shipment'],
        });

        if (!payment) {
          throw new NotFoundException('Payment not found for webhook event');
        }

        if (payment.status !== PaymentStatus.SUCCEEDED) {
          await this.commitReservationsForOrder(payment.order, correlationId);
          payment.status = PaymentStatus.SUCCEEDED;
          await this.paymentsRepository.save(payment);
        }

        if (payment.order.status !== OrderStatus.PAID) {
          await this.transitionOrderStatus(
            payment.order,
            OrderStatus.PAID,
            `Webhook processed (${payload.type})`,
            correlationId,
          );
        }

        return { received: true, orderId: payment.order.id };
      },
    );
  }

  private async recordOrderStatus(
    order: Order,
    status: OrderStatus,
    note?: string,
    correlationId?: string,
  ): Promise<void> {
    const annotatedNote = correlationId ? `${note || ''} [cid:${correlationId}]`.trim() : note;

    await this.orderStatusHistoryRepository.save(
      this.orderStatusHistoryRepository.create({
        order,
        status,
        note: annotatedNote,
      }),
    );
  }

  private async transitionOrderStatus(
    order: Order,
    nextStatus: OrderStatus,
    note: string,
    correlationId: string,
  ): Promise<void> {
    assertValidOrderTransition(order.status, nextStatus);
    const previousStatus = order.status;

    order.status = nextStatus;
    await this.ordersRepository.save(order);
    if (nextStatus === OrderStatus.CANCELLED) {
      await this.releaseReservationsForOrder(order, 'Order cancelled', correlationId);
    }
    await this.recordOrderStatus(order, nextStatus, note, correlationId);

    this.logger.log(
      `[cid:${correlationId}] Order #${order.id} transition ${previousStatus} -> ${nextStatus}`,
    );
  }

  private async withVariantLock<T>(variantId: number, handler: () => Promise<T>): Promise<T> {
    while (this.reservationLocks.has(variantId)) {
      await this.reservationLocks.get(variantId);
    }

    let release: () => void = () => undefined;
    const lock = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.reservationLocks.set(variantId, lock);

    try {
      return await handler();
    } finally {
      this.reservationLocks.delete(variantId);
      release();
    }
  }

  private reservationExpiryDate(): Date {
    const ttlMinutes = Number(process.env.INVENTORY_RESERVATION_TTL_MINUTES || 15);
    return new Date(Date.now() + Math.max(ttlMinutes, 1) * 60_000);
  }

  private async expireStaleReservations(): Promise<void> {
    const now = new Date();
    const activeReservations = await this.inventoryReservationsRepository.find({
      where: { status: InventoryReservationStatus.ACTIVE },
    });

    for (const reservation of activeReservations) {
      if (new Date(reservation.expiresAt) <= now) {
        reservation.status = InventoryReservationStatus.EXPIRED;
        await this.inventoryReservationsRepository.save(reservation);
      }
    }
  }

  private async activeReservationQuantityForVariant(variantId: number): Promise<number> {
    const now = new Date();
    const activeReservations = await this.inventoryReservationsRepository.find({
      where: { status: InventoryReservationStatus.ACTIVE },
      relations: ['variant'],
    });

    return activeReservations.reduce((sum, reservation) => {
      if (reservation.variant?.id !== variantId) {
        return sum;
      }
      if (new Date(reservation.expiresAt) <= now) {
        return sum;
      }
      return sum + Number(reservation.quantity || 0);
    }, 0);
  }

  private async reserveInventoryForOrder(
    order: Order,
    user?: User,
    sessionId?: string,
    correlationId?: string,
  ): Promise<void> {
    await this.expireStaleReservations();

    for (const item of order.items || []) {
      await this.withVariantLock(item.variant.id, async () => {
        const existing = await this.inventoryReservationsRepository.findOne({
          where: {
            order,
            status: InventoryReservationStatus.ACTIVE,
            variant: item.variant,
          },
        });

        if (existing && new Date(existing.expiresAt) > new Date()) {
          return;
        }

        if (existing) {
          existing.status = InventoryReservationStatus.EXPIRED;
          await this.inventoryReservationsRepository.save(existing);
        }

        const inventory = await this.inventoryRepository.findOne({
          where: { variant: item.variant },
        });
        if (!inventory) {
          throw new BadRequestException(`Inventory not found for SKU ${item.sku}`);
        }

        const activeReserved = await this.activeReservationQuantityForVariant(item.variant.id);
        const available =
          Number(inventory.quantity) - Number(inventory.reserved || 0) - activeReserved;
        if (available < item.quantity) {
          throw new BadRequestException(`Insufficient inventory for SKU ${item.sku}`);
        }

        await this.inventoryReservationsRepository.save(
          this.inventoryReservationsRepository.create({
            variant: item.variant,
            quantity: item.quantity,
            user,
            sessionId,
            status: InventoryReservationStatus.ACTIVE,
            expiresAt: this.reservationExpiryDate(),
            order,
          }),
        );

        this.logger.log(
          `[cid:${correlationId || 'none'}] Reserved ${item.quantity} unit(s) for variant #${item.variant.id} on order #${order.id}`,
        );
      });
    }
  }

  private async commitReservationsForOrder(order: Order, correlationId?: string): Promise<void> {
    await this.expireStaleReservations();

    for (const item of order.items || []) {
      await this.withVariantLock(item.variant.id, async () => {
        const activeReservation = await this.inventoryReservationsRepository.findOne({
          where: {
            order,
            status: InventoryReservationStatus.ACTIVE,
            variant: item.variant,
          },
        });

        if (!activeReservation) {
          const committedReservation = await this.inventoryReservationsRepository.findOne({
            where: {
              order,
              status: InventoryReservationStatus.COMMITTED,
              variant: item.variant,
            },
          });

          if (committedReservation) {
            return;
          }

          throw new BadRequestException(`No active reservation found for SKU ${item.sku}`);
        }

        if (new Date(activeReservation.expiresAt) <= new Date()) {
          activeReservation.status = InventoryReservationStatus.EXPIRED;
          await this.inventoryReservationsRepository.save(activeReservation);
          throw new BadRequestException(`Reservation expired for SKU ${item.sku}`);
        }

        const inventory = await this.inventoryRepository.findOne({
          where: { variant: item.variant },
        });
        if (!inventory) {
          throw new BadRequestException(`Inventory not found for SKU ${item.sku}`);
        }

        inventory.quantity = Number(inventory.quantity) - Number(activeReservation.quantity);
        if (inventory.quantity < 0) {
          throw new BadRequestException(`Insufficient inventory for SKU ${item.sku}`);
        }
        await this.inventoryRepository.save(inventory);

        activeReservation.status = InventoryReservationStatus.COMMITTED;
        await this.inventoryReservationsRepository.save(activeReservation);

        this.logger.log(
          `[cid:${correlationId || 'none'}] Committed reservation ${activeReservation.reservationId} for order #${order.id}`,
        );
      });
    }
  }

  private async releaseReservationsForOrder(
    order: Order,
    reason: string,
    correlationId?: string,
  ): Promise<void> {
    const activeReservations = await this.inventoryReservationsRepository.find({
      where: { order, status: InventoryReservationStatus.ACTIVE },
    });

    for (const reservation of activeReservations) {
      reservation.status = InventoryReservationStatus.RELEASED;
      await this.inventoryReservationsRepository.save(reservation);
      this.logger.log(
        `[cid:${correlationId || 'none'}] Released reservation ${reservation.reservationId} (${reason})`,
      );
    }
  }

  private resolveIdempotencyScope(user?: User, sessionId?: string): string {
    if (user?.id) {
      return `user:${user.id}`;
    }
    return `session:${sessionId || 'anonymous'}`;
  }

  private requestHash(payload: unknown): string {
    return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  private buildCorrelationId(operation: string, idempotencyKey?: string): string {
    const suffix = idempotencyKey ? idempotencyKey.slice(0, 12) : Date.now().toString();
    return `${operation}-${suffix}`;
  }

  private async runIdempotent<T>(
    operation: string,
    scopeKey: string,
    idempotencyKey: string | undefined,
    requestPayload: unknown,
    handler: () => Promise<T>,
  ): Promise<T> {
    if (!idempotencyKey) {
      return handler();
    }

    const requestHash = this.requestHash(requestPayload);
    const existing = await this.idempotencyRepository.findOne({
      where: { scopeKey, operation, idempotencyKey },
    });

    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new BadRequestException(
          `Idempotency key "${idempotencyKey}" was reused with a different payload`,
        );
      }
      return existing.responseSnapshot as T;
    }

    const response = await handler();
    const record = this.idempotencyRepository.create({
      scopeKey,
      operation,
      idempotencyKey,
      requestHash,
      responseSnapshot: response as any,
    });
    await this.idempotencyRepository.save(record);
    return response;
  }

  private assertValidWebhookSignature(
    payload: Record<string, unknown>,
    signatureHeader?: string,
  ): void {
    const secret = process.env.PAYMENTS_WEBHOOK_SECRET;
    if (!secret) {
      throw new UnauthorizedException('PAYMENTS_WEBHOOK_SECRET is not configured');
    }

    if (!signatureHeader) {
      throw new UnauthorizedException('Missing webhook signature');
    }

    const normalizedSignature = signatureHeader.replace(/^sha256=/, '');
    const expected = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

    const a = Buffer.from(normalizedSignature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  private async saveOrUpdateAddress(
    user: User,
    input: { fullName: string; line1: string; city: string; region: string; postalCode: string },
  ): Promise<void> {
    const existing = await this.addressBookRepository.findOne({
      where: {
        user,
        line1: input.line1,
        city: input.city,
        region: input.region,
        postalCode: input.postalCode,
      },
    });

    if (existing) {
      existing.fullName = input.fullName;
      await this.addressBookRepository.save(existing);
      return;
    }

    const hasDefault = await this.addressBookRepository.findOne({
      where: { user, isDefault: true },
    });

    await this.addressBookRepository.save(
      this.addressBookRepository.create({
        user,
        fullName: input.fullName,
        line1: input.line1,
        city: input.city,
        region: input.region,
        postalCode: input.postalCode,
        isDefault: !hasDefault,
      }),
    );
  }

  private async upsertCheckoutProfile(
    user: User,
    input: {
      shippingName?: string;
      shippingLine1?: string;
      shippingCity?: string;
      shippingRegion?: string;
      shippingPostalCode?: string;
      cardholderName?: string;
      cardLast4?: string;
      cardExpiry?: string;
    },
  ): Promise<void> {
    let profile = await this.checkoutProfileRepository.findOne({ where: { user } });

    if (!profile) {
      profile = this.checkoutProfileRepository.create({ user });
    }

    Object.assign(profile, {
      shippingName: input.shippingName ?? profile.shippingName,
      shippingLine1: input.shippingLine1 ?? profile.shippingLine1,
      shippingCity: input.shippingCity ?? profile.shippingCity,
      shippingRegion: input.shippingRegion ?? profile.shippingRegion,
      shippingPostalCode: input.shippingPostalCode ?? profile.shippingPostalCode,
      cardholderName: input.cardholderName ?? profile.cardholderName,
      cardLast4: input.cardLast4 ?? profile.cardLast4,
      cardExpiry: input.cardExpiry ?? profile.cardExpiry,
    });

    await this.checkoutProfileRepository.save(profile);
  }
}
