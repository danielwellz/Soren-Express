import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticsService } from 'src/analytics/analytics.service';
import {
  Cart,
  CartItem,
  Coupon,
  Inventory,
  ProductVariant,
  User,
} from 'src/entities';
import { Repository } from 'typeorm';
import {
  AddCartItemInput,
  ApplyCartPromoInput,
  MergeGuestCartInput,
  RemoveCartItemInput,
  RemoveCartPromoInput,
  UpdateCartItemInput,
} from './cart.inputs';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async getCartForUserOrSession(user?: User, sessionId?: string): Promise<Cart> {
    if (!user && !sessionId) {
      throw new BadRequestException('sessionId is required for guest cart');
    }

    let cart: Cart;
    if (user) {
      cart = await this.cartsRepository.findOne({
        where: { user, active: true },
        relations: ['items', 'items.variant', 'items.variant.product', 'items.variant.inventory'],
      });
      if (!cart) {
        cart = await this.cartsRepository.save(
          this.cartsRepository.create({ user, active: true }),
        );
      }
    } else {
      cart = await this.cartsRepository.findOne({
        where: { sessionId, active: true },
        relations: ['items', 'items.variant', 'items.variant.product', 'items.variant.inventory'],
      });
      if (!cart) {
        cart = await this.cartsRepository.save(
          this.cartsRepository.create({ sessionId, active: true }),
        );
      }
    }

    if (!cart.items) {
      cart.items = [];
    }

    return cart;
  }

  async addItem(input: AddCartItemInput, user?: User): Promise<Cart> {
    const cart = await this.getCartForUserOrSession(user, input.sessionId);

    const variant = await this.variantsRepository.findOne(input.variantId, {
      relations: ['product', 'inventory'],
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    const inventory = await this.inventoryRepository.findOne({ where: { variant } });
    if (!inventory || inventory.quantity - inventory.reserved < input.quantity) {
      throw new BadRequestException('Insufficient inventory');
    }

    let cartItem = await this.cartItemsRepository.findOne({
      where: { cart, variant },
      relations: ['cart', 'variant', 'variant.product', 'variant.inventory'],
    });

    const unitPrice = Number(variant.product.basePrice) + Number(variant.priceAdjustment);

    if (cartItem) {
      const newQty = cartItem.quantity + input.quantity;
      if (newQty > inventory.quantity - inventory.reserved) {
        throw new BadRequestException('Insufficient inventory');
      }
      cartItem.quantity = newQty;
      cartItem.unitPrice = unitPrice;
      await this.cartItemsRepository.save(cartItem);
    } else {
      cartItem = this.cartItemsRepository.create({
        cart,
        variant,
        quantity: input.quantity,
        unitPrice,
      });
      await this.cartItemsRepository.save(cartItem);
    }

    await this.analyticsService.trackEvent({
      eventType: 'add_to_cart',
      user,
      product: variant.product,
      sessionId: input.sessionId,
      metadata: {
        variantId: variant.id,
        quantity: input.quantity,
      },
    });

    return this.getCartForUserOrSession(user, input.sessionId);
  }

  async updateItem(input: UpdateCartItemInput, user?: User): Promise<Cart> {
    const item = await this.cartItemsRepository.findOne(input.cartItemId, {
      relations: ['cart', 'variant', 'variant.inventory'],
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    this.assertOwnership(item.cart, user, input.sessionId);

    const available = item.variant.inventory
      ? item.variant.inventory.quantity - item.variant.inventory.reserved
      : 0;

    if (input.quantity > available) {
      throw new BadRequestException('Insufficient inventory');
    }

    item.quantity = input.quantity;
    await this.cartItemsRepository.save(item);

    return this.getCartForUserOrSession(user, input.sessionId);
  }

  async removeItem(input: RemoveCartItemInput, user?: User): Promise<Cart> {
    const item = await this.cartItemsRepository.findOne(input.cartItemId, {
      relations: ['cart'],
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    this.assertOwnership(item.cart, user, input.sessionId);

    await this.cartItemsRepository.remove(item);
    return this.getCartForUserOrSession(user, input.sessionId);
  }

  async clearCart(cart: Cart): Promise<void> {
    if (!cart.items?.length) {
      return;
    }
    await this.cartItemsRepository.remove(cart.items);
  }

  async mergeGuestCartToUser(input: MergeGuestCartInput, user: User): Promise<Cart> {
    const userCart = await this.getCartForUserOrSession(user, undefined);
    const guestCart = await this.cartsRepository.findOne({
      where: { sessionId: input.sessionId, active: true },
      relations: ['items', 'items.variant', 'items.variant.product', 'items.variant.inventory'],
    });

    if (!guestCart) {
      return userCart;
    }

    if (guestCart.promoCode && !userCart.promoCode) {
      userCart.promoCode = guestCart.promoCode;
      await this.cartsRepository.save(userCart);
    }

    if (!guestCart.items?.length) {
      guestCart.active = false;
      await this.cartsRepository.save(guestCart);
      return this.getCartForUserOrSession(user, undefined);
    }

    for (const item of guestCart.items) {
      await this.addItem(
        {
          variantId: item.variant.id,
          quantity: item.quantity,
        },
        user,
      );
    }

    guestCart.active = false;
    await this.cartsRepository.save(guestCart);
    return this.getCartForUserOrSession(user, undefined);
  }

  async applyPromoCode(input: ApplyCartPromoInput, user?: User): Promise<Cart> {
    const cart = await this.getCartForUserOrSession(user, input.sessionId);
    const couponCode = input.couponCode.trim().toUpperCase();
    const coupon = await this.couponsRepository.findOne({ where: { code: couponCode } });

    if (!coupon || !coupon.active) {
      throw new BadRequestException('Invalid coupon');
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('Coupon expired');
    }

    cart.promoCode = couponCode;
    await this.cartsRepository.save(cart);
    return this.getCartForUserOrSession(user, input.sessionId);
  }

  async removePromoCode(input: RemoveCartPromoInput, user?: User): Promise<Cart> {
    const cart = await this.getCartForUserOrSession(user, input.sessionId);
    cart.promoCode = null;
    await this.cartsRepository.save(cart);
    return this.getCartForUserOrSession(user, input.sessionId);
  }

  private assertOwnership(cart: Cart, user?: User, sessionId?: string): void {
    if (user && cart.user && cart.user.id === user.id) {
      return;
    }

    if (!user && cart.sessionId === sessionId) {
      return;
    }

    throw new BadRequestException('Cart ownership mismatch');
  }
}
