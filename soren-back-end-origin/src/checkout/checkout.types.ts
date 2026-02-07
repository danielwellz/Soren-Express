import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Cart, Coupon, Order, Payment } from 'src/entities';

@ObjectType()
export class CheckoutTotals {
  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  shipping: number;

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  total: number;

  @Field(() => Coupon, { nullable: true })
  coupon?: Coupon;
}

@ObjectType()
export class CheckoutPreview {
  @Field(() => Cart)
  cart: Cart;

  @Field(() => CheckoutTotals)
  totals: CheckoutTotals;
}

@ObjectType()
export class PaymentIntentPayload {
  @Field(() => Payment)
  payment: Payment;

  @Field()
  clientSecret: string;
}

@ObjectType()
export class ConfirmPaymentPayload {
  @Field(() => Order)
  order: Order;

  @Field(() => Payment)
  payment: Payment;
}
