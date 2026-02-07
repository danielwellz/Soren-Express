import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { Shipment } from './shipment.entity';
import { OrderStatus } from 'src/common/enums';
import { Coupon } from './coupon.entity';

@ObjectType()
@Entity({ name: 'orders' })
export class Order {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.orders, { eager: true, onDelete: 'SET NULL' })
  user: User;

  @Field(() => [OrderItem], { nullable: true })
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items?: OrderItem[];

  @Field(() => Coupon, { nullable: true })
  @ManyToOne(() => Coupon, { nullable: true, eager: true })
  coupon?: Coupon;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tax: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shipping: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Field()
  @Column({ name: 'shipping_name' })
  shippingName: string;

  @Field()
  @Column({ name: 'shipping_address' })
  shippingAddress: string;

  @Field()
  @Column({ name: 'shipping_city' })
  shippingCity: string;

  @Field()
  @Column({ name: 'shipping_region' })
  shippingRegion: string;

  @Field()
  @Column({ name: 'shipping_postal_code' })
  shippingPostalCode: string;

  @Field(() => Payment, { nullable: true })
  @OneToOne(() => Payment, (payment) => payment.order)
  payment?: Payment;

  @Field(() => Shipment, { nullable: true })
  @OneToOne(() => Shipment, (shipment) => shipment.order)
  @JoinColumn()
  shipment?: Shipment;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
