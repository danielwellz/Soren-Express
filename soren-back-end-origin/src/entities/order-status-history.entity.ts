import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OrderStatus } from 'src/common/enums';
import { Order } from './order.entity';

@ObjectType()
@Entity({ name: 'order_status_history' })
export class OrderStatusHistory {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.statusHistory, { onDelete: 'CASCADE' })
  order: Order;

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  note?: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
