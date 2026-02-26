import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';
import { Product } from './product.entity';

@ObjectType()
@Entity({ name: 'wishlist_items' })
@Unique(['user', 'product'])
export class WishlistItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.wishlistItems, { onDelete: 'CASCADE', eager: true })
  user: User;

  @Field(() => Product)
  @ManyToOne(() => Product, { onDelete: 'CASCADE', eager: true })
  product: Product;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
