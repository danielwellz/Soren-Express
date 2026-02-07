import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CreateProductInput } from './create-product.input';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  type?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sub_type?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  price?: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  color: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10000000)
  description?: string;
}
