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
    await expect(page.getByText('JBL Flip 6').first()).toBeVisible();

    await page.getByRole('link', { name: /^checkout$/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);

    const loginEmail = page.getByLabel(/email/i).first();
    const loginPassword = page.getByLabel(/password/i).first();
    await loginEmail.fill('shopper@soren.store');
    await loginPassword.fill('Password123!');
    await expect(loginEmail).toHaveValue('shopper@soren.store');
    await expect(loginPassword).toHaveValue('Password123!');
    await loginPassword.press('Enter');
    await expect.poll(() => state.user?.email || '').toBe('shopper@soren.store');
    await ensureAuthTokens(page);

    if (!/\/checkout$/.test(new URL(page.url()).pathname)) {
      await page.goto('/checkout');
    }

    await expect(page).toHaveURL(/\/checkout/);

    const continueFromAddress = page.locator('[data-testid="checkout-address-next"]:visible');
    const continueToPayment = page.locator('[data-testid="checkout-shipping-next"]:visible');
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.getByLabel(/full name/i).first().fill('Jordan Lee');
      await page.getByLabel(/^address$/i).first().fill('1 Main Street');
      await page.getByLabel(/city/i).first().fill('Austin');
      await page.getByLabel(/region/i).first().fill('US-DEFAULT');
      await page.getByLabel(/postal code/i).first().fill('78701');
      await page.getByLabel(/coupon code/i).first().fill('SAVE10');
      await expect(continueFromAddress).toBeEnabled();
      await continueFromAddress.click({ force: true });
      if (await continueToPayment.isVisible({ timeout: 2500 }).catch(() => false)) {
        break;
      }
    }

    await expect.poll(() => state.operations.includes('CheckoutPreview')).toBeTruthy();
    await expect(continueToPayment).toBeEnabled();
    await continueToPayment.click();

    await expect(page.getByRole('heading', { name: /payment details/i })).toBeVisible();
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
    await page.getByLabel(/email/i).first().fill('new@soren.store');
    await page.getByLabel(/phone/i).fill('555-1000');
    await page.getByLabel(/password/i).first().fill('Password123!');
    await page.getByRole('button', { name: /register/i }).click();

    await expect(page).toHaveURL(/\/account/);
    await expect.poll(() => state.mergeCalls).toBe(1);

    await page.goto('/cart');
    await expect(page.getByText('JBL Flip 6').first()).toBeVisible();
  });

  test('login keeps cart continuity and SPA navigation remains consistent', async ({ page }) => {
    await setupGraphqlMocks(page);

    await page.goto('/products');
    await page.getByRole('button', { name: /add jbl flip 6 to cart/i }).click();

    await page.goto('/auth/login');
    await page.getByLabel(/email/i).first().fill('shopper@soren.store');
    await page.getByLabel(/password/i).first().fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/account/);
    await ensureAuthTokens(page);

    await page.getByRole('button', { name: /open cart preview/i }).click();
    await expect(page.getByText(/cart preview/i)).toBeVisible();
    await expect(page.getByText('JBL Flip 6').first()).toBeVisible();
    await page.getByRole('button', { name: /go to cart/i }).click();

    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText('JBL Flip 6').first()).toBeVisible();

    await page.getByRole('link', { name: /^checkout$/i }).click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('[data-testid="checkout-address-next"]:visible')).toBeDisabled();
  });

  test('unknown routes render the 404 page', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/definitely-missing');
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
  });

  test('language switch toggles RTL layout direction', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await page.getByRole('button', { name: /switch language/i }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('mini cart supports escape close interaction', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/products');
    await page.getByRole('button', { name: /add jbl flip 6 to cart/i }).click();
    await expect(page.getByTestId('mini-cart-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('mini-cart-drawer')).toBeHidden();
  });
});
