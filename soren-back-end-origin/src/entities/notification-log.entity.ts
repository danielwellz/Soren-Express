import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity({ name: 'notification_logs' })
export class NotificationLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  channel: string;

  @Field()
  @Column()
  destination: string;

  @Field()
  @Column('text')
  message: string;

  @Field()
  @Column()
  status: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
