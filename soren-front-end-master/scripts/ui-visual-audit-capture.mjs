import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const ROOT = process.cwd();
const SHOTS_ROOT = path.join(ROOT, '..', 'docs', 'screenshots');
const METADATA_PATH = path.join(SHOTS_ROOT, 'metadata.jsonl');
const ROUTES_PATH = path.join(SHOTS_ROOT, 'discovered-routes.json');

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

const PAGES = [
  { key: 'home', route: '/', auth: 'guest' },
  { key: 'products', route: '/products', auth: 'guest' },
  { key: 'product-detail', route: '/products/101', auth: 'guest' },
  { key: 'cart', route: '/cart', auth: 'guest' },
  { key: 'checkout', route: '/checkout', auth: 'customer' },
  { key: 'login', route: '/auth/login', auth: 'guest' },
  { key: 'register', route: '/auth/register', auth: 'guest' },
  { key: 'forgot-password', route: '/auth/forgot-password', auth: 'guest' },
  { key: 'account', route: '/account', auth: 'customer' },
  { key: 'order-details', route: '/account/orders/900', auth: 'customer' },
  { key: 'wishlist', route: '/wishlist', auth: 'guest' },
  { key: 'compare', route: '/compare', auth: 'guest' },
  { key: 'admin', route: '/admin', auth: 'admin' },
  { key: 'not-found', route: '/definitely-missing', auth: 'guest' },
];

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjQxMDI0NDQ4MDB9.signature';

const PRODUCT = {
  id: 101,
  name: 'JBL Flip 6',
  slug: 'jbl-flip-6',
  description: 'Portable Bluetooth speaker with premium sound and rugged build.',
  basePrice: 129.99,
  thumbnail: '/images/150x150.png',
  galleryUrls: ['/images/150x150.png', '/images/150x150.png'],
  averageRating: 4.7,
  brand: { id: 1, name: 'JBL' },
  category: { id: 1, name: 'Speakers' },
  variants: [{ id: 501, sku: 'JBL-FLIP-6-BLK', color: 'Black', size: 'One Size', priceAdjustment: 0, inventory: { quantity: 15, reserved: 1 } }],
};

const PRODUCT_2 = {
  ...PRODUCT,
  id: 102,
  name: 'JBL Charge 5',
  slug: 'jbl-charge-5',
  basePrice: 159.99,
  variants: [{ id: 502, sku: 'JBL-CHARGE-5-GRY', color: 'Grey', size: 'One Size', priceAdjustment: 0, inventory: { quantity: 8, reserved: 0 } }],
};

const COMPARE_PRODUCTS = [PRODUCT, PRODUCT_2];

const MAIN_OPS = {
  home: ['FeaturedProducts'],
  products: ['Products'],
  'product-detail': ['Product'],
  cart: ['Cart'],
  checkout: ['MyAddresses', 'MyCheckoutProfile'],
  login: [],
  register: [],
  'forgot-password': [],
  account: ['MyOrders'],
  'order-details': ['OrderById'],
  wishlist: ['MyWishlist'],
  compare: [],
  admin: ['AdminProducts', 'AdminOrders', 'AdminUsers', 'AdminCoupons', 'AdminAnalyticsEvents'],
  'not-found': [],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function totalsFromCart(items, promoCode) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const discount = promoCode ? 10 : 0;
  const shipping = subtotal > 0 ? 8 : 0;
  const tax = subtotal > 0 ? Number(((subtotal - discount + shipping) * 0.07).toFixed(2)) : 0;
  return { subtotal, discount, shipping, tax, total: Number((subtotal - discount + shipping + tax).toFixed(2)) };
}

function buildOrder() {
  return {
    id: 900,
    status: 'PAID',
    total: 137.99,
    subtotal: 129.99,
    discount: 0,
    shipping: 8,
    tax: 0,
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    shippingName: 'Soren Shopper',
    shippingAddress: '1 Main Street',
    shippingCity: 'Austin',
    shippingRegion: 'US-DEFAULT',
    shippingPostalCode: '78701',
    items: [{ id: 1, productName: PRODUCT.name, variantLabel: 'Black / One Size', sku: PRODUCT.variants[0].sku, quantity: 1, unitPrice: PRODUCT.basePrice, lineTotal: PRODUCT.basePrice }],
    payment: { id: 1, status: 'SUCCEEDED', provider: 'FAKEPAY', last4: '4242' },
    shipment: { id: 1, status: 'SHIPPED', trackingNumber: 'TRACK-900' },
    coupon: null,
    statusHistory: [{ id: 1, status: 'PENDING', note: 'Order created', createdAt: new Date(Date.now() - 90_000_000).toISOString() }, { id: 2, status: 'PAID', note: 'Payment confirmed', createdAt: new Date(Date.now() - 80_000_000).toISOString() }],
    returnRequests: [],
  };
}

