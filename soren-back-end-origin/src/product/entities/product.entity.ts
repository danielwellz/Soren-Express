import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, ID, Directive, Int } from '@nestjs/graphql';

@Entity({ name: 'products' })
@ObjectType()
@Directive('@key(fields: "id")')
export class Product {
  @PrimaryGeneratedColumn()
  @Field(() => ID, { nullable: true })
  id: number;

  @Column()
  @Field()
  type: string;

  @Column()
  @Field()
  brand: string;

  @Column()
  @Field()
  model: string;

  @Column({ name: 'sub_type' })
  @Field()
  subType: string;

  @Column()
  @Field()
  price: number;

  @Column()
  @Field(() => String)
  color: string;

  @Column()
  @Field()
  quantity: number;

  @Column('simple-array', {
    name: 'img_urls',
    default: null,
    nullable: true,
  })
  @Field(() => [String], { nullable: true })
  imgUrls: string[];

  @Column({ default: null, nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column({ name: 'created_at' })
  @Field(() => Date)
  createdAt: Date;

  @Column({ name: 'updated_at' })
  @Field(() => Date)
  updatedAt: Date;
}
