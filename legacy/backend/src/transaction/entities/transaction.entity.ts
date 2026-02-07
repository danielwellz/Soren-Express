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
// import Genre from './genre.entity';
// import Book from './book.entity';
import { Field } from '@nestjs/graphql';

@Entity({ name: 'transactions' })
export default class transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ name: 'card_number' })
  cardNumber: string;

  @Field()
  @Column()
  price: number;

  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'order_id' })
  ordeeId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //   // Associations
    // @ManyToOne(() => Book, (book) => book.genreConnection, { primary: true })
    // @JoinColumn({ name: 'book_id' })
    // book: Book[];

  //   @ManyToOne(() => Genre, (genre) => genre.bookConnection, { primary: true })
  //   @JoinColumn({ name: 'genre_id' })
  //   genre: Genre[];
}
