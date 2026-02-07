import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/common/enums';
import { describeDbQueryError } from 'src/config/runtime-env';
import {
  Brand,
  Category,
  Coupon,
  AdminAuditLog,
  Inventory,
  Order,
  OrderStatusHistory,
  Product,
  ProductVariant,
  ShippingRule,
  TaxRule,
  User,
} from 'src/entities';
import { QueryFailedError, Repository } from 'typeorm';
import { assertValidOrderTransition } from 'src/orders/order-state-machine';
import { randomUUID } from 'crypto';
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
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderStatusHistory)
    private readonly orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    @InjectRepository(TaxRule)
    private readonly taxRulesRepository: Repository<TaxRule>,
    @InjectRepository(ShippingRule)
    private readonly shippingRulesRepository: Repository<ShippingRule>,
    @InjectRepository(AdminAuditLog)
    private readonly adminAuditLogRepository: Repository<AdminAuditLog>,
  ) {}

  private assertRequiredName(value: string, label: string): string {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!normalized) {
      throw new BadRequestException(`${label} is required`);
    }
    return normalized;
  }

  private logQueryFailure(context: string, error: unknown): void {
    if (!(error instanceof QueryFailedError)) {
      return;
    }
    this.logger.error(`[${context}] ${describeDbQueryError(error)}`);
  }

  private snapshot(value: unknown): Record<string, unknown> | undefined {
    if (!value) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value));
  }

  private sanitizeAuditPayload(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeAuditPayload(item));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).reduce((acc, [key, val]) => {
        if (/password|secret|token/i.test(key)) {
          acc[key] = '[REDACTED]';
        } else {
          acc[key] = this.sanitizeAuditPayload(val);
        }
        return acc;
      }, {} as Record<string, unknown>);
    }

    return value;
  }

  private async logAdminAction(params: {
    actorUserId?: number;
    action: string;
    entityType: string;
    entityId?: string | number;
    beforeState?: unknown;
    afterState?: unknown;
  }): Promise<void> {
    if (!params.actorUserId) {
      return;
    }

    const correlationId = randomUUID();
    await this.adminAuditLogRepository.save(
      this.adminAuditLogRepository.create({
        actorUserId: params.actorUserId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId !== undefined ? String(params.entityId) : undefined,
        beforeState: this.sanitizeAuditPayload(params.beforeState) as Record<string, unknown>,
        afterState: this.sanitizeAuditPayload(params.afterState) as Record<string, unknown>,
        correlationId,
      }),
    );
  }

  async createCategory(input: CreateCategoryInput, actorUserId?: number): Promise<Category> {
    const name = this.assertRequiredName(input.name, 'Category name');
    try {
      const created = await this.categoriesRepository.save(
        this.categoriesRepository.create({
          ...input,
          name,
        }),
      );
      await this.logAdminAction({
        actorUserId,
        action: 'category.create',
        entityType: 'Category',
        entityId: created.id,
        afterState: this.snapshot(created),
      });
      return created;
    } catch (error) {
      this.logQueryFailure('createCategory', error);
      throw error;
    }
  }

  async categories(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async updateCategory(input: UpdateCategoryInput, actorUserId?: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne(input.id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const before = this.snapshot(category);
    category.name = this.assertRequiredName(input.name, 'Category name');
    category.description = input.description;
    try {
      const updated = await this.categoriesRepository.save(category);
      await this.logAdminAction({
        actorUserId,
        action: 'category.update',
        entityType: 'Category',
        entityId: updated.id,
        beforeState: before,
        afterState: this.snapshot(updated),
      });
      return updated;
    } catch (error) {
      this.logQueryFailure('updateCategory', error);
      throw error;
    }
  }

  async deleteCategory(id: number, actorUserId?: number): Promise<boolean> {
    const category = await this.categoriesRepository.findOne(id);
    if (!category) {
      return false;
    }
    const before = this.snapshot(category);
    await this.categoriesRepository.remove(category);
    await this.logAdminAction({
      actorUserId,
      action: 'category.delete',
      entityType: 'Category',
      entityId: id,
      beforeState: before,
    });
    return true;
  }

  async createBrand(input: CreateBrandInput, actorUserId?: number): Promise<Brand> {
    const name = this.assertRequiredName(input.name, 'Brand name');
    try {
      const created = await this.brandsRepository.save(
        this.brandsRepository.create({
          ...input,
          name,
        }),
      );
      await this.logAdminAction({
        actorUserId,
        action: 'brand.create',
        entityType: 'Brand',
        entityId: created.id,
        afterState: this.snapshot(created),
      });
      return created;
    } catch (error) {
      this.logQueryFailure('createBrand', error);
      throw error;
    }
  }

  async brands(): Promise<Brand[]> {
    return this.brandsRepository.find({ order: { name: 'ASC' } });
  }

  async updateBrand(input: UpdateBrandInput, actorUserId?: number): Promise<Brand> {
    const brand = await this.brandsRepository.findOne(input.id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    const before = this.snapshot(brand);
    brand.name = this.assertRequiredName(input.name, 'Brand name');
    brand.description = input.description;
    try {
      const updated = await this.brandsRepository.save(brand);
      await this.logAdminAction({
        actorUserId,
        action: 'brand.update',
        entityType: 'Brand',
        entityId: updated.id,
        beforeState: before,
        afterState: this.snapshot(updated),
      });
      return updated;
    } catch (error) {
      this.logQueryFailure('updateBrand', error);
      throw error;
    }
  }

  async deleteBrand(id: number, actorUserId?: number): Promise<boolean> {
    const brand = await this.brandsRepository.findOne(id);
    if (!brand) {
      return false;
    }
    const before = this.snapshot(brand);
    await this.brandsRepository.remove(brand);
    await this.logAdminAction({
      actorUserId,
      action: 'brand.delete',
      entityType: 'Brand',
      entityId: id,
      beforeState: before,
    });
    return true;
  }

  async createProduct(input: CreateProductInput, actorUserId?: number): Promise<Product> {
    const category = await this.categoriesRepository.findOne(input.categoryId);
    const brand = await this.brandsRepository.findOne(input.brandId);

    if (!category || !brand) {
      throw new BadRequestException('Invalid category or brand');
    }

    const name = this.assertRequiredName(input.name, 'Product name');

    try {
      const created = await this.productsRepository.save(
        this.productsRepository.create({
          ...input,
          name,
          category,
          brand,
        }),
      );
      await this.logAdminAction({
        actorUserId,
        action: 'product.create',
        entityType: 'Product',
        entityId: created.id,
        afterState: this.snapshot(created),
      });
      return created;
    } catch (error) {
      this.logQueryFailure('createProduct', error);
      throw error;
    }
  }

  async updateProduct(input: UpdateProductInput, actorUserId?: number): Promise<Product> {
    const product = await this.productsRepository.findOne(input.id, {
      relations: ['category', 'brand'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const before = this.snapshot(product);

    const category = await this.categoriesRepository.findOne(input.categoryId);
    const brand = await this.brandsRepository.findOne(input.brandId);

    if (!category || !brand) {
      throw new BadRequestException('Invalid category or brand');
    }

    Object.assign(product, {
      name: this.assertRequiredName(input.name, 'Product name'),
      slug: input.slug,
      description: input.description,
      basePrice: input.basePrice,
      category,
      brand,
      thumbnail: input.thumbnail,
      galleryUrls: input.galleryUrls,
      isFeatured: input.isFeatured,
      published: input.published,
    });

    try {
      const updated = await this.productsRepository.save(product);
      await this.logAdminAction({
        actorUserId,
        action: 'product.update',
        entityType: 'Product',
        entityId: updated.id,
        beforeState: before,
        afterState: this.snapshot(updated),
      });
      return updated;
    } catch (error) {
      this.logQueryFailure('updateProduct', error);
      throw error;
    }
  }

  async deleteProduct(id: number, actorUserId?: number): Promise<boolean> {
    const product = await this.productsRepository.findOne(id);
    if (!product) {
      return false;
    }
    const before = this.snapshot(product);
    await this.productsRepository.remove(product);
    await this.logAdminAction({
      actorUserId,
      action: 'product.delete',
      entityType: 'Product',
      entityId: id,
      beforeState: before,
    });
    return true;
  }

  async createVariant(input: CreateVariantInput, actorUserId?: number): Promise<ProductVariant> {
    const product = await this.productsRepository.findOne(input.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const variant = await this.variantsRepository.save(
      this.variantsRepository.create({
        product,
        sku: input.sku,
        color: input.color,
        size: input.size,
        priceAdjustment: input.priceAdjustment,
      }),
    );

    await this.inventoryRepository.save(
      this.inventoryRepository.create({
        variant,
        quantity: input.inventoryQuantity,
      }),
    );

    const created = await this.variantsRepository.findOne(variant.id, {
      relations: ['product', 'inventory'],
    });
    await this.logAdminAction({
      actorUserId,
      action: 'variant.create',
      entityType: 'ProductVariant',
      entityId: created?.id,
      afterState: this.snapshot(created),
    });

    return created;
  }

  async updateInventory(input: UpdateInventoryInput, actorUserId?: number): Promise<Inventory> {
    const variant = await this.variantsRepository.findOne(input.variantId, {
      relations: ['inventory'],
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    let inventory = await this.inventoryRepository.findOne({ where: { variant } });
    if (!inventory) {
      inventory = this.inventoryRepository.create({
        variant,
        quantity: 0,
      });
    }
    const before = this.snapshot(inventory);

    inventory.quantity = input.quantity;
    if (input.lowStockThreshold !== undefined) {
      inventory.lowStockThreshold = input.lowStockThreshold;
    }

    const updated = await this.inventoryRepository.save(inventory);
    await this.logAdminAction({
      actorUserId,
      action: 'inventory.update',
      entityType: 'Inventory',
      entityId: updated.id,
      beforeState: before,
      afterState: this.snapshot(updated),
    });
    return updated;
  }

  async createCoupon(input: CreateCouponInput, actorUserId?: number): Promise<Coupon> {
    const created = await this.couponsRepository.save(
      this.couponsRepository.create({
        ...input,
        code: input.code.toUpperCase(),
      }),
    );
    await this.logAdminAction({
      actorUserId,
      action: 'coupon.create',
      entityType: 'Coupon',
      entityId: created.id,
      afterState: this.snapshot(created),
    });
    return created;
  }

  async coupons(): Promise<Coupon[]> {
    return this.couponsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateCoupon(input: UpdateCouponInput, actorUserId?: number): Promise<Coupon> {
    const coupon = await this.couponsRepository.findOne(input.id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    const before = this.snapshot(coupon);
    Object.assign(coupon, {
      code: input.code.toUpperCase(),
      type: input.type,
      amount: input.amount,
      minOrderAmount: input.minOrderAmount,
      active: input.active,
      expiresAt: input.expiresAt,
    });
    const updated = await this.couponsRepository.save(coupon);
    await this.logAdminAction({
      actorUserId,
      action: 'coupon.update',
      entityType: 'Coupon',
      entityId: updated.id,
      beforeState: before,
      afterState: this.snapshot(updated),
    });
    return updated;
  }

  async deleteCoupon(id: number, actorUserId?: number): Promise<boolean> {
    const coupon = await this.couponsRepository.findOne(id);
    if (!coupon) {
      return false;
    }
    const before = this.snapshot(coupon);
    await this.couponsRepository.remove(coupon);
    await this.logAdminAction({
      actorUserId,
      action: 'coupon.delete',
      entityType: 'Coupon',
      entityId: id,
      beforeState: before,
    });
    return true;
  }

  async users(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateUserRole(input: UpdateUserRoleInput, actorUserId?: number): Promise<User> {
    const user = await this.usersRepository.findOne(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const before = this.snapshot(user);
    user.role = input.role;
    const updated = await this.usersRepository.save(user);
    await this.logAdminAction({
      actorUserId,
      action: 'user.role.update',
      entityType: 'User',
      entityId: updated.id,
      beforeState: before,
      afterState: this.snapshot(updated),
    });
    return updated;
  }

  async updateUserStatus(input: UpdateUserStatusInput, actorUserId?: number): Promise<User> {
    const user = await this.usersRepository.findOne(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const before = this.snapshot(user);
    user.active = input.active;
    const updated = await this.usersRepository.save(user);
    await this.logAdminAction({
      actorUserId,
      action: 'user.status.update',
      entityType: 'User',
      entityId: updated.id,
      beforeState: before,
      afterState: this.snapshot(updated),
    });
    return updated;
  }

  async deleteUser(id: number, actorUserId?: number): Promise<boolean> {
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      return false;
    }
    const before = this.snapshot(user);
    await this.usersRepository.remove(user);
    await this.logAdminAction({
      actorUserId,
      action: 'user.delete',
      entityType: 'User',
      entityId: id,
      beforeState: before,
    });
    return true;
  }

  async orders(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['user', 'items', 'items.variant', 'payment', 'shipment', 'coupon'],
      order: { createdAt: 'DESC' },
    });
  }

  async products(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: ['category', 'brand', 'variants', 'variants.inventory'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(input: UpdateOrderStatusInput, actorUserId?: number): Promise<Order> {
    const order = await this.ordersRepository.findOne(input.orderId, {
      relations: ['shipment', 'payment', 'items', 'coupon', 'user'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const before = this.snapshot(order);

    assertValidOrderTransition(order.status, input.status);
    order.status = input.status;
    if (input.status === OrderStatus.FULFILLED && order.shipment) {
      order.shipment.status = 'DELIVERED' as any;
      order.shipment.deliveredAt = new Date();
    }

    await this.orderStatusHistoryRepository.save(
      this.orderStatusHistoryRepository.create({
        order,
        status: input.status,
        note: 'Status updated from admin panel',
      }),
    );

    const updated = await this.ordersRepository.save(order);
    await this.logAdminAction({
      actorUserId,
      action: 'order.status.update',
      entityType: 'Order',
      entityId: updated.id,
      beforeState: before,
      afterState: this.snapshot(updated),
    });
    return updated;
  }

  async upsertTaxRule(input: UpsertTaxRuleInput, actorUserId?: number): Promise<TaxRule> {
    let rule = await this.taxRulesRepository.findOne({ where: { region: input.region } });
    const before = this.snapshot(rule);
    if (!rule) {
      rule = this.taxRulesRepository.create(input);
    } else {
      Object.assign(rule, input);
    }
    const saved = await this.taxRulesRepository.save(rule);
    await this.logAdminAction({
      actorUserId,
      action: 'taxRule.upsert',
      entityType: 'TaxRule',
      entityId: saved.id,
      beforeState: before,
      afterState: this.snapshot(saved),
    });
    return saved;
  }

  async upsertShippingRule(input: UpsertShippingRuleInput, actorUserId?: number): Promise<ShippingRule> {
    let rule = await this.shippingRulesRepository.findOne({ where: { region: input.region } });
    const before = this.snapshot(rule);
    if (!rule) {
      rule = this.shippingRulesRepository.create(input);
    } else {
      Object.assign(rule, input);
    }
    const saved = await this.shippingRulesRepository.save(rule);
    await this.logAdminAction({
      actorUserId,
      action: 'shippingRule.upsert',
      entityType: 'ShippingRule',
      entityId: saved.id,
      beforeState: before,
      afterState: this.snapshot(saved),
    });
    return saved;
  }

  async taxRules(): Promise<TaxRule[]> {
    return this.taxRulesRepository.find({ order: { region: 'ASC' } });
  }

  async shippingRules(): Promise<ShippingRule[]> {
    return this.shippingRulesRepository.find({ order: { region: 'ASC' } });
  }
}
