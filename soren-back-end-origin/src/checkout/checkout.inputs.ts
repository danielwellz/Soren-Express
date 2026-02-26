import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CheckoutTotalsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @Field()
  @IsString()
  region: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

@InputType()
export class CreateOrderInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  savedAddressId?: number;

  @Field()
  @IsString()
  shippingName: string;

  @Field()
  @IsString()
  shippingAddress: string;

  @Field()
  @IsString()
  shippingCity: string;

  @Field()
  @IsString()
  shippingRegion: string;

  @Field()
  @IsString()
  shippingPostalCode: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @Field({ defaultValue: false })
  @IsOptional()
  saveAddress?: boolean;

  @Field({ defaultValue: true })
  @IsOptional()
  saveCheckoutProfile?: boolean;
}

@InputType()
export class CreatePaymentIntentInput {
  @Field(() => Int)
  @IsInt()
  orderId: number;
}

@InputType()
export class ConfirmPaymentInput {
  @Field()
  @IsString()
  intentId: string;

  @Field({ defaultValue: '4242' })
  @IsString()
  cardLast4: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cardholderName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cardExpiry?: string;
}

@InputType()
export class ShippingEstimateInput {
  @Field()
  @IsString()
  region: string;

  @Field()
  @IsNumber()
  subtotal: number;
}
