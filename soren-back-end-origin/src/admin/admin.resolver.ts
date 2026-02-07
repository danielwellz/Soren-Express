import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/roles.decorator';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/common/enums';
import {
  Brand,
  Category,
  Coupon,
  Inventory,
  Order,
  Product,
  ProductVariant,
  ShippingRule,
  TaxRule,
  User,
} from 'src/entities';
import {
  CreateBrandInput,
  CreateCategoryInput,
  CreateCouponInput,
  CreateProductInput,
  CreateVariantInput,
  UpdateBrandInput,
  UpdateCategoryInput,
  UpdateCouponInput,
  UpdateInventoryInput,
  UpdateOrderStatusInput,
  UpdateProductInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UpsertShippingRuleInput,
  UpsertTaxRuleInput,
} from './admin.inputs';
import { AdminService } from './admin.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { AnalyticsEvent } from 'src/entities/analytics-event.entity';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminResolver {
  constructor(
    private readonly adminService: AdminService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Mutation(() => Category)
  async adminCreateCategory(@Args('input') input: CreateCategoryInput): Promise<Category> {
    return this.adminService.createCategory(input);
  }

  @Mutation(() => Category)
  async adminUpdateCategory(@Args('input') input: UpdateCategoryInput): Promise<Category> {
    return this.adminService.updateCategory(input);
  }

  @Mutation(() => Boolean)
  async adminDeleteCategory(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.adminService.deleteCategory(id);
  }

  @Mutation(() => Brand)
  async adminCreateBrand(@Args('input') input: CreateBrandInput): Promise<Brand> {
    return this.adminService.createBrand(input);
  }

  @Mutation(() => Brand)
  async adminUpdateBrand(@Args('input') input: UpdateBrandInput): Promise<Brand> {
    return this.adminService.updateBrand(input);
  }

  @Mutation(() => Boolean)
  async adminDeleteBrand(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.adminService.deleteBrand(id);
  }

  @Mutation(() => Product)
  async adminCreateProduct(@Args('input') input: CreateProductInput): Promise<Product> {
    return this.adminService.createProduct(input);
  }

  @Mutation(() => Product)
  async adminUpdateProduct(@Args('input') input: UpdateProductInput): Promise<Product> {
    return this.adminService.updateProduct(input);
  }

  @Mutation(() => Boolean)
  async adminDeleteProduct(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.adminService.deleteProduct(id);
  }

  @Mutation(() => ProductVariant)
  async adminCreateVariant(@Args('input') input: CreateVariantInput): Promise<ProductVariant> {
    return this.adminService.createVariant(input);
  }

  @Mutation(() => Inventory)
  async adminUpdateInventory(@Args('input') input: UpdateInventoryInput): Promise<Inventory> {
    return this.adminService.updateInventory(input);
  }

  @Mutation(() => Coupon)
  async adminCreateCoupon(@Args('input') input: CreateCouponInput): Promise<Coupon> {
    return this.adminService.createCoupon(input);
  }

  @Mutation(() => Coupon)
  async adminUpdateCoupon(@Args('input') input: UpdateCouponInput): Promise<Coupon> {
    return this.adminService.updateCoupon(input);
  }

  @Mutation(() => Boolean)
  async adminDeleteCoupon(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.adminService.deleteCoupon(id);
  }

  @Mutation(() => User)
  async adminUpdateUserRole(@Args('input') input: UpdateUserRoleInput): Promise<User> {
    return this.adminService.updateUserRole(input);
  }

  @Mutation(() => User)
  async adminUpdateUserStatus(@Args('input') input: UpdateUserStatusInput): Promise<User> {
    return this.adminService.updateUserStatus(input);
  }

  @Mutation(() => Boolean)
  async adminDeleteUser(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.adminService.deleteUser(id);
  }

  @Mutation(() => Order)
  async adminUpdateOrderStatus(@Args('input') input: UpdateOrderStatusInput): Promise<Order> {
    return this.adminService.updateOrderStatus(input);
  }

  @Mutation(() => TaxRule)
  async adminUpsertTaxRule(@Args('input') input: UpsertTaxRuleInput): Promise<TaxRule> {
    return this.adminService.upsertTaxRule(input);
  }

  @Mutation(() => ShippingRule)
  async adminUpsertShippingRule(
    @Args('input') input: UpsertShippingRuleInput,
  ): Promise<ShippingRule> {
    return this.adminService.upsertShippingRule(input);
  }

  @Query(() => [Category])
  async adminCategories(): Promise<Category[]> {
    return this.adminService.categories();
  }

  @Query(() => [Brand])
  async adminBrands(): Promise<Brand[]> {
    return this.adminService.brands();
  }

  @Query(() => [Coupon])
  async adminCoupons(): Promise<Coupon[]> {
    return this.adminService.coupons();
  }

  @Query(() => [Product])
  async adminProducts(): Promise<Product[]> {
    return this.adminService.products();
  }

  @Query(() => [User])
  async adminUsers(): Promise<User[]> {
    return this.adminService.users();
  }

  @Query(() => [Order])
  async adminOrders(): Promise<Order[]> {
    return this.adminService.orders();
  }

  @Query(() => [TaxRule])
  async adminTaxRules(): Promise<TaxRule[]> {
    return this.adminService.taxRules();
  }

  @Query(() => [ShippingRule])
  async adminShippingRules(): Promise<ShippingRule[]> {
    return this.adminService.shippingRules();
  }

  @Query(() => [AnalyticsEvent])
  async adminAnalyticsEvents(@Args('limit', { type: () => Int, nullable: true }) limit = 50): Promise<AnalyticsEvent[]> {
    return this.analyticsService.listEvents(limit);
  }
}
