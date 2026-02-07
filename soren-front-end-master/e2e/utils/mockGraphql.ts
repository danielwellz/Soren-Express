import { Page } from '@playwright/test';

type CartItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  variant: {
    id: number;
    sku: string;
    color: string;
    size: string;
    product: {
      id: number;
      name: string;
      thumbnail: string;
      basePrice: number;
    };
    inventory: {
      quantity: number;
      reserved: number;
    };
  };
};

type MockState = {
  sessionId: string;
  cartItems: CartItem[];
  user: null | {
    id: number;
    email: string;
    fullName: string;
    role: 'CUSTOMER' | 'ADMIN';
    phone?: string;
    address?: string;
  };
  nextCartItemId: number;
  nextOrderId: number;
  paymentIntentId: string;
  mergeCalls: number;
  operations: string[];
};

const sampleProduct = {
  id: 101,
  name: 'JBL Flip 6',
  slug: 'jbl-flip-6',
  description: 'Portable smart speaker',
  basePrice: 129.99,
  thumbnail: '/images/150x150.png',
  galleryUrls: ['/images/150x150.png', '/images/150x150.png'],
  averageRating: 4.7,
  brand: { id: 1, name: 'JBL' },
  category: { id: 1, name: 'Speakers' },
  variants: [
    {
      id: 501,
      sku: 'JBL-FLIP-6-BLK',
      color: 'Black',
      size: 'One Size',
      priceAdjustment: 0,
      inventory: { quantity: 15, reserved: 1 },
    },
  ],
};

