import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  type: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  brand: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  model: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subType: string;

  @Field()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  color: string;

  @Field()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10000000)
  description?: string;

  @Field({ nullable: true, defaultValue: null })
  id?: number; // Set id field as nullable with a default value of null
}
