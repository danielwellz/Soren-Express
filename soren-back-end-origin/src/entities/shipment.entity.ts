import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Order } from './order.entity';
import { ShipmentStatus } from 'src/common/enums';

@ObjectType()
@Entity({ name: 'shipments' })
export class Shipment {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => ShipmentStatus)
  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.PENDING })
  status: ShipmentStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  carrier?: string;

  @Field({ nullable: true })
  @Column({ name: 'tracking_number', nullable: true })
  trackingNumber?: string;

  @Field({ nullable: true })
  @Column({ name: 'shipped_at', nullable: true })
  shippedAt?: Date;

  @Field({ nullable: true })
  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt?: Date;

  @OneToOne(() => Order, (order) => order.shipment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
