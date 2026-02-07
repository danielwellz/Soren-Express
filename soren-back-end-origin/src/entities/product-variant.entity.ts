import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Product } from './product.entity';
import { Inventory } from './inventory.entity';
import { CartItem } from './cart-item.entity';
import { OrderItem } from './order-item.entity';

@ObjectType()
@Entity({ name: 'product_variants' })
export class ProductVariant {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  sku: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  size?: string;

  @Field(() => Float)
  @Column({ name: 'price_adjustment', type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceAdjustment: number;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  product: Product;

  @Field(() => Inventory, { nullable: true })
  @OneToOne(() => Inventory, (inventory) => inventory.variant)
  inventory?: Inventory;

  @OneToMany(() => CartItem, (item) => item.variant)
  cartItems?: CartItem[];

  @OneToMany(() => OrderItem, (item) => item.variant)
  orderItems?: OrderItem[];

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
