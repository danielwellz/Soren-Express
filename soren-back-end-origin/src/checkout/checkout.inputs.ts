import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

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
}
