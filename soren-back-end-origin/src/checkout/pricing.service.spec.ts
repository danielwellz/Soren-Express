import { CouponType } from 'src/common/enums';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(() => {
    service = new PricingService();
  });

  it('calculates totals with percent coupon, shipping, and tax', () => {
    const totals = service.calculateTotals({
      subtotal: 200,
      coupon: {
        active: true,
        type: CouponType.PERCENT,
        amount: 10,
        minOrderAmount: 100,
      } as any,
      shippingRule: {
        flatRate: 12,
        freeShippingOver: 500,
      } as any,
      taxRule: {
        rate: 0.08,
      } as any,
    });

    expect(totals.subtotal).toBe(200);
    expect(totals.discount).toBe(20);
    expect(totals.shipping).toBe(12);
    expect(totals.tax).toBe(14.4);
    expect(totals.total).toBe(206.4);
  });

  it('caps fixed discount at subtotal', () => {
    const totals = service.calculateTotals({
      subtotal: 30,
      coupon: {
        active: true,
        type: CouponType.FIXED,
        amount: 100,
        minOrderAmount: 0,
      } as any,
      shippingRule: {
        flatRate: 5,
        freeShippingOver: 100,
      } as any,
      taxRule: {
        rate: 0.05,
      } as any,
    });

    expect(totals.discount).toBe(30);
    expect(totals.total).toBe(5);
  });
});
