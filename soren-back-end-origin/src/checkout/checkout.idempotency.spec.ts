import { CheckoutService } from './checkout.service';

describe('CheckoutService idempotency', () => {
  it('prevents duplicate order creation on retry with same Idempotency-Key', async () => {
    const user = { id: 42, email: 'customer@example.com' } as any;
    const cart = {
      id: 5,
      promoCode: null,
      active: true,
      items: [
        {
          variant: {
            product: { name: 'Headphones' },
            color: 'Black',
            size: 'One Size',
            sku: 'SKU-1',
          },
          quantity: 1,
          unitPrice: 100,
        },
      ],
    } as any;

    const cartsRepository = { save: jest.fn(async (value) => value) } as any;
    const couponsRepository = { findOne: jest.fn().mockResolvedValue(null) } as any;
    const taxRulesRepository = { findOne: jest.fn().mockResolvedValue({ rate: 0 }) } as any;
    const shippingRulesRepository = { findOne: jest.fn().mockResolvedValue({ flatRate: 0 }) } as any;

    const savedOrder = {
      id: 9001,
      user,
      items: [],
      status: 'CREATED',
      total: 100,
      shippingName: 'Customer Name',
      shippingAddress: '123 Main St',
      shippingCity: 'Austin',
      shippingRegion: 'US-TX',
      shippingPostalCode: '78701',
    } as any;

    const ordersRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async () => savedOrder),
      findOne: jest.fn(async () => savedOrder),
    } as any;

    const orderItemsRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    } as any;

    const orderStatusHistoryRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    } as any;

    const checkoutProfileRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    } as any;

    const keyFor = (scope: string, operation: string, key: string) => `${scope}|${operation}|${key}`;
    const idempotencyStore = new Map<string, any>();
    const idempotencyRepository = {
      findOne: jest.fn(async ({ where }) =>
        idempotencyStore.get(keyFor(where.scopeKey, where.operation, where.idempotencyKey)) || null,
      ),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => {
        idempotencyStore.set(keyFor(value.scopeKey, value.operation, value.idempotencyKey), value);
        return value;
      }),
    } as any;

    const inventoryReservationsRepository = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    } as any;

    const cartService = {
      getCartForUserOrSession: jest.fn().mockResolvedValue(cart),
      clearCart: jest.fn().mockResolvedValue(undefined),
    } as any;

    const pricingService = {
      calculateTotals: jest.fn().mockReturnValue({
        subtotal: 100,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 100,
      }),
    } as any;

    const service = new CheckoutService(
      cartsRepository,
      couponsRepository,
      taxRulesRepository,
      shippingRulesRepository,
      ordersRepository,
      orderItemsRepository,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      checkoutProfileRepository,
      orderStatusHistoryRepository,
      idempotencyRepository,
      inventoryReservationsRepository,
      cartService,
      pricingService,
      { trackEvent: jest.fn().mockResolvedValue(undefined) } as any,
      { sendEmail: jest.fn(), sendSms: jest.fn() } as any,
    );

    const input = {
      shippingName: 'Customer Name',
      shippingAddress: '123 Main St',
      shippingCity: 'Austin',
      shippingRegion: 'US-TX',
      shippingPostalCode: '78701',
      sessionId: 'guest-1',
      saveCheckoutProfile: false,
    } as any;

    const first = await service.createOrder(input, user, 'idem-create-order-1');
    const second = await service.createOrder(input, user, 'idem-create-order-1');

    expect(first.id).toBe(9001);
    expect(second.id).toBe(9001);
    expect(ordersRepository.save).toHaveBeenCalledTimes(1);
    expect(orderItemsRepository.save).toHaveBeenCalledTimes(1);
    expect(cartService.getCartForUserOrSession).toHaveBeenCalledTimes(1);
  });
});
