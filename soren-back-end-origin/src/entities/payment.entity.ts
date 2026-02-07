import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Order } from './order.entity';
import { PaymentProvider, PaymentStatus } from 'src/common/enums';

@ObjectType()
@Entity({ name: 'payments' })
export class Payment {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => PaymentProvider)
  @Column({ type: 'enum', enum: PaymentProvider, default: PaymentProvider.FAKEPAY })
  provider: PaymentProvider;

  @Field(() => PaymentStatus)
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.REQUIRES_CONFIRMATION })
  status: PaymentStatus;

  @Field()
  @Column({ unique: true })
  intentId: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  last4?: string;

  @Field(() => Order)
  @OneToOne(() => Order, (order) => order.payment, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
