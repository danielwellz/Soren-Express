import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { ProductVariant } from './product-variant.entity';
import { Review } from './review.entity';

@ObjectType()
@Entity({ name: 'products' })
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field()
  @Column('text')
  description: string;

  @Field(() => Float)
  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  thumbnail?: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { name: 'gallery_urls', nullable: true })
  galleryUrls?: string[];

  @Field()
  @Column({ default: true })
  published: boolean;

  @Field()
  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Field(() => Float)
  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  category: Category;

  @Field(() => Brand)
  @ManyToOne(() => Brand, (brand) => brand.products, { eager: true })
  brand: Brand;

  @Field(() => [ProductVariant], { nullable: true })
  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants?: ProductVariant[];

  @OneToMany(() => Review, (review) => review.product)
  reviews?: Review[];

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
