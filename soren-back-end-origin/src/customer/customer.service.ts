import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { NewsletterSubscriptionStatus, SupportMessageStatus } from 'src/common/enums';
import {
  AddressBookEntry,
  AnalyticsEvent,
  BackInStockSubscription,
  CheckoutProfile,
  NewsletterSubscription,
  Order,
  Product,
  ProductVariant,
  SupportMessage,
  User,
  WishlistItem,
} from 'src/entities';
import { NotificationService } from 'src/notifications/notification.service';
import { Repository } from 'typeorm';
import {
  BackInStockSubscriptionInput,
  ClientAnalyticsInput,
  NewsletterSubscriptionInput,
  SaveAddressInput,
  SupportMessageInput,
  UpdateAddressInput,
  WishlistProductInput,
} from './customer.inputs';
import { ActionResponse } from './customer.types';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepository: Repository<WishlistItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
    @InjectRepository(BackInStockSubscription)
    private readonly backInStockRepository: Repository<BackInStockSubscription>,
    @InjectRepository(NewsletterSubscription)
    private readonly newsletterRepository: Repository<NewsletterSubscription>,
    @InjectRepository(SupportMessage)
    private readonly supportMessagesRepository: Repository<SupportMessage>,
    @InjectRepository(AddressBookEntry)
    private readonly addressBookRepository: Repository<AddressBookEntry>,
    @InjectRepository(CheckoutProfile)
    private readonly checkoutProfileRepository: Repository<CheckoutProfile>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly analyticsService: AnalyticsService,
    private readonly notificationService: NotificationService,
  ) {}

  async myWishlist(user: User): Promise<Product[]> {
    const items = await this.wishlistRepository.find({
      where: { user },
      relations: ['product', 'product.brand', 'product.category', 'product.variants', 'product.variants.inventory'],
      order: { createdAt: 'DESC' },
    });

    return items.map((item) => item.product);
  }

  async addToWishlist(input: WishlistProductInput, user: User): Promise<Product[]> {
    const product = await this.productsRepository.findOne(input.productId, {
      relations: ['brand', 'category', 'variants', 'variants.inventory'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.wishlistRepository.findOne({
      where: { user, product },
    });

    if (!existing) {
      await this.wishlistRepository.save(
        this.wishlistRepository.create({
          user,
          product,
        }),
      );
    }

    return this.myWishlist(user);
  }

  async removeFromWishlist(input: WishlistProductInput, user: User): Promise<Product[]> {
    const existing = await this.wishlistRepository
      .createQueryBuilder('wishlist')
      .leftJoinAndSelect('wishlist.product', 'product')
      .where('wishlist.userId = :userId', { userId: user.id })
      .andWhere('product.id = :productId', { productId: input.productId })
      .getOne();

    if (existing) {
      await this.wishlistRepository.remove(existing);
    }

    return this.myWishlist(user);
  }

  async subscribeBackInStock(
    input: BackInStockSubscriptionInput,
    user?: User,
  ): Promise<ActionResponse> {
    if (!input.variantId && !input.productId) {
      throw new BadRequestException('productId or variantId is required');
    }

    let variant: ProductVariant;
    let product: Product;

    if (input.variantId) {
      variant = await this.variantsRepository.findOne(input.variantId, {
        relations: ['product', 'inventory'],
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      product = variant.product;

      const available = Number(variant.inventory?.quantity || 0) - Number(variant.inventory?.reserved || 0);
      if (available > 0) {
        return {
          success: true,
          message: 'Variant is currently in stock',
        };
      }
    } else {
      product = await this.productsRepository.findOne(input.productId, {
        relations: ['variants', 'variants.inventory'],
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      variant = product.variants?.[0];
    }

    let existing: BackInStockSubscription;

    if (variant) {
      existing = await this.backInStockRepository.findOne({
        where: { email: input.email.toLowerCase(), variant },
      });
    }

    if (!existing && product) {
      existing = await this.backInStockRepository.findOne({
        where: { email: input.email.toLowerCase(), product },
      });
    }

    if (!existing) {
      existing = this.backInStockRepository.create({
        email: input.email.toLowerCase(),
        user,
        product,
        variant,
        active: true,
      });
    } else {
      existing.active = true;
      existing.user = user || existing.user;
    }

    await this.backInStockRepository.save(existing);

    await this.notificationService.sendEmail(
      input.email,
      'Back in stock subscription received',
      'We will notify you as soon as this item becomes available again.',
    );

    return {
      success: true,
      message: 'Subscription created',
    };
  }

  async subscribeNewsletter(input: NewsletterSubscriptionInput): Promise<ActionResponse> {
    const normalizedEmail = input.email.toLowerCase();
    let subscription = await this.newsletterRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!subscription) {
      subscription = this.newsletterRepository.create({
        email: normalizedEmail,
        locale: input.locale,
      });
    }

    subscription.status = NewsletterSubscriptionStatus.PENDING;
    subscription.locale = input.locale || subscription.locale;
    subscription.confirmationToken = `news_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await this.newsletterRepository.save(subscription);

    await this.notificationService.sendEmail(
      normalizedEmail,
      'Confirm your newsletter subscription',
      'Please confirm your newsletter subscription. Double opt-in flow is active in demo mode.',
    );

    return {
      success: true,
      message: 'Subscription pending confirmation',
    };
  }

  async submitSupportMessage(input: SupportMessageInput, user?: User): Promise<SupportMessage> {
    const message = await this.supportMessagesRepository.save(
      this.supportMessagesRepository.create({
        user,
        email: input.email || user?.email,
        message: input.message,
        status: SupportMessageStatus.OPEN,
      }),
    );

    await this.notificationService.sendEmail(
      'support@soren.store',
      'New support message',
      input.message,
    );

    return message;
  }

  async trackClientAnalytics(input: ClientAnalyticsInput, user?: User): Promise<AnalyticsEvent> {
    let product: Product;
    let order: Order;

    if (input.productId) {
      product = await this.productsRepository.findOne(input.productId);
    }

    if (input.orderId) {
      order = await this.ordersRepository.findOne(input.orderId);
    }

    return this.analyticsService.trackEvent({
      eventType: input.eventType,
      sessionId: input.sessionId,
      user,
      product,
      order,
      metadata: input.metadata,
    });
  }

  async myAddresses(user: User): Promise<AddressBookEntry[]> {
    return this.addressBookRepository.find({
      where: { user },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async saveAddress(input: SaveAddressInput, user: User): Promise<AddressBookEntry> {
    if (input.isDefault) {
      await this.clearDefaultAddresses(user);
    }

    const hasDefault = await this.addressBookRepository.findOne({ where: { user, isDefault: true } });

    return this.addressBookRepository.save(
      this.addressBookRepository.create({
        ...input,
        user,
        isDefault: input.isDefault || !hasDefault,
      }),
    );
  }

  async updateAddress(input: UpdateAddressInput, user: User): Promise<AddressBookEntry> {
    const address = await this.addressBookRepository.findOne({ where: { id: input.id, user } });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (input.isDefault) {
      await this.clearDefaultAddresses(user);
    }

    Object.assign(address, input);
    return this.addressBookRepository.save(address);
  }

  async deleteAddress(id: number, user: User): Promise<boolean> {
    const address = await this.addressBookRepository.findOne({ where: { id, user } });

    if (!address) {
      return false;
    }

    await this.addressBookRepository.remove(address);

    if (address.isDefault) {
      const fallback = await this.addressBookRepository.findOne({
        where: { user },
        order: { createdAt: 'DESC' },
      });

      if (fallback) {
        fallback.isDefault = true;
        await this.addressBookRepository.save(fallback);
      }
    }

    return true;
  }

  async setDefaultAddress(id: number, user: User): Promise<AddressBookEntry> {
    const address = await this.addressBookRepository.findOne({ where: { id, user } });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.clearDefaultAddresses(user);
    address.isDefault = true;
    return this.addressBookRepository.save(address);
  }

  async myCheckoutProfile(user: User): Promise<CheckoutProfile> {
    return this.checkoutProfileRepository.findOne({ where: { user } });
  }

  private async clearDefaultAddresses(user: User): Promise<void> {
    const addresses = await this.addressBookRepository.find({ where: { user } });

    if (!addresses.length) {
      return;
    }

    for (const address of addresses) {
      if (!address.isDefault) {
        continue;
      }
      address.isDefault = false;
      await this.addressBookRepository.save(address);
    }
  }
}
