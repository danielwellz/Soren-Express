import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class ProductFilterInput {
  @Field(() => [String], { nullable: true })
  type?: string[];

  @Field(() => [String], { nullable: true })
  brand?: string[];

  @Field(() => [String], { nullable: true })
  subType?: string[];

  @Field(() => String, { nullable: true })
  color?: string;

  @Field(() => Int, { nullable: true })
  minPrice?: number;

  @Field(() => Int, { nullable: true })
  maxPrice?: number;
}
@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}
