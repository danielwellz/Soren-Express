import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Cart } from './cart.entity';
import { ProductVariant } from './product-variant.entity';

@ObjectType()
@Entity({ name: 'cart_items' })
@Unique(['cart', 'variant'])
export class CartItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Cart)
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @Field(() => ProductVariant)
  @ManyToOne(() => ProductVariant, (variant) => variant.cartItems, { eager: true, onDelete: 'CASCADE' })
  variant: ProductVariant;

  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Field(() => Float)
  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;
}
