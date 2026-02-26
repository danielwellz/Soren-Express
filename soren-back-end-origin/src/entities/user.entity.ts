import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Cart } from './cart.entity';
import { Order } from './order.entity';
import { Review } from './review.entity';
import { AnalyticsEvent } from './analytics-event.entity';
import { UserRole } from 'src/common/enums';
import { WishlistItem } from './wishlist-item.entity';
import { BackInStockSubscription } from './back-in-stock-subscription.entity';
import { ReturnRequest } from './return-request.entity';
import { SupportMessage } from './support-message.entity';
import { AddressBookEntry } from './address-book-entry.entity';
import { CheckoutProfile } from './checkout-profile.entity';

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Field()
  @Column({ name: 'full_name' })
  fullName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Column({ name: 'refresh_token_hash', nullable: true })
  refreshTokenHash?: string;

  @Field()
  @Column({ default: true })
  active: boolean;

  @Field(() => [Cart], { nullable: true })
  @OneToMany(() => Cart, (cart) => cart.user)
  carts?: Cart[];

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.user)
  orders?: Order[];

  @OneToMany(() => Review, (review) => review.user)
  reviews?: Review[];

  @OneToMany(() => AnalyticsEvent, (event) => event.user)
  analyticsEvents?: AnalyticsEvent[];

  @OneToMany(() => WishlistItem, (item) => item.user)
  wishlistItems?: WishlistItem[];

  @OneToMany(() => BackInStockSubscription, (subscription) => subscription.user)
  backInStockSubscriptions?: BackInStockSubscription[];

  @OneToMany(() => ReturnRequest, (request) => request.user)
  returnRequests?: ReturnRequest[];

  @OneToMany(() => SupportMessage, (message) => message.user)
  supportMessages?: SupportMessage[];

  @Field(() => [AddressBookEntry], { nullable: true })
  @OneToMany(() => AddressBookEntry, (entry) => entry.user)
  addressBookEntries?: AddressBookEntry[];

  @Field(() => CheckoutProfile, { nullable: true })
  @OneToOne(() => CheckoutProfile, (profile) => profile.user)
  checkoutProfile?: CheckoutProfile;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
