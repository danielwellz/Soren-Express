import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@ObjectType()
@Entity({ name: 'back_in_stock_subscriptions' })
@Unique(['email', 'variant'])
export class BackInStockSubscription {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  email: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.backInStockSubscriptions, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  user?: User;

  @Field(() => Product, { nullable: true })
  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL', eager: true })
  product?: Product;

  @Field(() => ProductVariant, { nullable: true })
  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'SET NULL', eager: true })
  variant?: ProductVariant;

  @Field()
  @Column({ default: true })
  active: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
