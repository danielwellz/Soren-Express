import { expect, Page, test } from '@playwright/test';
import { setupGraphqlMocks } from './utils/mockGraphql';

const testToken = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjQxMDI0NDQ4MDB9.signature';

async function ensureAuthTokens(page: Page) {
  await page.evaluate((token) => {
    localStorage.setItem('soren_access_token', token);
    localStorage.setItem('soren_refresh_token', token);
  }, testToken);
}

test.describe('Critical storefront flows', () => {
  test('guest browsing to checkout enforces payment step validation', async ({ page }) => {
    const state = await setupGraphqlMocks(page);

    await page.goto('/products');
    await page.getByRole('button', { name: /add jbl flip 6 to cart/i }).click();

    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: /^jbl flip 6$/i })).toBeVisible();

    await page.getByRole('link', { name: /^checkout$/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.getByLabel('Email').fill('shopper@soren.store');
    await page.getByLabel('Password').fill('Password123!');
    await expect(page.getByLabel('Email')).toHaveValue('shopper@soren.store');
    await expect(page.getByLabel('Password')).toHaveValue('Password123!');
    await page.getByLabel('Password').press('Enter');
    await expect.poll(() => state.user?.email || '').toBe('shopper@soren.store');
    await ensureAuthTokens(page);

    if (!/\/checkout$/.test(new URL(page.url()).pathname)) {
      await page.goto('/checkout');
    }

    await expect(page).toHaveURL(/\/checkout/);

    await page.locator('[data-testid="checkout-shipping-name"]:visible').fill('Jordan Lee');
    await page.locator('[data-testid="checkout-shipping-address"]:visible').fill('1 Main Street');
    await page.locator('[data-testid="checkout-shipping-city"]:visible').fill('Austin');
    await page.locator('[data-testid="checkout-shipping-postal"]:visible').fill('78701');
    await page.locator('[data-testid="checkout-coupon"]:visible').fill('SAVE10');
    const continueFromAddress = page.locator('[data-testid="checkout-address-next"]:visible');
    await expect(continueFromAddress).toBeEnabled();
    await continueFromAddress.click({ force: true });
    await expect.poll(() => state.operations.includes('CheckoutPreview')).toBeTruthy();

    await expect(page.getByText(/shipping and tax preview/i)).toBeVisible();
    await page.locator('[data-testid="checkout-shipping-next"]:visible').click();

    await expect(page.getByText(/payment details/i)).toBeVisible();
    await expect(page.getByText(/order confirmed/i)).toHaveCount(0);

    const confirmButton = page.locator('[data-testid="checkout-payment-confirm"]:visible');
    await expect(confirmButton).toBeDisabled();

    await page.locator('[data-testid="checkout-payment-cardholder"]:visible').fill('Jordan Lee');
    await page.locator('[data-testid="checkout-payment-last4"]:visible').fill('4242');
    await page.locator('[data-testid="checkout-payment-expiry"]:visible').fill('12/28');
    await page.locator('[data-testid="checkout-payment-cvc"]:visible').fill('123');

    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    await expect(page.getByText(/order confirmed/i)).toBeVisible();
  });

  test('guest cart merges after registration', async ({ page }) => {
    const state = await setupGraphqlMocks(page);

    await page.goto('/products');
    await page.getByRole('button', { name: /add jbl flip 6 to cart/i }).click();

    await page.goto('/auth/register');
    await page.getByLabel(/full name/i).fill('New Customer');
    await page.getByLabel('Email').fill('new@soren.store');
    await page.getByLabel(/phone/i).fill('555-1000');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: /register/i }).click();

    await expect(page).toHaveURL(/\/account/);
    await expect.poll(() => state.mergeCalls).toBe(1);

    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: /^jbl flip 6$/i })).toBeVisible();
  });

  test('login keeps cart continuity and SPA navigation remains consistent', async ({ page }) => {
    await setupGraphqlMocks(page);

    await page.goto('/products');
    await page.getByRole('button', { name: /add jbl flip 6 to cart/i }).click();

    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('shopper@soren.store');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/account/);
    await ensureAuthTokens(page);

    await page.getByRole('button', { name: /open cart preview/i }).click();
    await expect(page.getByText(/cart preview/i)).toBeVisible();
    await expect(page.getByText('JBL Flip 6').first()).toBeVisible();
    await page.getByRole('button', { name: /go to cart/i }).click();

    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByRole('heading', { name: /^jbl flip 6$/i })).toBeVisible();

    await page.getByRole('link', { name: /^checkout$/i }).click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('[data-testid="checkout-address-next"]:visible')).toBeDisabled();
  });

  test('unknown routes render the 404 page', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/definitely-missing');
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});
