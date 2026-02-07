import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class ProductFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  categoryIds?: number[];

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  brandIds?: number[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  colors?: string[];

  @Field({ nullable: true })
  @IsOptional()
  minPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  maxPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  inStockOnly?: boolean;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number;

  @Field(() => Int, { defaultValue: 12 })
  @IsInt()
  @Min(1)
  @Max(60)
  pageSize: number;
}

@InputType()
export class SortInput {
  @Field({ defaultValue: 'createdAt' })
  @IsString()
  field: string;

  @Field({ defaultValue: 'DESC' })
  @IsString()
  direction: 'ASC' | 'DESC';
}
