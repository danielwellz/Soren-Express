import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class CartContextInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

@InputType()
export class AddCartItemInput {
  @Field(() => Int)
  @IsInt()
  variantId: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

@InputType()
export class UpdateCartItemInput {
  @Field(() => Int)
  @IsInt()
  cartItemId: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

@InputType()
export class RemoveCartItemInput {
  @Field(() => Int)
  @IsInt()
  cartItemId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

@InputType()
export class MergeGuestCartInput {
  @Field()
  @IsString()
  sessionId: string;
}
