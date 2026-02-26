import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CouponType, OrderStatus, UserRole } from 'src/common/enums';

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

@InputType()
export class UpdateCategoryInput extends CreateCategoryInput {
  @Field(() => Int)
  id: number;
}

@InputType()
export class CreateBrandInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

@InputType()
export class UpdateBrandInput extends CreateBrandInput {
  @Field(() => Int)
  id: number;
}

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Field()
  slug: string;

  @Field()
  description: string;

  @Field()
  basePrice: number;

  @Field(() => Int)
  categoryId: number;

  @Field(() => Int)
  brandId: number;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field(() => [String], { nullable: true })
  galleryUrls?: string[];

  @Field({ defaultValue: false })
  isFeatured: boolean;

  @Field({ defaultValue: true })
  published: boolean;
}

@InputType()
export class UpdateProductInput extends CreateProductInput {
  @Field(() => Int)
  id: number;
}

@InputType()
export class CreateVariantInput {
  @Field(() => Int)
  productId: number;

  @Field()
  sku: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  size?: string;

  @Field({ defaultValue: 0 })
  priceAdjustment: number;

  @Field(() => Int, { defaultValue: 0 })
  inventoryQuantity: number;
}

@InputType()
export class UpdateInventoryInput {
  @Field(() => Int)
  variantId: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int, { nullable: true })
  lowStockThreshold?: number;
}

@InputType()
export class CreateCouponInput {
  @Field()
  code: string;

  @Field(() => CouponType)
  type: CouponType;

  @Field()
  amount: number;

  @Field({ defaultValue: 0 })
  minOrderAmount: number;

  @Field({ defaultValue: true })
  active: boolean;

  @Field({ nullable: true })
  expiresAt?: Date;
}

@InputType()
export class UpdateCouponInput extends CreateCouponInput {
  @Field(() => Int)
  id: number;
}

@InputType()
export class UpdateUserRoleInput {
  @Field(() => Int)
  userId: number;

  @Field(() => UserRole)
  role: UserRole;
}

@InputType()
export class UpdateUserStatusInput {
  @Field(() => Int)
  userId: number;

  @Field()
  active: boolean;
}

@InputType()
export class UpdateOrderStatusInput {
  @Field(() => Int)
  orderId: number;

  @Field(() => OrderStatus)
  status: OrderStatus;
}

@InputType()
export class UpsertTaxRuleInput {
  @Field()
  region: string;

  @Field()
  rate: number;

  @Field({ defaultValue: true })
  active: boolean;
}

@InputType()
export class UpsertShippingRuleInput {
  @Field()
  region: string;

  @Field()
  flatRate: number;

  @Field({ defaultValue: 0 })
  freeShippingOver: number;

  @Field({ defaultValue: true })
  active: boolean;
}
