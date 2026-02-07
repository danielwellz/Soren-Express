import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity({ name: 'shipping_rules' })
export class ShippingRule {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  region: string;

  @Field(() => Float)
  @Column({ name: 'flat_rate', type: 'decimal', precision: 10, scale: 2, default: 0 })
  flatRate: number;

  @Field(() => Float)
  @Column({ name: 'free_shipping_over', type: 'decimal', precision: 10, scale: 2, default: 0 })
  freeShippingOver: number;

  @Field()
  @Column({ default: true })
  active: boolean;
}
