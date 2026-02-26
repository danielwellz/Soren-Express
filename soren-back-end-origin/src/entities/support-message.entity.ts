import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SupportMessageStatus } from 'src/common/enums';
import { User } from './user.entity';

@ObjectType()
@Entity({ name: 'support_messages' })
export class SupportMessage {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.supportMessages, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  user?: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field()
  @Column('text')
  message: string;

  @Field(() => SupportMessageStatus)
  @Column({ type: 'enum', enum: SupportMessageStatus, default: SupportMessageStatus.OPEN })
  status: SupportMessageStatus;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