function cartWithItems() {
  return [{
    id: 1,
    quantity: 1,
    unitPrice: PRODUCT.basePrice,
    variant: {
      id: PRODUCT.variants[0].id,
      sku: PRODUCT.variants[0].sku,
      color: PRODUCT.variants[0].color,
      size: PRODUCT.variants[0].size,
      inventory: PRODUCT.variants[0].inventory,
      product: {
        id: PRODUCT.id,
        name: PRODUCT.name,
        thumbnail: PRODUCT.thumbnail,
        basePrice: PRODUCT.basePrice,
      },
    },
  }];
}

function wishlistItems() {
  return COMPARE_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    basePrice: p.basePrice,
    thumbnail: p.thumbnail,
    averageRating: p.averageRating,
    brand: p.brand,
    category: p.category,
    variants: p.variants,
  }));
}

function makeServerState(config = {}) {
  const auth = config.auth || 'guest';
  const customer = { id: 31, email: 'customer@soren.store', fullName: 'Soren Shopper', role: 'CUSTOMER', phone: '555-0001', address: '1 Main Street' };
  const admin = { id: 1, email: 'admin@soren.store', fullName: 'Store Admin', role: 'ADMIN', phone: '555-0000', address: 'HQ' };
  const user = auth === 'admin' ? admin : auth === 'customer' ? customer : null;
  const cartItems = config.cartItems ? cartWithItems() : [];
  const myOrders = config.orders === false ? [] : [buildOrder()];

  return {
    auth,
    user,
    cartItems,
    promoCode: null,
    paymentIntentId: 'pi_900',
    nextOrderId: 901,
    categories: [{ id: 1, name: 'Speakers', description: 'Portable audio' }],
    brands: [{ id: 1, name: 'JBL', description: 'Audio gear' }],
    products: config.productsEmpty ? [] : [PRODUCT, PRODUCT_2],
    wishlist: config.wishlistEmpty ? [] : wishlistItems(),
    addresses: config.addressesEmpty ? [] : [{ id: 1, fullName: 'Soren Shopper', line1: '1 Main Street', city: 'Austin', region: 'US-DEFAULT', postalCode: '78701', isDefault: true }],
    checkoutProfile: config.addressesEmpty ? null : { shippingName: 'Soren Shopper', shippingLine1: '1 Main Street', shippingCity: 'Austin', shippingRegion: 'US-DEFAULT', shippingPostalCode: '78701', cardholderName: 'Soren Shopper', cardLast4: '4242', cardExpiry: '12/28' },
    myOrders,
    orderById: config.orderMissing ? null : buildOrder(),
    adminProducts: [PRODUCT, PRODUCT_2],
    adminOrders: [buildOrder()],
    adminUsers: [admin, customer],
    adminCoupons: [{ id: 1, code: 'SAVE10', type: 'PERCENT', amount: 10, minOrderAmount: 50, active: true }],
    adminAnalyticsEvents: [{ id: 1, eventType: 'purchase', createdAt: new Date().toISOString() }, { id: 2, eventType: 'add_to_cart', createdAt: new Date().toISOString() }],
  };
}

function setClientStorage({ locale, theme, auth, wishlistSeed, compareSeed }) {
  const seed = {
    locale,
    theme,
    auth,
    wishlistSeed,
    compareSeed,
    token: TOKEN,
  };
  return seed;
}

