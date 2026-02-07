import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Order } from './order.entity';

@ObjectType()
@Entity({ name: 'analytics_events' })
export class AnalyticsEvent {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ name: 'event_type' })
  eventType: string;

  @Field({ nullable: true })
  @Column({ name: 'session_id', nullable: true })
  sessionId?: string;

  @ManyToOne(() => User, (user) => user.analyticsEvents, { nullable: true, eager: true, onDelete: 'SET NULL' })
  user?: User;

  @ManyToOne(() => Product, { nullable: true, eager: true, onDelete: 'SET NULL' })
  product?: Product;

  @ManyToOne(() => Order, { nullable: true, eager: true, onDelete: 'SET NULL' })
  order?: Order;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
