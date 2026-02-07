import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { UpdateProductInput } from './dto/update-product.input';
import { CreateProductInput } from './dto/create-product.input';
import { ProductFilterInput, PaginationInput } from './dto/product.input';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async create(createProductInput: CreateProductInput): Promise<Product> {
    try {
      const product = new Product();
      product.brand = createProductInput.brand;
      product.color = createProductInput.color;
      product.model = createProductInput.model;
      product.price = createProductInput.price;
      product.quantity = createProductInput.quantity;
      product.subType = createProductInput.subType;
      product.type = createProductInput.type;
      product.createdAt = new Date();
      product.updatedAt = new Date();
      try {
        await this.productRepository.save(product);
      } catch (error) {
        console.log('Error creating product:', error);
        throw new Error('Failed to create product');
      }
      return product;
    } catch (error) {
      console.log('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  async find(
    filter: ProductFilterInput,
    pagination: PaginationInput,
  ): Promise<Product[]> {
    const productsQueryBuilder =
      this.productRepository.createQueryBuilder('product');

    if (filter.brand && filter.brand.length > 0) {
      productsQueryBuilder.andWhere('product.brand IN (:...brands)', {
        brands: filter.brand,
      });
    }

    if (filter.subType && filter.subType.length > 0) {
      productsQueryBuilder.andWhere('product.subType IN (:...subTypes)', {
        subTypes: filter.subType,
      });
    }

    if (filter.type && filter.type.length > 0) {
      productsQueryBuilder.andWhere('product.type IN (:...types)', {
        types: filter.type,
      });
    }

    // Add additional filter conditions for color, minPrice, and maxPrice
    if (filter.color && filter.color.length > 0) {
      productsQueryBuilder.andWhere('product.color IN (:...color)', {
        color: filter.color,
      });
    }

    if (filter.minPrice !== undefined) {
      productsQueryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: filter.minPrice,
      });
    }

    if (filter.maxPrice !== undefined) {
      productsQueryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: filter.maxPrice,
      });
    }

    const products = await productsQueryBuilder
      .skip(pagination.offset || 0)
      .take(pagination.limit || 10)
      .getMany();

    if (!products) {
      throw new Error('Failed to fetch products');
    }

    return products;
  }

  async findOne(id: number): Promise<Product> {
    return this.productRepository.findOne({ where: { id: id } });
  }

  async update(
    id: number,
    updateProductInput: UpdateProductInput,
  ): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: +id },
      });
      product.brand = updateProductInput.brand
        ? updateProductInput.brand
        : product.brand;
      product.color = updateProductInput.color
        ? updateProductInput.color
        : product.color;
      product.model = updateProductInput.model
        ? updateProductInput.model
        : product.model;
      product.price = updateProductInput.price
        ? updateProductInput.price
        : product.price;
      product.quantity = updateProductInput.quantity
        ? updateProductInput.quantity
        : product.quantity;
      product.subType = updateProductInput.subType
        ? updateProductInput.subType
        : product.subType;
      product.type = updateProductInput.type
        ? updateProductInput.type
        : product.type;
      product.updatedAt = new Date();
      try {
        await this.productRepository.save(product);
      } catch (error) {
        console.log('Error updating product:', error);
        throw new Error('Failed to update product');
      }
      return product;
    } catch (error) {
      console.log('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  async remove(id: string): Promise<any> {
    const product = await this.productRepository.findOne({
      where: { id: +id },
    });
    return await this.productRepository.remove(product);
  }
}
