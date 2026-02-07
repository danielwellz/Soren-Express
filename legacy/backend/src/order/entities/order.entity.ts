import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
//   import Genre from './genre.entity';
//   import Book from './book.entity';
import { Field } from '@nestjs/graphql';

@Entity()
export default class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @PrimaryColumn({ name: 'product_id' })
  productId: number;

  @Field()
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @Field()
  @PrimaryColumn({ name: 'transaction_id' })
  transactionsId: number;

  @Field()
  @Column()
  address: string;

  @Field()
  @Column()
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //   // Associations
  //   @ManyToOne(() => Book, (book) => book.genreConnection, { primary: true })
  //   @JoinColumn({ name: 'book_id' })
  //   book: Book[];

  //   @ManyToOne(() => Genre, (genre) => genre.bookConnection, { primary: true })
  //   @JoinColumn({ name: 'genre_id' })
  //   genre: Genre[];
}
