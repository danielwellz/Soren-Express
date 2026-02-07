import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand, Category, Inventory, Product, ProductVariant } from 'src/entities';
import { Repository } from 'typeorm';
import { PaginationInput, ProductFilterInput, SortInput } from './catalog.inputs';
import { ProductListResult } from './catalog.types';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
  ) {}

  async getProducts(
    filter: ProductFilterInput,
    pagination: PaginationInput,
    sort: SortInput,
  ): Promise<ProductListResult> {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 12;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('variant.inventory', 'inventory')
      .where('product.published = :published', { published: true });
    qb.distinct(true);

    if (filter?.search) {
      qb.andWhere('(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search)', {
        search: `%${filter.search.toLowerCase()}%`,
      });
    }

    if (filter?.categoryIds?.length) {
      qb.andWhere('category.id IN (:...categoryIds)', {
        categoryIds: filter.categoryIds,
      });
    }

    if (filter?.brandIds?.length) {
      qb.andWhere('brand.id IN (:...brandIds)', { brandIds: filter.brandIds });
    }

    if (filter?.minPrice !== undefined) {
      qb.andWhere('product.basePrice >= :minPrice', { minPrice: filter.minPrice });
    }

    if (filter?.maxPrice !== undefined) {
      qb.andWhere('product.basePrice <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    if (filter?.inStockOnly) {
      qb.innerJoin('product.variants', 'stockVariant')
        .innerJoin('stockVariant.inventory', 'inventory')
        .andWhere('(inventory.quantity - inventory.reserved) > 0');
    }

    if (filter?.colors?.length) {
      qb.innerJoin('product.variants', 'colorVariant').andWhere('colorVariant.color IN (:...colors)', {
        colors: filter.colors,
      });
    }

    const sortMap: Record<string, string> = {
      name: 'product.name',
      price: 'product.basePrice',
      createdAt: 'product.createdAt',
      rating: 'product.averageRating',
    };

    const sortField = sortMap[sort?.field] || 'product.createdAt';
    const direction = sort?.direction === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortField, direction);

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne(id, {
      relations: ['variants', 'variants.inventory', 'category', 'brand'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getRelatedProducts(product: Product): Promise<Product[]> {
    return this.productsRepository.find({
      where: {
        category: product.category,
        published: true,
      },
      take: 4,
      order: { createdAt: 'DESC' },
    });
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isFeatured: true, published: true },
      relations: ['category', 'brand'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getCategories(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async getBrands(): Promise<Brand[]> {
    return this.brandsRepository.find({ order: { name: 'ASC' } });
  }
}
