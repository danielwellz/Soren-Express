import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Mutation } from '@nestjs/graphql';
import { Order, OrderStatusHistory, ReturnRequest, User } from 'src/entities';
import { OrdersService } from './orders.service';
import { CreateReturnRequestInput } from './orders.inputs';

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

  @UseGuards(GqlAuthGuard)
  @Query(() => [OrderStatusHistory])
  async orderStatusTimeline(
    @Args('orderId', { type: () => Int }) orderId: number,
    @CurrentUser() user: User,
  ): Promise<OrderStatusHistory[]> {
    return this.ordersService.orderStatusTimeline(orderId, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ReturnRequest)
  async createReturnRequest(
    @Args('input') input: CreateReturnRequestInput,
    @CurrentUser() user: User,
  ): Promise<ReturnRequest> {
    return this.ordersService.createReturnRequest(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [ReturnRequest])
  async myReturnRequests(@CurrentUser() user: User): Promise<ReturnRequest[]> {
    return this.ordersService.myReturnRequests(user);
  }
}