async function installGraphqlMock(page, scenario, serverState) {
  const failOps = new Set(scenario.errorOps || []);
  const delayOps = new Set(scenario.delayOps || []);

  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON() || {};
    const op = body.operationName;
    const vars = body.variables || {};

    const fulfill = (data) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data }) });

    if (failOps.has(op)) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ errors: [{ message: `Forced ${op} error` }] }) });
    }

    if (delayOps.has(op)) {
      await new Promise((r) => setTimeout(r, 5000));
    }

    switch (op) {
      case 'Categories':
        return fulfill({ categories: serverState.categories });
      case 'Brands':
        return fulfill({ brands: serverState.brands });
      case 'FeaturedProducts':
        return fulfill({ featuredProducts: serverState.products.map((p) => ({ id: p.id, name: p.name, basePrice: p.basePrice, thumbnail: p.thumbnail, brand: { name: p.brand.name }, category: { name: p.category.name }, variants: p.variants.map((v) => ({ id: v.id, inventory: v.inventory })) })) });
      case 'Products':
        return fulfill({ products: { total: serverState.products.length, page: 1, pageSize: 12, items: serverState.products } });
      case 'Product': {
        const id = Number(vars?.id || PRODUCT.id);
        const found = serverState.products.find((p) => p.id === id) || null;
        return fulfill({ product: found ? { ...found, relatedProducts: serverState.products.filter((p) => p.id !== found.id).map((p) => ({ id: p.id, name: p.name, basePrice: p.basePrice, thumbnail: p.thumbnail, brand: { name: p.brand.name } })) } : null });
      }
      case 'Reviews':
        return fulfill({ reviews: [] });
      case 'ShippingEstimate': {
        const subtotal = Number(vars?.input?.subtotal || totalsFromCart(serverState.cartItems).subtotal);
        return fulfill({ shippingEstimate: { region: vars?.input?.region || 'US-DEFAULT', flatRate: 8, freeShippingOver: 150, remainingForFreeShipping: Math.max(150 - subtotal, 0), eligibleForFreeShipping: subtotal >= 150, estimatedMinDays: 2, estimatedMaxDays: 5 } });
      }
      case 'Cart':
        return fulfill({ cart: { id: 1, sessionId: 'sess_audit', active: true, promoCode: serverState.promoCode, giftCardCode: null, items: serverState.cartItems } });
      case 'AddToCart': {
        if (!serverState.cartItems.length) {
          serverState.cartItems = cartWithItems();
        } else {
          serverState.cartItems[0].quantity += 1;
        }
        return fulfill({ addToCart: { id: 1, items: serverState.cartItems.map((i) => ({ id: i.id })) } });
      }
      case 'UpdateCartItem':
        return fulfill({ updateCartItem: { id: 1, items: serverState.cartItems.map((i) => ({ id: i.id })) } });
      case 'RemoveCartItem':
        serverState.cartItems = [];
        return fulfill({ removeCartItem: { id: 1, items: [] } });
      case 'ApplyCartPromo': {
        const code = String(vars?.input?.couponCode || '').toUpperCase();
        if (code !== 'SAVE10' && code !== 'WELCOME10') {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ errors: [{ message: 'Invalid coupon' }] }) });
        }
        serverState.promoCode = code;
        return fulfill({ applyCartPromo: { id: 1, promoCode: code, items: serverState.cartItems } });
      }
      case 'RemoveCartPromo':
        serverState.promoCode = null;
        return fulfill({ removeCartPromo: { id: 1, promoCode: null, items: serverState.cartItems } });
      case 'CheckoutPreview':
        return fulfill({ checkoutPreview: { totals: totalsFromCart(serverState.cartItems, serverState.promoCode), cart: { id: 1, items: serverState.cartItems } } });
      case 'CreateOrder':
        return fulfill({ createOrder: { id: serverState.nextOrderId++, total: totalsFromCart(serverState.cartItems, serverState.promoCode).total, status: 'PENDING' } });
      case 'CreatePaymentIntent': {
        const orderId = Number(vars?.input?.orderId || 900);
        serverState.paymentIntentId = `pi_${orderId}`;
        return fulfill({ createPaymentIntent: { clientSecret: `secret_${orderId}`, payment: { id: orderId, intentId: serverState.paymentIntentId, status: 'REQUIRES_CONFIRMATION' } } });
      }
      case 'ConfirmPayment':
        return fulfill({ confirmPayment: { order: { id: 900, status: 'PAID', total: totalsFromCart(serverState.cartItems, serverState.promoCode).total }, payment: { id: 1, status: 'SUCCEEDED', last4: vars?.input?.cardLast4 || '4242' } } });
      case 'Login':
        serverState.user = { id: 31, email: vars?.input?.email || 'customer@soren.store', fullName: 'Soren Shopper', role: 'CUSTOMER' };
        return fulfill({ login: { user: serverState.user, tokens: { accessToken: TOKEN, refreshToken: TOKEN } } });
      case 'Register':
        serverState.user = { id: 41, email: vars?.input?.email || 'new@soren.store', fullName: vars?.input?.fullName || 'New Shopper', role: 'CUSTOMER' };
        return fulfill({ register: { user: serverState.user, tokens: { accessToken: TOKEN, refreshToken: TOKEN } } });
      case 'MergeGuestCart':
        return fulfill({ mergeGuestCart: { id: 1 } });
      case 'ForgotPassword':
        return fulfill({ forgotPassword: true });
      case 'Me':
        return fulfill({ me: serverState.user });
      case 'MyWishlist':
        return fulfill({ myWishlist: serverState.wishlist });
      case 'AddToWishlist':
      case 'RemoveFromWishlist':
        return fulfill({ [op === 'AddToWishlist' ? 'addToWishlist' : 'removeFromWishlist']: serverState.wishlist });
      case 'MyAddresses':
        return fulfill({ myAddresses: serverState.addresses });
      case 'MyCheckoutProfile':
        return fulfill({ myCheckoutProfile: serverState.checkoutProfile });
      case 'MyOrders':
        return fulfill({ myOrders: serverState.myOrders });
      case 'OrderById':
        return fulfill({ orderById: serverState.orderById });
      case 'OrderStatusTimeline':
        return fulfill({ orderStatusTimeline: serverState.orderById?.statusHistory || [] });
      case 'CreateReturnRequest':
        return fulfill({ createReturnRequest: { id: 1, reason: vars?.input?.reason || '', exchangePreferred: Boolean(vars?.input?.exchangePreferred), status: 'REQUESTED', createdAt: new Date().toISOString() } });
      case 'SaveAddress':
        return fulfill({ saveAddress: { id: 99, ...vars?.input } });
      case 'DeleteAddress':
        return fulfill({ deleteAddress: true });
      case 'SetDefaultAddress':
        return fulfill({ setDefaultAddress: true });
      case 'AdminProducts':
        return fulfill({ adminProducts: serverState.adminProducts });
      case 'AdminOrders':
        return fulfill({ adminOrders: serverState.adminOrders });
      case 'AdminUsers':
        return fulfill({ adminUsers: serverState.adminUsers });
      case 'AdminCoupons':
        return fulfill({ adminCoupons: serverState.adminCoupons });
      case 'AdminAnalyticsEvents':
        return fulfill({ adminAnalyticsEvents: serverState.adminAnalyticsEvents });
      case 'AdminCreateCategory':
        return fulfill({ adminCreateCategory: { id: 12, name: vars?.input?.name || 'New Category' } });
      case 'AdminCreateBrand':
        return fulfill({ adminCreateBrand: { id: 13, name: vars?.input?.name || 'New Brand' } });
      case 'AdminCreateProduct':
        return fulfill({ adminCreateProduct: { id: 1400, name: vars?.input?.name || 'New Product' } });
      case 'AdminCreateVariant':
        return fulfill({ adminCreateVariant: { id: 1500, sku: vars?.input?.sku || 'SKU-NEW' } });
      case 'AdminCreateCoupon':
        return fulfill({ adminCreateCoupon: { id: 1600, code: vars?.input?.code || 'NEW10' } });
      case 'AdminUpdateOrderStatus':
        return fulfill({ adminUpdateOrderStatus: { id: vars?.input?.orderId || 900, status: vars?.input?.status || 'PAID' } });
      case 'AdminUpdateUserRole':
        return fulfill({ adminUpdateUserRole: { id: vars?.input?.userId || 31, role: vars?.input?.role || 'ADMIN' } });
      case 'SubscribeNewsletter':
        return fulfill({ subscribeNewsletter: { success: true, message: 'ok' } });
      case 'SubscribeBackInStock':
        return fulfill({ subscribeBackInStock: { success: true, message: 'ok' } });
      case 'SubmitSupportMessage':
        return fulfill({ submitSupportMessage: { id: 1, status: 'OPEN', message: vars?.input?.message || '' } });
      case 'TrackAnalyticsEvent':
        return fulfill({ trackClientAnalytics: { id: 1, eventType: vars?.input?.eventType || 'unknown', metadata: vars?.input?.metadata || {} } });
      default:
        return fulfill({});
    }
  });
}

