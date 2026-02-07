import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';
import { CartItem } from './cart-item.entity';

@ObjectType()
@Entity({ name: 'carts' })
export class Cart {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ name: 'session_id', nullable: true })
  sessionId?: string;

  @Field()
  @Column({ default: true })
  active: boolean;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.carts, { nullable: true, onDelete: 'SET NULL' })
  user?: User;

  @Field(() => [CartItem], { nullable: true })
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items?: CartItem[];

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
