import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { CouponType } from 'src/common/enums';

@ObjectType()
@Entity({ name: 'coupons' })
export class Coupon {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  code: string;

  @Field(() => CouponType)
  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Field(() => Float)
  @Column({ name: 'min_order_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minOrderAmount: number;

  @Field()
  @Column({ default: true })
  active: boolean;

  @Field({ nullable: true })
  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
