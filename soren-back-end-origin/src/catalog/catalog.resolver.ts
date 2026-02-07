import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { Brand, Category, Product } from 'src/entities';
import { CatalogService } from './catalog.service';
import { PaginationInput, ProductFilterInput, SortInput } from './catalog.inputs';
import { ProductDetail, ProductListResult } from './catalog.types';

@Resolver(() => Product)
export class CatalogResolver {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Query(() => ProductListResult)
  async products(
    @Args('filter', { nullable: true }) filter?: ProductFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    @Args('sort', { nullable: true }) sort?: SortInput,
  ): Promise<ProductListResult> {
    return this.catalogService.getProducts(filter, pagination, sort);
  }

  @Query(() => ProductDetail)
  async product(
    @Args('id', { type: () => Int }) id: number,
    @Args('sessionId', { nullable: true }) sessionId?: string,
  ): Promise<ProductDetail> {
    const product = await this.catalogService.getProductById(id);
    const relatedProducts = (await this.catalogService.getRelatedProducts(product)).filter(
      (item) => item.id !== product.id,
    );

    await this.analyticsService.trackEvent({
      eventType: 'view_product',
      product,
      sessionId,
      metadata: { productId: id },
    });

    return {
      ...product,
      variants: product.variants || [],
      relatedProducts,
    };
  }

  @Query(() => [Product])
  async featuredProducts(): Promise<Product[]> {
    return this.catalogService.getFeaturedProducts();
  }

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.catalogService.getCategories();
  }

  @Query(() => [Brand])
  async brands(): Promise<Brand[]> {
    return this.catalogService.getBrands();
  }

  @Query(() => [Product], { name: 'relatedProducts' })
  async relatedProducts(@Args('productId', { type: () => Int }) productId: number): Promise<Product[]> {
    const product = await this.catalogService.getProductById(productId);
    const related = await this.catalogService.getRelatedProducts(product);
    return related.filter((item) => item.id !== productId);
  }
}