function buildOutputPath({ viewport, locale, theme, pageKey, state }) {
  const dir = path.join(SHOTS_ROOT, viewport, locale, theme);
  ensureDir(dir);
  return path.join(dir, `${pageKey}__${state}.png`);
}

function recordMetadata(metadata, shot, outPath, timestamp) {
  const viewportSize = VIEWPORTS[shot.viewport];
  const direction = shot.locale === 'fa' ? 'rtl' : 'ltr';
  metadata.push({
    file: path.relative(path.join(ROOT, '..'), outPath),
    route: shot.route,
    url: `${BASE_URL}${shot.route}`,
    viewport: { name: shot.viewport, ...viewportSize },
    locale: shot.locale,
    direction,
    theme: shot.theme,
    page: shot.pageKey,
    state: shot.state,
    timestamp,
  });
}

async function waitReady(page, allowLoading = false) {
  if (!allowLoading) {
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  } else {
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(250);
}

async function captureShot(browser, shot, metadata) {
  const viewportSize = VIEWPORTS[shot.viewport];
  const context = await browser.newContext({ viewport: viewportSize, locale: shot.locale === 'fa' ? 'fa-IR' : 'en-US' });
  const page = await context.newPage();

  const serverState = makeServerState({
    auth: shot.auth,
    cartItems: shot.cartItems,
    orders: shot.orders,
    productsEmpty: shot.productsEmpty,
    wishlistEmpty: shot.wishlistEmpty,
    addressesEmpty: shot.addressesEmpty,
    orderMissing: shot.orderMissing,
  });

  const seed = setClientStorage({
    locale: shot.locale,
    theme: shot.theme,
    auth: shot.auth,
    wishlistSeed: shot.wishlistSeed,
    compareSeed: shot.compareSeed,
  });

  await page.addInitScript((s) => {
    localStorage.setItem('soren_language', s.locale);
    localStorage.setItem('soren_theme_mode', s.theme);
    localStorage.setItem('soren_guest_session_id', 'sess_audit');
    if (s.auth === 'customer' || s.auth === 'admin') {
      localStorage.setItem('soren_access_token', s.token);
      localStorage.setItem('soren_refresh_token', s.token);
    } else {
      localStorage.removeItem('soren_access_token');
      localStorage.removeItem('soren_refresh_token');
    }
    if (Array.isArray(s.wishlistSeed)) {
      localStorage.setItem('soren_wishlist_products', JSON.stringify(s.wishlistSeed));
    } else {
      localStorage.removeItem('soren_wishlist_products');
    }
    if (Array.isArray(s.compareSeed)) {
      localStorage.setItem('soren_compare_products', JSON.stringify(s.compareSeed));
    } else {
      localStorage.removeItem('soren_compare_products');
    }
  }, seed);

  await installGraphqlMock(page, { errorOps: shot.errorOps, delayOps: shot.delayOps }, serverState);

  await page.goto(`${BASE_URL}${shot.route}`, { waitUntil: 'domcontentloaded' });
  await waitReady(page, shot.allowLoading);

  if (typeof shot.action === 'function') {
    await shot.action(page);
    await page.waitForTimeout(450);
  }

  const outPath = buildOutputPath({
    viewport: shot.viewport,
    locale: shot.locale,
    theme: shot.theme,
    pageKey: shot.pageKey,
    state: shot.state,
  });

  await page.screenshot({ path: outPath, fullPage: true });
  recordMetadata(metadata, shot, outPath, nowIso());

  await context.close();
}

function defaultStateShots() {
  const shots = [];

  for (const page of PAGES) {
    for (const viewport of Object.keys(VIEWPORTS)) {
      shots.push({
        pageKey: page.key,
        route: page.route,
        viewport,
        locale: 'en',
        theme: 'light',
        state: 'default',
        auth: page.auth,
        cartItems: page.key === 'cart' || page.key === 'checkout',
        wishlistSeed: page.key === 'wishlist' ? wishlistItems() : null,
        compareSeed: page.key === 'compare' ? wishlistItems().slice(0, 2) : null,
      });
    }

    shots.push({
      pageKey: page.key,
      route: page.route,
      viewport: 'desktop',
      locale: 'fa',
      theme: 'light',
      state: 'default',
      auth: page.auth,
      cartItems: page.key === 'cart' || page.key === 'checkout',
      wishlistSeed: page.key === 'wishlist' ? wishlistItems() : null,
      compareSeed: page.key === 'compare' ? wishlistItems().slice(0, 2) : null,
    });

    shots.push({
      pageKey: page.key,
      route: page.route,
      viewport: 'desktop',
      locale: 'en',
      theme: 'dark',
      state: 'default',
      auth: page.auth,
      cartItems: page.key === 'cart' || page.key === 'checkout',
      wishlistSeed: page.key === 'wishlist' ? wishlistItems() : null,
      compareSeed: page.key === 'compare' ? wishlistItems().slice(0, 2) : null,
    });
  }

  return shots;
}

function stateShots() {
  const desktop = { viewport: 'desktop', locale: 'en', theme: 'light' };

  return [
    { ...desktop, pageKey: 'home', route: '/', state: 'loading', auth: 'guest', delayOps: ['FeaturedProducts'], allowLoading: true },
    { ...desktop, pageKey: 'home', route: '/', state: 'empty', auth: 'guest', productsEmpty: true },
    { ...desktop, pageKey: 'home', route: '/', state: 'error', auth: 'guest', errorOps: ['FeaturedProducts'] },

    { ...desktop, pageKey: 'products', route: '/products', state: 'loading', auth: 'guest', delayOps: ['Products'], allowLoading: true },
    { ...desktop, pageKey: 'products', route: '/products', state: 'empty', auth: 'guest', productsEmpty: true },
    { ...desktop, pageKey: 'products', route: '/products', state: 'error', auth: 'guest', errorOps: ['Products'] },

    { ...desktop, pageKey: 'product-detail', route: '/products/101', state: 'loading', auth: 'guest', delayOps: ['Product'], allowLoading: true },
    { ...desktop, pageKey: 'product-detail', route: '/products/101', state: 'error', auth: 'guest', errorOps: ['Product'] },
    {
      ...desktop,
      pageKey: 'product-detail',
      route: '/products/101',
      state: 'success-add-to-cart',
      auth: 'guest',
      action: async (page) => {
        await page.getByRole('button', { name: /add to cart/i }).first().click();
      },
    },

    { ...desktop, pageKey: 'cart', route: '/cart', state: 'loading', auth: 'guest', cartItems: true, delayOps: ['Cart'], allowLoading: true },
    { ...desktop, pageKey: 'cart', route: '/cart', state: 'empty', auth: 'guest' },
    { ...desktop, pageKey: 'cart', route: '/cart', state: 'error', auth: 'guest', errorOps: ['Cart'] },
    {
      ...desktop,
      pageKey: 'cart',
      route: '/cart',
      state: 'success-promo',
      auth: 'guest',
      cartItems: true,
      action: async (page) => {
        await page.getByLabel(/promo code/i).fill('SAVE10');
        await page.getByRole('button', { name: /apply/i }).click();
      },
    },

    { ...desktop, pageKey: 'checkout', route: '/checkout', state: 'loading', auth: 'customer', cartItems: true, delayOps: ['MyAddresses', 'MyCheckoutProfile'], allowLoading: true },
    { ...desktop, pageKey: 'checkout', route: '/checkout', state: 'error', auth: 'customer', cartItems: true, errorOps: ['MyAddresses'] },
    {
      ...desktop,
      pageKey: 'checkout',
      route: '/checkout',
      state: 'validation-missing-fields',
      auth: 'customer',
      cartItems: true,
      addressesEmpty: true,
    },
    {
      ...desktop,
      pageKey: 'checkout',
      route: '/checkout',
      state: 'success-confirmation',
      auth: 'customer',
      cartItems: true,
      addressesEmpty: true,
      action: async (page) => {
        await page.getByTestId('checkout-shipping-name').fill('Jordan Lee');
        await page.getByTestId('checkout-shipping-address').fill('1 Main Street');
        await page.getByTestId('checkout-shipping-city').fill('Austin');
        await page.getByTestId('checkout-shipping-region').fill('US-DEFAULT');
        await page.getByTestId('checkout-shipping-postal').fill('78701');
        await page.getByTestId('checkout-address-next').click();
        await page.getByTestId('checkout-shipping-next').click();
        await page.getByTestId('checkout-payment-cardholder').fill('Jordan Lee');
        await page.getByTestId('checkout-payment-last4').fill('4242');
        await page.getByTestId('checkout-payment-expiry').fill('12/28');
        await page.getByTestId('checkout-payment-cvc').fill('123');
        await page.getByTestId('checkout-payment-confirm').click();
        await page.waitForTimeout(1200);
      },
    },

    {
      ...desktop,
      pageKey: 'login',
      route: '/auth/login',
      state: 'validation-required',
      auth: 'guest',
      action: async (page) => {
        await page.getByRole('button', { name: /sign in/i }).click();
      },
    },
    {
      ...desktop,
      pageKey: 'login',
      route: '/auth/login',
      state: 'error-invalid-credentials',
      auth: 'guest',
      errorOps: ['Login'],
      action: async (page) => {
        await page.getByLabel(/email/i).first().fill('wrong@example.com');
        await page.getByLabel(/password/i).first().fill('wrongpass');
        await page.getByRole('button', { name: /sign in/i }).click();
      },
    },
    {
      ...desktop,
      pageKey: 'login',
      route: '/auth/login',
      state: 'success-login',
      auth: 'guest',
      action: async (page) => {
        await page.getByLabel(/email/i).first().fill('customer@soren.store');
        await page.getByLabel(/password/i).first().fill('Customer123!');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL('**/account', { timeout: 8000 });
      },
    },

    {
      ...desktop,
      pageKey: 'register',
      route: '/auth/register',
      state: 'validation-required',
      auth: 'guest',
      action: async (page) => {
        await page.getByRole('button', { name: /^register$/i }).click();
      },
    },
    {
      ...desktop,
      pageKey: 'register',
      route: '/auth/register',
      state: 'error-submit',
      auth: 'guest',
      errorOps: ['Register'],
      action: async (page) => {
        await page.getByLabel(/full name/i).fill('Test User');
        await page.getByLabel(/email/i).first().fill('test@example.com');
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /^register$/i }).click();
      },
    },
    {
      ...desktop,
      pageKey: 'register',
      route: '/auth/register',
      state: 'success-register',
      auth: 'guest',
      action: async (page) => {
        await page.getByLabel(/full name/i).fill('New Customer');
        await page.getByLabel(/email/i).first().fill('new@soren.store');
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /^register$/i }).click();
        await page.waitForURL('**/account', { timeout: 8000 });
      },
    },

    {
      ...desktop,
      pageKey: 'forgot-password',
      route: '/auth/forgot-password',
      state: 'validation-required',
      auth: 'guest',
      action: async (page) => {
        await page.getByRole('button', { name: /send reset/i }).click();
      },
    },
    {
      ...desktop,
      pageKey: 'forgot-password',
      route: '/auth/forgot-password',
      state: 'error-submit',
      auth: 'guest',
      errorOps: ['ForgotPassword'],
      action: async (page) => {
        await page.getByLabel(/email/i).first().fill('test@example.com');
        await page.getByRole('button', { name: /send reset/i }).click();
      },
    },
    {
      ...desktop,
      pageKey: 'forgot-password',
      route: '/auth/forgot-password',
      state: 'success-submit',
      auth: 'guest',
      action: async (page) => {
        await page.getByLabel(/email/i).first().fill('test@example.com');
        await page.getByRole('button', { name: /send reset/i }).click();
      },
    },

    { ...desktop, pageKey: 'account', route: '/account', state: 'loading', auth: 'customer', delayOps: ['MyOrders'], allowLoading: true },
    { ...desktop, pageKey: 'account', route: '/account', state: 'empty', auth: 'customer', orders: false, addressesEmpty: true },
    { ...desktop, pageKey: 'account', route: '/account', state: 'error', auth: 'customer', errorOps: ['MyOrders'] },
    {
      ...desktop,
      pageKey: 'account',
      route: '/account',
      state: 'success-add-address',
      auth: 'customer',
      action: async (page) => {
        await page.getByLabel(/^name$/i).first().fill('Jordan Lee');
        await page.getByLabel(/^address$/i).fill('5 Oak Street');
        await page.getByLabel(/city/i).fill('Austin');
        await page.getByLabel(/region/i).fill('US-TX');
        await page.getByLabel(/postal code/i).fill('73301');
        await page.getByRole('button', { name: /add address/i }).click();
      },
    },

    { ...desktop, pageKey: 'order-details', route: '/account/orders/900', state: 'loading', auth: 'customer', delayOps: ['OrderById'], allowLoading: true },
    { ...desktop, pageKey: 'order-details', route: '/account/orders/900', state: 'empty-not-found', auth: 'customer', orderMissing: true },
    { ...desktop, pageKey: 'order-details', route: '/account/orders/900', state: 'error', auth: 'customer', errorOps: ['OrderById'] },
    {
      ...desktop,
      pageKey: 'order-details',
      route: '/account/orders/900',
      state: 'validation-return-reason-required',
      auth: 'customer',
    },
    {
      ...desktop,
      pageKey: 'order-details',
      route: '/account/orders/900',
      state: 'success-submit-return',
      auth: 'customer',
      action: async (page) => {
        await page.locator('textarea').first().fill('Damaged item');
        await page.getByRole('button', { name: /submit request/i }).click();
      },
    },

    { ...desktop, pageKey: 'wishlist', route: '/wishlist', state: 'empty', auth: 'guest' },
    { ...desktop, pageKey: 'wishlist', route: '/wishlist', state: 'default-with-items', auth: 'guest', wishlistSeed: wishlistItems() },

    { ...desktop, pageKey: 'compare', route: '/compare', state: 'empty', auth: 'guest' },
    { ...desktop, pageKey: 'compare', route: '/compare', state: 'default-with-items', auth: 'guest', compareSeed: wishlistItems().slice(0, 2) },

    { ...desktop, pageKey: 'admin', route: '/admin', state: 'loading', auth: 'admin', delayOps: ['AdminProducts', 'AdminOrders'], allowLoading: true },
    { ...desktop, pageKey: 'admin', route: '/admin', state: 'error', auth: 'admin', errorOps: ['AdminProducts'] },
    {
      ...desktop,
      pageKey: 'admin',
      route: '/admin',
      state: 'success-create-category',
      auth: 'admin',
      action: async (page) => {
        await page.getByLabel(/category name/i).fill('Accessories');
        await page.getByRole('button', { name: /^add$/i }).first().click();
      },
    },

    { ...desktop, pageKey: 'not-found', route: '/definitely-missing', state: 'default', auth: 'guest' },
  ];
}

