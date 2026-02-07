import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Order } from './order.entity';
import { ProductVariant } from './product-variant.entity';

@ObjectType()
@Entity({ name: 'order_items' })
export class OrderItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @Field(() => ProductVariant)
  @ManyToOne(() => ProductVariant, (variant) => variant.orderItems, { eager: true, onDelete: 'SET NULL' })
  variant: ProductVariant;

  @Field()
  @Column()
  productName: string;

  @Field()
  @Column()
  variantLabel: string;

  @Field()
  @Column()
  sku: string;

  @Field(() => Int)
  @Column({ type: 'int' })
  quantity: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lineTotal: number;
}
