import { CheckoutService } from './checkout.service';

describe('CheckoutService calculateTotals', () => {
  it('resolves coupon + tax + shipping from repositories', async () => {
    const couponsRepository = { findOne: jest.fn() };
    const taxRulesRepository = { findOne: jest.fn() };
    const shippingRulesRepository = { findOne: jest.fn() };

    const service = new CheckoutService(
      {} as any,
      couponsRepository as any,
      taxRulesRepository as any,
      shippingRulesRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } as any,
      { getCartForUserOrSession: jest.fn(), clearCart: jest.fn() } as any,
      {
        calculateTotals: jest.fn().mockReturnValue({
          subtotal: 100,
          discount: 10,
          shipping: 5,
          tax: 7,
          total: 102,
        }),
      } as any,
      { trackEvent: jest.fn() } as any,
      { sendEmail: jest.fn(), sendSms: jest.fn() } as any,
    );

    couponsRepository.findOne.mockResolvedValue({ code: 'WELCOME10', active: true });
    taxRulesRepository.findOne.mockResolvedValue({ region: 'US-CA', rate: 0.07 });
    shippingRulesRepository.findOne.mockResolvedValue({
      region: 'US-CA',
      flatRate: 5,
      freeShippingOver: 150,
    });

    const totals = await service.calculateTotals(
      {
        items: [{ unitPrice: 50, quantity: 2 }],
      } as any,
      'US-CA',
      'WELCOME10',
    );

    expect(couponsRepository.findOne).toHaveBeenCalled();
    expect(taxRulesRepository.findOne).toHaveBeenCalledWith({
      where: { region: 'US-CA', active: true },
    });
    expect(shippingRulesRepository.findOne).toHaveBeenCalledWith({
      where: { region: 'US-CA', active: true },
    });
    expect(totals.total).toBe(102);
  });
});
