import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/common/enums';
import { Review, User } from 'src/entities';
import {
  CreateReviewInput,
  ModerateReviewInput,
  ReviewFilterInput,
} from './review.inputs';
import { ReviewsService } from './reviews.service';

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Review)
  async createReview(
    @Args('input') input: CreateReviewInput,
    @CurrentUser() user: User,
  ): Promise<Review> {
    return this.reviewsService.createReview(input, user);
  }

  @Query(() => [Review])
  async reviews(@Args('filter') filter: ReviewFilterInput): Promise<Review[]> {
    return this.reviewsService.listReviews(filter);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => Review)
  async moderateReview(@Args('input') input: ModerateReviewInput): Promise<Review> {
    return this.reviewsService.moderateReview(input);
  }
}
