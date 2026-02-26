import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ReturnRequestStatus } from 'src/common/enums';
import { Order } from './order.entity';
import { User } from './user.entity';

@ObjectType()
@Entity({ name: 'return_requests' })
export class ReturnRequest {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.returnRequests, { onDelete: 'CASCADE', eager: true })
  order: Order;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.returnRequests, { onDelete: 'CASCADE', eager: true })
  user: User;

  @Field()
  @Column({ type: 'varchar' })
  reason: string;

  @Field()
  @Column({ name: 'exchange_preferred', default: false })
  exchangePreferred: boolean;

  @Field(() => ReturnRequestStatus)
  @Column({ type: 'enum', enum: ReturnRequestStatus, default: ReturnRequestStatus.REQUESTED })
  status: ReturnRequestStatus;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
