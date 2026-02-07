import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Product, ProductVariant } from 'src/entities';

@ObjectType()
export class ProductListResult {
  @Field(() => [Product])
  items: Product[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;
}

@ObjectType()
export class ProductDetail extends Product {
  @Field(() => [ProductVariant], { nullable: true })
  variants: ProductVariant[];

  @Field(() => [Product], { nullable: true })
  relatedProducts: Product[];
}
