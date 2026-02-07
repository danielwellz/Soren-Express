import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus, ReturnRequestStatus } from 'src/common/enums';
import { Order, OrderStatusHistory, ReturnRequest, User } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateReturnRequestInput } from './orders.inputs';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderStatusHistory)
    private readonly orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    @InjectRepository(ReturnRequest)
    private readonly returnRequestsRepository: Repository<ReturnRequest>,
  ) {}

  async myOrders(user: User): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user },
      relations: [
        'items',
        'items.variant',
        'items.variant.product',
        'payment',
        'shipment',
        'coupon',
        'statusHistory',
        'returnRequests',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async orderById(id: number, user: User): Promise<Order> {
    const order = await this.ordersRepository.findOne(id, {
      relations: [
        'user',
        'items',
        'items.variant',
        'items.variant.product',
        'payment',
        'shipment',
        'coupon',
        'statusHistory',
        'returnRequests',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user.id !== user.id) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async allOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: [
        'user',
        'items',
        'items.variant',
        'items.variant.product',
        'payment',
        'shipment',
        'coupon',
        'statusHistory',
        'returnRequests',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async orderStatusTimeline(orderId: number, user: User): Promise<OrderStatusHistory[]> {
    const order = await this.orderById(orderId, user);
    const history = await this.orderStatusHistoryRepository.find({
      where: { order },
      order: { createdAt: 'ASC' },
    });

    if (history.length) {
      return history;
    }

    const created = await this.orderStatusHistoryRepository.save(
      this.orderStatusHistoryRepository.create({
        order,
        status: order.status || OrderStatus.CREATED,
        note: 'Current order status',
      }),
    );

    return [created];
  }

  async createReturnRequest(input: CreateReturnRequestInput, user: User): Promise<ReturnRequest> {
    const order = await this.orderById(input.orderId, user);

    const existing = await this.returnRequestsRepository.findOne({
      where: { order },
      order: { createdAt: 'DESC' },
    });

    if (existing && existing.status !== ReturnRequestStatus.REJECTED) {
      return existing;
    }

    return this.returnRequestsRepository.save(
      this.returnRequestsRepository.create({
        order,
        user,
        reason: input.reason,
        exchangePreferred: Boolean(input.exchangePreferred),
      }),
    );
  }

  async myReturnRequests(user: User): Promise<ReturnRequest[]> {
    return this.returnRequestsRepository.find({
      where: { user },
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }
}
