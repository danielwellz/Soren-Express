import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Order, User } from 'src/entities';
import {
  ConfirmPaymentInput,
  CreateOrderInput,
  CreatePaymentIntentInput,
  CheckoutTotalsInput,
  ShippingEstimateInput,
} from './checkout.inputs';
import {
  CheckoutPreview,
  ConfirmPaymentPayload,
  PaymentIntentPayload,
  ShippingEstimate,
} from './checkout.types';
import { CheckoutService } from './checkout.service';

@Resolver()
export class CheckoutResolver {
  constructor(private readonly checkoutService: CheckoutService) {}

  private getIdempotencyKey(context: any): string | undefined {
    return context?.req?.headers?.['idempotency-key'];
  }

  @Query(() => CheckoutPreview)
  async checkoutPreview(
    @Args('input') input: CheckoutTotalsInput,
    @CurrentUser() user?: User,
  ): Promise<CheckoutPreview> {
    return this.checkoutService.previewTotals(input, user);
  }

  @Query(() => ShippingEstimate)
  async shippingEstimate(
    @Args('input') input: ShippingEstimateInput,
  ): Promise<ShippingEstimate> {
    return this.checkoutService.getShippingEstimate(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Order)
  async createOrder(
    @Args('input') input: CreateOrderInput,
    @CurrentUser() user: User,
    @Context() context: any,
  ): Promise<Order> {
    return this.checkoutService.createOrder(input, user, this.getIdempotencyKey(context));
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PaymentIntentPayload)
  async createPaymentIntent(
    @Args('input') input: CreatePaymentIntentInput,
    @CurrentUser() user: User,
    @Context() context: any,
  ): Promise<PaymentIntentPayload> {
    return this.checkoutService.createPaymentIntent(input, user, this.getIdempotencyKey(context));
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ConfirmPaymentPayload)
  async confirmPayment(
    @Args('input') input: ConfirmPaymentInput,
    @CurrentUser() user: User,
    @Context() context: any,
  ): Promise<ConfirmPaymentPayload> {
    return this.checkoutService.confirmPayment(input, user, this.getIdempotencyKey(context));
  }
}
