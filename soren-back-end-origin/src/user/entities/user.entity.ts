import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ name: 'fullname', nullable: true })
  fullName: string;

  @Field()
  @Column()
  phone: string;

  @Field()
  @Column({ name: 'verification_code', nullable: true })
  verificationCode: string;

  @Field()
  @Column({ nullable: true })
  address: string;

  @Field()
  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  @Field()
  @Column({ nullable: true })
  email: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
