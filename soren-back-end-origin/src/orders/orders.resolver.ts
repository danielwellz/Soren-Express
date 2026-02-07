import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Order, User } from 'src/entities';
import { OrdersService } from './orders.service';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [Order])
  async myOrders(@CurrentUser() user: User): Promise<Order[]> {
    return this.ordersService.myOrders(user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Order)
  async orderById(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.orderById(id, user);
  }
}