function flowShots() {
  const desktop = { viewport: 'desktop', locale: 'en', theme: 'light' };

  return [
    { ...desktop, pageKey: 'products', route: '/products', state: 'flow-browse-start', auth: 'guest' },
    { ...desktop, pageKey: 'product-detail', route: '/products/101', state: 'flow-product-detail', auth: 'guest' },
    {
      ...desktop,
      pageKey: 'product-detail',
      route: '/products/101',
      state: 'flow-added-to-cart',
      auth: 'guest',
      action: async (page) => {
        await page.getByRole('button', { name: /add to cart/i }).first().click();
      },
    },
    { ...desktop, pageKey: 'cart', route: '/cart', state: 'flow-cart', auth: 'guest', cartItems: true },
    { ...desktop, pageKey: 'checkout', route: '/checkout', state: 'flow-checkout', auth: 'customer', cartItems: true },
    {
      ...desktop,
      pageKey: 'checkout',
      route: '/checkout',
      state: 'flow-confirmation',
      auth: 'customer',
      cartItems: true,
      addressesEmpty: true,
      action: async (page) => {
        await page.getByTestId('checkout-shipping-name').fill('Jordan Lee');
        await page.getByTestId('checkout-shipping-address').fill('1 Main Street');
        await page.getByTestId('checkout-shipping-city').fill('Austin');
        await page.getByTestId('checkout-shipping-region').fill('US-DEFAULT');
        await page.getByTestId('checkout-shipping-postal').fill('78701');
        await page.getByTestId('checkout-address-next').click();
        await page.getByTestId('checkout-shipping-next').click();
        await page.getByTestId('checkout-payment-cardholder').fill('Jordan Lee');
        await page.getByTestId('checkout-payment-last4').fill('4242');
        await page.getByTestId('checkout-payment-expiry').fill('12/28');
        await page.getByTestId('checkout-payment-cvc').fill('123');
        await page.getByTestId('checkout-payment-confirm').click();
        await page.waitForTimeout(1200);
      },
    },

    { ...desktop, pageKey: 'login', route: '/auth/login', state: 'flow-login-start', auth: 'guest' },
    { ...desktop, pageKey: 'register', route: '/auth/register', state: 'flow-register', auth: 'guest' },
    { ...desktop, pageKey: 'account', route: '/account', state: 'flow-account', auth: 'customer' },
    { ...desktop, pageKey: 'account', route: '/account', state: 'flow-order-history', auth: 'customer' },
    { ...desktop, pageKey: 'order-details', route: '/account/orders/900', state: 'flow-order-details', auth: 'customer' },

    { ...desktop, pageKey: 'admin', route: '/admin', state: 'flow-admin-dashboard', auth: 'admin' },
    {
      ...desktop,
      pageKey: 'admin',
      route: '/admin',
      state: 'flow-admin-crud-action',
      auth: 'admin',
      action: async (page) => {
        await page.getByLabel(/brand name/i).fill('Audit Brand');
        await page.getByRole('button', { name: /^add$/i }).nth(1).click();
      },
    },
  ];
}

