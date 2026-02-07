import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity({ name: 'tax_rules' })
export class TaxRule {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  region: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  rate: number;

  @Field()
  @Column({ default: true })
  active: boolean;
}
