import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Product } from './product.entity';
import { User } from './user.entity';
import { ReviewStatus } from 'src/common/enums';

@ObjectType()
@Entity({ name: 'reviews' })
export class Review {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.reviews, { eager: true, onDelete: 'CASCADE' })
  product: Product;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.reviews, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Field(() => Int)
  @Column({ type: 'int' })
  rating: number;

  @Field()
  @Column('text')
  comment: string;

  @Field(() => ReviewStatus)
  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
