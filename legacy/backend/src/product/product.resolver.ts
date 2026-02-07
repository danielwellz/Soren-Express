// src/product.resolver.ts
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductService } from './product.service';
import { ProductReturnType } from 'src/common/common-types';
import { ProductFilterInput, PaginationInput } from './dto/product.input';

@Resolver((of) => Product)
export class ProductResolver {
  constructor(private productService: ProductService) {}

  @Query(() => [Product])
  async products(
    @Args('filter', { nullable: true }) filter: ProductFilterInput,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<Product[]> {
    return await this.productService.find(filter, pagination);
  }

  @Query(() => Product)
  async product(@Args('id', { type: () => Int }) id: number): Promise<Product> {
    return await this.productService.findOne(id);
  }

  @Mutation(() => ProductReturnType)
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ): Promise<ProductReturnType> {
    try {
      return {
        success: true,
        message: 'Product created successfully',
        product: await this.productService.create(createProductInput),
      };
    } catch (error) {
      console.log('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  @Mutation(() => ProductReturnType)
  async updateProduct(
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ): Promise<ProductReturnType> {
    try {
      return {
        success: true,
        message: 'Product updated successfully',
        product: await this.productService.update(
          updateProductInput.id,
          updateProductInput,
        ),
      };
    } catch (error) {
      console.log('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  @Mutation(() => ProductReturnType)
  async removeProduct(@Args('id', { type: () => String }) id: string) {
    try {
      return {
        success: true,
        message: 'Product removed successfully',
        product: await this.productService.remove(id),
      };
    } catch (error) {
      console.log('Error removing product:', error);
      throw new Error('Failed to remove product');
    }
  }
}