function jwtToken() {
  const payload = Buffer.from(JSON.stringify({ exp: 4_102_444_800 })).toString('base64');
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.signature`;
}

function totalsFromCart(cartItems: CartItem[]) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = subtotal >= 100 ? 10 : 0;
  const shipping = subtotal > 0 ? 8 : 0;
  const tax = subtotal > 0 ? Number(((subtotal - discount + shipping) * 0.07).toFixed(2)) : 0;
  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: Number((subtotal - discount + shipping + tax).toFixed(2)),
  };
}

function currentCart(state: MockState) {
  return {
    id: 1,
    sessionId: state.sessionId,
    active: true,
    items: state.cartItems,
  };
}

export async function setupGraphqlMocks(page: Page, initialState?: Partial<MockState>) {
  const state: MockState = {
    sessionId: 'sess_playwright',
    cartItems: [],
    user: null,
    nextCartItemId: 1,
    nextOrderId: 900,
    paymentIntentId: 'pi_900',
    mergeCalls: 0,
    operations: [],
    ...initialState,
  };

  await page.addInitScript((sessionId) => {
    localStorage.setItem('soren_guest_session_id', sessionId);
  }, state.sessionId);

  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    const operationName = body?.operationName as string | undefined;
    const variables = body?.variables ?? {};
    state.operations.push(operationName || 'Unknown');

    const fulfill = (data: unknown) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data }),
      });

    switch (operationName) {
      case 'Categories':
        return fulfill({
          categories: [{ id: 1, name: 'Speakers', description: 'Portable audio' }],
        });
      case 'Brands':
        return fulfill({
          brands: [{ id: 1, name: 'JBL', description: 'Audio gear' }],
        });
      case 'FeaturedProducts':
        return fulfill({
          featuredProducts: [
            {
              id: sampleProduct.id,
              name: sampleProduct.name,
              basePrice: sampleProduct.basePrice,
              thumbnail: sampleProduct.thumbnail,
              brand: { name: sampleProduct.brand.name },
              category: { name: sampleProduct.category.name },
              variants: sampleProduct.variants.map((variant) => ({
                id: variant.id,
                inventory: variant.inventory,
              })),
            },
          ],
        });
      case 'Products':
        return fulfill({
          products: {
            total: 1,
            page: 1,
            pageSize: 12,
            items: [sampleProduct],
          },
        });
      case 'Product':
        return fulfill({
          product: {
            ...sampleProduct,
            relatedProducts: [
              {
                id: 202,
                name: 'JBL Charge 5',
                basePrice: 159.99,
                thumbnail: '/images/150x150.png',
                brand: { name: 'JBL' },
              },
            ],
          },
        });
      case 'Reviews':
        return fulfill({ reviews: [] });
      case 'Cart':
        return fulfill({ cart: currentCart(state) });
      case 'AddToCart': {
        const variantId = Number(variables?.input?.variantId || sampleProduct.variants[0].id);
        const quantity = Number(variables?.input?.quantity || 1);
        const existing = state.cartItems.find((item) => item.variant.id === variantId);

        if (existing) {
          existing.quantity += quantity;
        } else {
          state.cartItems.push({
            id: state.nextCartItemId++,
            quantity,
            unitPrice: sampleProduct.basePrice,
            variant: {
              id: sampleProduct.variants[0].id,
              sku: sampleProduct.variants[0].sku,
              color: sampleProduct.variants[0].color,
              size: sampleProduct.variants[0].size,
              inventory: sampleProduct.variants[0].inventory,
              product: {
                id: sampleProduct.id,
                name: sampleProduct.name,
                thumbnail: sampleProduct.thumbnail,
                basePrice: sampleProduct.basePrice,
              },
            },
          });
        }

        return fulfill({
          addToCart: {
            id: 1,
            items: state.cartItems.map((item) => ({ id: item.id })),
          },
        });
      }
      case 'UpdateCartItem': {
        const cartItemId = Number(variables?.input?.cartItemId);
        const quantity = Number(variables?.input?.quantity);
        const item = state.cartItems.find((cartItem) => cartItem.id === cartItemId);
        if (item) {
          item.quantity = quantity;
        }
        return fulfill({
          updateCartItem: {
            id: 1,
            items: state.cartItems.map((cartItem) => ({ id: cartItem.id })),
          },
        });
      }
      case 'RemoveCartItem': {
        const cartItemId = Number(variables?.input?.cartItemId);
        state.cartItems = state.cartItems.filter((cartItem) => cartItem.id !== cartItemId);
        return fulfill({
          removeCartItem: {
            id: 1,
            items: state.cartItems.map((cartItem) => ({ id: cartItem.id })),
          },
        });
      }
      case 'Login': {
        state.user = {
          id: 31,
          email: variables?.input?.email || 'shopper@soren.store',
          fullName: 'Soren Shopper',
          role: 'CUSTOMER',
        };
        return fulfill({
          login: {
            user: state.user,
            tokens: {
              accessToken: jwtToken(),
              refreshToken: jwtToken(),
            },
          },
        });
      }
      case 'Register': {
        state.user = {
          id: 41,
          email: variables?.input?.email || 'new@soren.store',
          fullName: variables?.input?.fullName || 'New Shopper',
          role: 'CUSTOMER',
          phone: variables?.input?.phone || '',
        };
        return fulfill({
          register: {
            user: state.user,
            tokens: {
              accessToken: jwtToken(),
              refreshToken: jwtToken(),
            },
          },
        });
      }
      case 'MergeGuestCart':
        state.mergeCalls += 1;
        return fulfill({
          mergeGuestCart: {
            id: 1,
          },
        });
      case 'Me':
        return fulfill({
          me:
            state.user || {
              id: 0,
              email: '',
              fullName: '',
              role: 'CUSTOMER',
            },
        });
      case 'MyOrders':
        return fulfill({ myOrders: [] });
      case 'CheckoutPreview':
        return fulfill({
          checkoutPreview: {
            totals: totalsFromCart(state.cartItems),
            cart: currentCart(state),
          },
        });
      case 'CreateOrder': {
        const orderId = state.nextOrderId++;
        const totals = totalsFromCart(state.cartItems);
        return fulfill({
          createOrder: {
            id: orderId,
            total: totals.total,
            status: 'PENDING',
          },
        });
      }
      case 'CreatePaymentIntent': {
        const orderId = Number(variables?.input?.orderId || state.nextOrderId);
        state.paymentIntentId = `pi_${orderId}`;
        return fulfill({
          createPaymentIntent: {
            clientSecret: `secret_${orderId}`,
            payment: {
              id: orderId,
              intentId: state.paymentIntentId,
              status: 'REQUIRES_CONFIRMATION',
            },
          },
        });
      }
      case 'ConfirmPayment': {
        const totals = totalsFromCart(state.cartItems);
        return fulfill({
          confirmPayment: {
            order: {
              id: Number(variables?.input?.intentId?.replace('pi_', '') || state.nextOrderId),
              status: 'PAID',
              total: totals.total,
            },
            payment: {
              id: 1,
              status: 'SUCCEEDED',
              last4: variables?.input?.cardLast4 || '4242',
            },
          },
        });
      }
      case 'ForgotPassword':
        return fulfill({ forgotPassword: true });
      default:
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            errors: [{ message: `Unhandled operation ${operationName || 'Unknown'}` }],
          }),
        });
    }
  });

  return state;
}
