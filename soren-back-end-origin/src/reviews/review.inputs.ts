import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ReviewStatus } from 'src/common/enums';

@InputType()
export class CreateReviewInput {
  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Field()
  @IsString()
  comment: string;
}

@InputType()
export class ReviewFilterInput {
  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field(() => ReviewStatus, { nullable: true })
  @IsOptional()
  status?: ReviewStatus;
}

@InputType()
export class ModerateReviewInput {
  @Field(() => Int)
  @IsInt()
  reviewId: number;

  @Field(() => ReviewStatus)
  status: ReviewStatus;
}
