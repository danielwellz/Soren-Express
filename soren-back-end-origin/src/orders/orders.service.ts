import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, User } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async myOrders(user: User): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user },
      relations: ['items', 'items.variant', 'items.variant.product', 'payment', 'shipment', 'coupon'],
      order: { createdAt: 'DESC' },
    });
  }

  async orderById(id: number, user: User): Promise<Order> {
    const order = await this.ordersRepository.findOne(id, {
      relations: ['user', 'items', 'items.variant', 'items.variant.product', 'payment', 'shipment', 'coupon'],
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
      relations: ['user', 'items', 'items.variant', 'items.variant.product', 'payment', 'shipment', 'coupon'],
      order: { createdAt: 'DESC' },
    });
  }
}
