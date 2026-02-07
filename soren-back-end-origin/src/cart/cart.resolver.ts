import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Cart, User } from 'src/entities';
import {
  AddCartItemInput,
  CartContextInput,
  MergeGuestCartInput,
  RemoveCartItemInput,
  UpdateCartItemInput,
} from './cart.inputs';
import { CartService } from './cart.service';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => Cart)
  async cart(
    @Args('context', { nullable: true }) context?: CartContextInput,
    @CurrentUser() user?: User,
  ): Promise<Cart> {
    return this.cartService.getCartForUserOrSession(user, context?.sessionId);
  }

  @Mutation(() => Cart)
  async addToCart(
    @Args('input') input: AddCartItemInput,
    @CurrentUser() user?: User,
  ): Promise<Cart> {
    return this.cartService.addItem(input, user);
  }

  @Mutation(() => Cart)
  async updateCartItem(
    @Args('input') input: UpdateCartItemInput,
    @CurrentUser() user?: User,
  ): Promise<Cart> {
    return this.cartService.updateItem(input, user);
  }

  @Mutation(() => Cart)
  async removeCartItem(
    @Args('input') input: RemoveCartItemInput,
    @CurrentUser() user?: User,
  ): Promise<Cart> {
    return this.cartService.removeItem(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Cart)
  async mergeGuestCart(
    @Args('input') input: MergeGuestCartInput,
    @CurrentUser() user: User,
  ): Promise<Cart> {
    return this.cartService.mergeGuestCartToUser(input, user);
  }
}
