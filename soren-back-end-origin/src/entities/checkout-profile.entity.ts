import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Entity({ name: 'checkout_profiles' })
export class CheckoutProfile {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.checkoutProfile, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field({ nullable: true })
  @Column({ name: 'shipping_name', nullable: true })
  shippingName?: string;

  @Field({ nullable: true })
  @Column({ name: 'shipping_line1', nullable: true })
  shippingLine1?: string;

  @Field({ nullable: true })
  @Column({ name: 'shipping_city', nullable: true })
  shippingCity?: string;

  @Field({ nullable: true })
  @Column({ name: 'shipping_region', nullable: true })
  shippingRegion?: string;

  @Field({ nullable: true })
  @Column({ name: 'shipping_postal_code', nullable: true })
  shippingPostalCode?: string;

  @Field({ nullable: true })
  @Column({ name: 'cardholder_name', nullable: true })
  cardholderName?: string;

  @Field({ nullable: true })
  @Column({ name: 'card_last4', nullable: true })
  cardLast4?: string;

  @Field({ nullable: true })
  @Column({ name: 'card_expiry', nullable: true })
  cardExpiry?: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
