import { Field, InputType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { IsEmail, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class WishlistProductInput {
  @Field(() => Int)
  @IsInt()
  productId: number;
}

@InputType()
export class BackInStockSubscriptionInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  productId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  variantId?: number;

  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class NewsletterSubscriptionInput {
  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  locale?: string;
}

@InputType()
export class SupportMessageInput {
  @Field()
  @IsString()
  @MaxLength(1500)
  message: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;
}

@InputType()
export class ClientAnalyticsInput {
  @Field()
  @IsString()
  eventType: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  productId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  orderId?: number;
}

@InputType()
export class SaveAddressInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  label?: string;

  @Field()
  @IsString()
  fullName: string;

  @Field()
  @IsString()
  line1: string;

  @Field()
  @IsString()
  city: string;

  @Field()
  @IsString()
  region: string;

  @Field()
  @IsString()
  postalCode: string;

  @Field({ defaultValue: false })
  @IsOptional()
  isDefault?: boolean;
}

@InputType()
export class UpdateAddressInput extends SaveAddressInput {
  @Field(() => Int)
  @IsInt()
  id: number;
}
