import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import {
  AddressBookEntry,
  AnalyticsEvent,
  CheckoutProfile,
  Product,
  SupportMessage,
  User,
} from 'src/entities';
import {
  BackInStockSubscriptionInput,
  ClientAnalyticsInput,
  NewsletterSubscriptionInput,
  SaveAddressInput,
  SupportMessageInput,
  UpdateAddressInput,
  WishlistProductInput,
} from './customer.inputs';
import { CustomerService } from './customer.service';
import { ActionResponse } from './customer.types';

@Resolver()
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [Product])
  async myWishlist(@CurrentUser() user: User): Promise<Product[]> {
    return this.customerService.myWishlist(user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Product])
  async addToWishlist(
    @Args('input') input: WishlistProductInput,
    @CurrentUser() user: User,
  ): Promise<Product[]> {
    return this.customerService.addToWishlist(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Product])
  async removeFromWishlist(
    @Args('input') input: WishlistProductInput,
    @CurrentUser() user: User,
  ): Promise<Product[]> {
    return this.customerService.removeFromWishlist(input, user);
  }

  @Mutation(() => ActionResponse)
  async subscribeBackInStock(
    @Args('input') input: BackInStockSubscriptionInput,
    @CurrentUser() user?: User,
  ): Promise<ActionResponse> {
    return this.customerService.subscribeBackInStock(input, user);
  }

  @Mutation(() => ActionResponse)
  async subscribeNewsletter(
    @Args('input') input: NewsletterSubscriptionInput,
  ): Promise<ActionResponse> {
    return this.customerService.subscribeNewsletter(input);
  }

  @Mutation(() => SupportMessage)
  async submitSupportMessage(
    @Args('input') input: SupportMessageInput,
    @CurrentUser() user?: User,
  ): Promise<SupportMessage> {
    return this.customerService.submitSupportMessage(input, user);
  }

  @Mutation(() => AnalyticsEvent)
  async trackClientAnalytics(
    @Args('input') input: ClientAnalyticsInput,
    @CurrentUser() user?: User,
  ): Promise<AnalyticsEvent> {
    return this.customerService.trackClientAnalytics(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [AddressBookEntry])
  async myAddresses(@CurrentUser() user: User): Promise<AddressBookEntry[]> {
    return this.customerService.myAddresses(user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AddressBookEntry)
  async saveAddress(
    @Args('input') input: SaveAddressInput,
    @CurrentUser() user: User,
  ): Promise<AddressBookEntry> {
    return this.customerService.saveAddress(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AddressBookEntry)
  async updateAddress(
    @Args('input') input: UpdateAddressInput,
    @CurrentUser() user: User,
  ): Promise<AddressBookEntry> {
    return this.customerService.updateAddress(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteAddress(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.customerService.deleteAddress(id, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AddressBookEntry)
  async setDefaultAddress(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<AddressBookEntry> {
    return this.customerService.setDefaultAddress(id, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => CheckoutProfile, { nullable: true })
  async myCheckoutProfile(@CurrentUser() user: User): Promise<CheckoutProfile> {
    return this.customerService.myCheckoutProfile(user);
  }
}
