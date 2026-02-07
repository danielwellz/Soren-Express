import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current-user.decorator';
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
  async adminCreateCategory(
    @Args('input') input: CreateCategoryInput,
    @CurrentUser() actor: User,
  ): Promise<Category> {
    return this.adminService.createCategory(input, actor.id);
  }

  @Mutation(() => Category)
  async adminUpdateCategory(
    @Args('input') input: UpdateCategoryInput,
    @CurrentUser() actor: User,
  ): Promise<Category> {
    return this.adminService.updateCategory(input, actor.id);
  }

  @Mutation(() => Boolean)
  async adminDeleteCategory(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() actor: User,
  ): Promise<boolean> {
    return this.adminService.deleteCategory(id, actor.id);
  }

  @Mutation(() => Brand)
  async adminCreateBrand(
    @Args('input') input: CreateBrandInput,
    @CurrentUser() actor: User,
  ): Promise<Brand> {
    return this.adminService.createBrand(input, actor.id);
  }

  @Mutation(() => Brand)
  async adminUpdateBrand(
    @Args('input') input: UpdateBrandInput,
    @CurrentUser() actor: User,
  ): Promise<Brand> {
    return this.adminService.updateBrand(input, actor.id);
  }

  @Mutation(() => Boolean)
  async adminDeleteBrand(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() actor: User,
  ): Promise<boolean> {
    return this.adminService.deleteBrand(id, actor.id);
  }

  @Mutation(() => Product)
  async adminCreateProduct(
    @Args('input') input: CreateProductInput,
    @CurrentUser() actor: User,
  ): Promise<Product> {
    return this.adminService.createProduct(input, actor.id);
  }

  @Mutation(() => Product)
  async adminUpdateProduct(
    @Args('input') input: UpdateProductInput,
    @CurrentUser() actor: User,
  ): Promise<Product> {
    return this.adminService.updateProduct(input, actor.id);
  }

  @Mutation(() => Boolean)
  async adminDeleteProduct(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() actor: User,
  ): Promise<boolean> {
    return this.adminService.deleteProduct(id, actor.id);
  }

  @Mutation(() => ProductVariant)
  async adminCreateVariant(
    @Args('input') input: CreateVariantInput,
    @CurrentUser() actor: User,
  ): Promise<ProductVariant> {
    return this.adminService.createVariant(input, actor.id);
  }

  @Mutation(() => Inventory)
  async adminUpdateInventory(
    @Args('input') input: UpdateInventoryInput,
    @CurrentUser() actor: User,
  ): Promise<Inventory> {
    return this.adminService.updateInventory(input, actor.id);
  }

  @Mutation(() => Coupon)
  async adminCreateCoupon(
    @Args('input') input: CreateCouponInput,
    @CurrentUser() actor: User,
  ): Promise<Coupon> {
    return this.adminService.createCoupon(input, actor.id);
  }

  @Mutation(() => Coupon)
  async adminUpdateCoupon(
    @Args('input') input: UpdateCouponInput,
    @CurrentUser() actor: User,
  ): Promise<Coupon> {
    return this.adminService.updateCoupon(input, actor.id);
  }

  @Mutation(() => Boolean)
  async adminDeleteCoupon(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() actor: User,
  ): Promise<boolean> {
    return this.adminService.deleteCoupon(id, actor.id);
  }

  @Mutation(() => User)
  async adminUpdateUserRole(
    @Args('input') input: UpdateUserRoleInput,
    @CurrentUser() actor: User,
  ): Promise<User> {
    return this.adminService.updateUserRole(input, actor.id);
  }

  @Mutation(() => User)
  async adminUpdateUserStatus(
    @Args('input') input: UpdateUserStatusInput,
    @CurrentUser() actor: User,
  ): Promise<User> {
    return this.adminService.updateUserStatus(input, actor.id);
  }

  @Mutation(() => Boolean)
  async adminDeleteUser(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() actor: User,
  ): Promise<boolean> {
    return this.adminService.deleteUser(id, actor.id);
  }

  @Mutation(() => Order)
  async adminUpdateOrderStatus(
    @Args('input') input: UpdateOrderStatusInput,
    @CurrentUser() actor: User,
  ): Promise<Order> {
    return this.adminService.updateOrderStatus(input, actor.id);
  }

  @Mutation(() => TaxRule)
  async adminUpsertTaxRule(
    @Args('input') input: UpsertTaxRuleInput,
    @CurrentUser() actor: User,
  ): Promise<TaxRule> {
    return this.adminService.upsertTaxRule(input, actor.id);
  }

  @Mutation(() => ShippingRule)
  async adminUpsertShippingRule(
    @Args('input') input: UpsertShippingRuleInput,
    @CurrentUser() actor: User,
  ): Promise<ShippingRule> {
    return this.adminService.upsertShippingRule(input, actor.id);
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
