import { Injectable } from '@nestjs/common';
import { Coupon, ShippingRule, TaxRule } from 'src/entities';
import { CouponType } from 'src/common/enums';
import { CheckoutTotals } from './checkout.types';

@Injectable()
export class PricingService {
  calculateTotals(params: {
    subtotal: number;
    coupon?: Coupon;
    shippingRule?: ShippingRule;
    taxRule?: TaxRule;
  }): CheckoutTotals {
    const { subtotal, coupon, shippingRule, taxRule } = params;

    let discount = 0;
    if (coupon && coupon.active && subtotal >= Number(coupon.minOrderAmount)) {
      if (coupon.type === CouponType.PERCENT) {
        discount = Number(subtotal) * (Number(coupon.amount) / 100);
      } else {
        discount = Number(coupon.amount);
      }
    }

    if (discount > subtotal) {
      discount = subtotal;
    }

    const discountedSubtotal = subtotal - discount;
    const shipping = shippingRule
      ? discountedSubtotal >= Number(shippingRule.freeShippingOver)
        ? 0
        : Number(shippingRule.flatRate)
      : 0;
    const tax = taxRule ? discountedSubtotal * Number(taxRule.rate) : 0;
    const total = discountedSubtotal + shipping + tax;

    return {
      subtotal: this.round(subtotal),
      discount: this.round(discount),
      shipping: this.round(shipping),
      tax: this.round(tax),
      total: this.round(total),
      coupon,
    };
  }

  private round(value: number): number {
    return Number(value.toFixed(2));
  }
}
