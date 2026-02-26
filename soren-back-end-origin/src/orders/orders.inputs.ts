import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateReturnRequestInput {
  @Field(() => Int)
  @IsInt()
  orderId: number;

  @Field()
  @IsString()
  reason: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  exchangePreferred?: boolean;
}
