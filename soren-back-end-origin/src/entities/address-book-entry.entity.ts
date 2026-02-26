import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Entity({ name: 'address_book_entries' })
export class AddressBookEntry {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.addressBookEntries, { onDelete: 'CASCADE' })
  user: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  label?: string;

  @Field()
  @Column({ name: 'full_name' })
  fullName: string;

  @Field()
  @Column({ name: 'line1' })
  line1: string;

  @Field()
  @Column()
  city: string;

  @Field()
  @Column()
  region: string;

  @Field()
  @Column({ name: 'postal_code' })
  postalCode: string;

  @Field()
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
