import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { NewsletterSubscriptionStatus } from 'src/common/enums';

@ObjectType()
@Entity({ name: 'newsletter_subscriptions' })
export class NewsletterSubscription {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  locale?: string;

  @Field(() => NewsletterSubscriptionStatus)
  @Column({ type: 'enum', enum: NewsletterSubscriptionStatus, default: NewsletterSubscriptionStatus.PENDING })
  status: NewsletterSubscriptionStatus;

  @Column({ name: 'confirmation_token', nullable: true })
  confirmationToken?: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
