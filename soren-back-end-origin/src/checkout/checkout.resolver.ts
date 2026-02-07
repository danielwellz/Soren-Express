import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Order, User } from 'src/entities';
import {
  ConfirmPaymentInput,
  CreateOrderInput,
  CreatePaymentIntentInput,
  CheckoutTotalsInput,
} from './checkout.inputs';
import {
  CheckoutPreview,
  ConfirmPaymentPayload,
  PaymentIntentPayload,
} from './checkout.types';
import { CheckoutService } from './checkout.service';

@Resolver()
export class CheckoutResolver {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Query(() => CheckoutPreview)
  async checkoutPreview(
    @Args('input') input: CheckoutTotalsInput,
    @CurrentUser() user?: User,
  ): Promise<CheckoutPreview> {
    return this.checkoutService.previewTotals(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Order)
  async createOrder(
    @Args('input') input: CreateOrderInput,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.checkoutService.createOrder(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PaymentIntentPayload)
  async createPaymentIntent(
    @Args('input') input: CreatePaymentIntentInput,
    @CurrentUser() user: User,
  ): Promise<PaymentIntentPayload> {
    return this.checkoutService.createPaymentIntent(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ConfirmPaymentPayload)
  async confirmPayment(
    @Args('input') input: ConfirmPaymentInput,
    @CurrentUser() user: User,
  ): Promise<ConfirmPaymentPayload> {
    return this.checkoutService.confirmPayment(input, user);
  }
}