async function discoverRoutes(browser) {
  const context = await browser.newContext({ viewport: VIEWPORTS.desktop });
  const page = await context.newPage();
  const serverState = makeServerState({ auth: 'guest', cartItems: true });

  await page.addInitScript(() => {
    localStorage.setItem('soren_language', 'en');
    localStorage.setItem('soren_theme_mode', 'light');
    localStorage.setItem('soren_guest_session_id', 'sess_audit');
  });

  await installGraphqlMock(page, { errorOps: [], delayOps: [] }, serverState);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

  const homeLinks = await page.$$eval('a[href]', (links) => links.map((link) => link.getAttribute('href')).filter(Boolean));
  await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
  const productLinks = await page.$$eval('a[href]', (links) => links.map((link) => link.getAttribute('href')).filter(Boolean));

  const known = [...new Set([...homeLinks, ...productLinks])].filter((h) => h.startsWith('/'));

  fs.writeFileSync(ROUTES_PATH, JSON.stringify({ timestamp: nowIso(), discoveredByUi: known, discoveredByCode: PAGES.map((p) => p.route) }, null, 2));
  await context.close();
}

async function main() {
  ensureDir(SHOTS_ROOT);
  fs.writeFileSync(METADATA_PATH, '');

  const browser = await chromium.launch({ headless: true });
  const metadata = [];

  try {
    await discoverRoutes(browser);

    const allShots = [...defaultStateShots(), ...stateShots(), ...flowShots()];

    for (const shot of allShots) {
      // eslint-disable-next-line no-console
      console.log(`Capturing ${shot.pageKey} ${shot.state} [${shot.viewport}/${shot.locale}/${shot.theme}]`);
      const outPath = buildOutputPath({
        viewport: shot.viewport,
        locale: shot.locale,
        theme: shot.theme,
        pageKey: shot.pageKey,
        state: shot.state,
      });
      if (fs.existsSync(outPath)) {
        const stats = fs.statSync(outPath);
        recordMetadata(metadata, shot, outPath, stats.mtime.toISOString());
        continue;
      }
      await captureShot(browser, shot, metadata);
    }
  } finally {
    await browser.close();
  }

  const lines = metadata.map((entry) => JSON.stringify(entry)).join('\n');
  fs.writeFileSync(METADATA_PATH, `${lines}\n`);

  // eslint-disable-next-line no-console
  console.log(`Wrote ${metadata.length} screenshots metadata entries to ${METADATA_PATH}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
