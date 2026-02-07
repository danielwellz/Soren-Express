import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/common/enums';
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
import { Repository } from 'typeorm';
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
    @InjectRepository(TaxRule)
    private readonly taxRulesRepository: Repository<TaxRule>,
    @InjectRepository(ShippingRule)
    private readonly shippingRulesRepository: Repository<ShippingRule>,
  ) {}

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    return this.categoriesRepository.save(this.categoriesRepository.create(input));
  }

  async categories(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    const category = await this.categoriesRepository.findOne(input.id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    category.name = input.name;
    category.description = input.description;
    return this.categoriesRepository.save(category);
  }

  async deleteCategory(id: number): Promise<boolean> {
    const category = await this.categoriesRepository.findOne(id);
    if (!category) {
      return false;
    }
    await this.categoriesRepository.remove(category);
    return true;
  }

  async createBrand(input: CreateBrandInput): Promise<Brand> {
    return this.brandsRepository.save(this.brandsRepository.create(input));
  }

  async brands(): Promise<Brand[]> {
    return this.brandsRepository.find({ order: { name: 'ASC' } });
  }

  async updateBrand(input: UpdateBrandInput): Promise<Brand> {
    const brand = await this.brandsRepository.findOne(input.id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    brand.name = input.name;
    brand.description = input.description;
    return this.brandsRepository.save(brand);
  }

  async deleteBrand(id: number): Promise<boolean> {
    const brand = await this.brandsRepository.findOne(id);
    if (!brand) {
      return false;
    }
    await this.brandsRepository.remove(brand);
    return true;
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    const category = await this.categoriesRepository.findOne(input.categoryId);
    const brand = await this.brandsRepository.findOne(input.brandId);

    if (!category || !brand) {
      throw new BadRequestException('Invalid category or brand');
    }

    return this.productsRepository.save(
      this.productsRepository.create({
        ...input,
        category,
        brand,
      }),
    );
  }

  async updateProduct(input: UpdateProductInput): Promise<Product> {
    const product = await this.productsRepository.findOne(input.id, {
      relations: ['category', 'brand'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const category = await this.categoriesRepository.findOne(input.categoryId);
    const brand = await this.brandsRepository.findOne(input.brandId);

    if (!category || !brand) {
      throw new BadRequestException('Invalid category or brand');
    }

    Object.assign(product, {
      name: input.name,
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

    return this.productsRepository.save(product);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const product = await this.productsRepository.findOne(id);
    if (!product) {
      return false;
    }
    await this.productsRepository.remove(product);
    return true;
  }

  async createVariant(input: CreateVariantInput): Promise<ProductVariant> {
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

    return this.variantsRepository.findOne(variant.id, {
      relations: ['product', 'inventory'],
    });
  }

  async updateInventory(input: UpdateInventoryInput): Promise<Inventory> {
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

    inventory.quantity = input.quantity;
    if (input.lowStockThreshold !== undefined) {
      inventory.lowStockThreshold = input.lowStockThreshold;
    }

    return this.inventoryRepository.save(inventory);
  }

  async createCoupon(input: CreateCouponInput): Promise<Coupon> {
    return this.couponsRepository.save(
      this.couponsRepository.create({
        ...input,
        code: input.code.toUpperCase(),
      }),
    );
  }

  async coupons(): Promise<Coupon[]> {
    return this.couponsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateCoupon(input: UpdateCouponInput): Promise<Coupon> {
    const coupon = await this.couponsRepository.findOne(input.id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    Object.assign(coupon, {
      code: input.code.toUpperCase(),
      type: input.type,
      amount: input.amount,
      minOrderAmount: input.minOrderAmount,
      active: input.active,
      expiresAt: input.expiresAt,
    });
    return this.couponsRepository.save(coupon);
  }

  async deleteCoupon(id: number): Promise<boolean> {
    const coupon = await this.couponsRepository.findOne(id);
    if (!coupon) {
      return false;
    }
    await this.couponsRepository.remove(coupon);
    return true;
  }

  async users(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateUserRole(input: UpdateUserRoleInput): Promise<User> {
    const user = await this.usersRepository.findOne(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = input.role;
    return this.usersRepository.save(user);
  }

  async updateUserStatus(input: UpdateUserStatusInput): Promise<User> {
    const user = await this.usersRepository.findOne(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.active = input.active;
    return this.usersRepository.save(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      return false;
    }
    await this.usersRepository.remove(user);
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

  async updateOrderStatus(input: UpdateOrderStatusInput): Promise<Order> {
    const order = await this.ordersRepository.findOne(input.orderId, {
      relations: ['shipment', 'payment', 'items', 'coupon', 'user'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = input.status;
    if (input.status === OrderStatus.FULFILLED && order.shipment) {
      order.shipment.status = 'DELIVERED' as any;
      order.shipment.deliveredAt = new Date();
    }

    return this.ordersRepository.save(order);
  }

  async upsertTaxRule(input: UpsertTaxRuleInput): Promise<TaxRule> {
    let rule = await this.taxRulesRepository.findOne({ where: { region: input.region } });
    if (!rule) {
      rule = this.taxRulesRepository.create(input);
    } else {
      Object.assign(rule, input);
    }
    return this.taxRulesRepository.save(rule);
  }

  async upsertShippingRule(input: UpsertShippingRuleInput): Promise<ShippingRule> {
    let rule = await this.shippingRulesRepository.findOne({ where: { region: input.region } });
    if (!rule) {
      rule = this.shippingRulesRepository.create(input);
    } else {
      Object.assign(rule, input);
    }
    return this.shippingRulesRepository.save(rule);
  }

  async taxRules(): Promise<TaxRule[]> {
    return this.taxRulesRepository.find({ order: { region: 'ASC' } });
  }

  async shippingRules(): Promise<ShippingRule[]> {
    return this.shippingRulesRepository.find({ order: { region: 'ASC' } });
  }
}
