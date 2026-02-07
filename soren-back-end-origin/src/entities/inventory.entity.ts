import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProductVariant } from './product-variant.entity';

@ObjectType()
@Entity({ name: 'inventory' })
export class Inventory {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => ProductVariant)
  @OneToOne(() => ProductVariant, (variant) => variant.inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  reserved: number;

  @Field(() => Int)
  @Column({ name: 'low_stock_threshold', type: 'int', default: 5 })
  lowStockThreshold: number;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
