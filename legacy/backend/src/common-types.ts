import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class ProductReturnType {
  @Field({ nullable: true })
  success?: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => Product, { nullable: true })
  product?: Product;
}

@ObjectType()
export class VerificationResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class VerificationResult {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  user?: User;
}
