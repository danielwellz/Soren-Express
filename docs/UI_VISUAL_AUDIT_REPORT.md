# UI Visual Audit Report

## Audit metadata
- Date: 2026-02-07
- App: Soren Express frontend (`http://127.0.0.1:3002`)
- Method: Playwright full-page screenshot automation with deterministic GraphQL mocks (for reliable loading/empty/error/success capture)
- Screenshot root: `docs/screenshots/`
- Screenshot metadata log: `docs/screenshots/metadata.jsonl` (126 captures)
- Route discovery evidence: `docs/screenshots/discovered-routes.json`
- Auth identities used in flows:
  - Customer (simulated): `customer@soren.store` / `Customer123!`
  - Admin (simulated): `admin@soren.store` / `Admin123!`

## Route discovery
- From code/router: `/`, `/products`, `/products/:id`, `/cart`, `/checkout`, `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/account`, `/account/orders/:id`, `/wishlist`, `/compare`, `/admin`, `*`
- From UI crawl: `/`, `/products`, `/products/101`, `/products/102`, `/wishlist`, `/compare`, `/account`, `/admin`, `/cart`, `/auth/login`, `/auth/register`

## Coverage checklist
- [x] Every required page captured at mobile `390x844`, tablet `768x1024`, desktop `1440x900` (default state)
- [x] EN + FA captured (desktop default for each page)
- [x] Light + Dark captured (desktop default for each page)
- [x] Default + loading + empty + error captured where state exists in UI logic
- [x] Validation/success captured for form pages and critical actions
- [x] Critical flows captured step-by-step

## Index (page -> screenshot folders)
- Mobile default set: `docs/screenshots/mobile/en/light/`
- Tablet default set: `docs/screenshots/tablet/en/light/`
- Desktop EN Light set: `docs/screenshots/desktop/en/light/`
- Desktop EN Dark set: `docs/screenshots/desktop/en/dark/`
- Desktop FA Light (RTL) set: `docs/screenshots/desktop/fa/light/`

---

## Home (`/`)
- Purpose: Landing + hero + category chips + featured products.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/home__default.png`
  - `docs/screenshots/mobile/en/light/home__default.png`
  - `docs/screenshots/desktop/fa/light/home__default.png`
  - `docs/screenshots/desktop/en/dark/home__default.png`
  - `docs/screenshots/desktop/en/light/home__loading.png`
  - `docs/screenshots/desktop/en/light/home__empty.png`
  - `docs/screenshots/desktop/en/light/home__error.png`
- Visual description: Gradient hero dominates first viewport; compact sticky header; strong navy/teal brand palette; large white content area below when product count is low.
- Component review: Header, hero card, fact chips, product cards, floating help widget, footer all render consistently across viewports.

## Products (`/products`)
- Purpose: Catalog browse with filters/sort/pagination.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/products__default.png`
  - `docs/screenshots/mobile/en/light/products__default.png`
  - `docs/screenshots/desktop/fa/light/products__default.png`
  - `docs/screenshots/desktop/en/light/products__loading.png`
  - `docs/screenshots/desktop/en/light/products__empty.png`
  - `docs/screenshots/desktop/en/light/products__error.png`
  - `docs/screenshots/desktop/en/light/products__flow-browse-start.png`
- Visual description: Filter tray is clean and readable on desktop; mobile stacks controls into a long, functional but dense form.
- Component review: Search, category/brand selects, sort controls, slider, card grid, pagination, error/empty containers all visible and functional.

## Product Detail (`/products/:id`)
- Purpose: Product media, variant selection, add-to-cart, reviews.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/product-detail__default.png`
  - `docs/screenshots/desktop/en/light/product-detail__loading.png`
  - `docs/screenshots/desktop/en/light/product-detail__error.png`
  - `docs/screenshots/desktop/en/light/product-detail__success-add-to-cart.png`
  - `docs/screenshots/desktop/en/light/product-detail__flow-product-detail.png`
  - `docs/screenshots/desktop/en/light/product-detail__flow-added-to-cart.png`
- Visual description: Two-column desktop layout with large media area and strong right-side action panel; review and related sections below.
- Component review: Gallery, variant chips, stock/status tags, add-to-cart button, related products, and review block render correctly.

## Cart (`/cart`)
- Purpose: Cart item management, promo code, totals, recommendations.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/cart__default.png`
  - `docs/screenshots/desktop/en/light/cart__loading.png`
  - `docs/screenshots/desktop/en/light/cart__empty.png`
  - `docs/screenshots/desktop/en/light/cart__error.png`
  - `docs/screenshots/desktop/en/light/cart__success-promo.png`
  - `docs/screenshots/desktop/en/light/cart__flow-cart.png`
- Visual description: Left content / right sticky order summary layout is clear on desktop; recommendation card occupies large vertical space with small catalogs.
- Component review: Quantity input, remove icon, promo controls, totals block, checkout CTA all work.

## Checkout (`/checkout`)
- Purpose: Multi-step checkout (address -> preview -> payment -> confirmation).
- Key screenshots:
  - `docs/screenshots/desktop/en/light/checkout__default.png`
  - `docs/screenshots/desktop/en/light/checkout__loading.png`
  - `docs/screenshots/desktop/en/light/checkout__error.png`
  - `docs/screenshots/desktop/en/light/checkout__validation-missing-fields.png`
  - `docs/screenshots/desktop/en/light/checkout__success-confirmation.png`
  - `docs/screenshots/desktop/en/light/checkout__flow-checkout.png`
  - `docs/screenshots/desktop/en/light/checkout__flow-confirmation.png`
- Visual description: Stepper and form hierarchy are clear; confirmation state is concise.
- Component review: Address fields, preview summary, payment form validation gating, confirmation CTA render and transition correctly.

## Login (`/auth/login`)
- Purpose: User sign-in.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/login__default.png`
  - `docs/screenshots/desktop/en/light/login__validation-required.png`
  - `docs/screenshots/desktop/en/light/login__error-invalid-credentials.png`
  - `docs/screenshots/desktop/en/light/login__success-login.png`
  - `docs/screenshots/desktop/en/light/login__flow-login-start.png`
- Visual description: Compact card centered with clear title/field ordering.
- Component review: Email/password, CTA, links to register/forgot, error alert, required validation all visible.

## Register (`/auth/register`)
- Purpose: Account creation.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/register__default.png`
  - `docs/screenshots/desktop/en/light/register__validation-required.png`
  - `docs/screenshots/desktop/en/light/register__error-submit.png`
  - `docs/screenshots/desktop/en/light/register__success-register.png`
  - `docs/screenshots/desktop/en/light/register__flow-register.png`
- Visual description: Similar visual system to login with additional fields and password hint.
- Component review: Form and error/success transitions are coherent.

## Forgot Password (`/auth/forgot-password`)
- Purpose: Password reset request.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/forgot-password__default.png`
  - `docs/screenshots/desktop/en/light/forgot-password__validation-required.png`
  - `docs/screenshots/desktop/en/light/forgot-password__error-submit.png`
  - `docs/screenshots/desktop/en/light/forgot-password__success-submit.png`
- Visual description: Minimal card flow with one input and one action.
- Component review: Required validation, error alert, success alert all display correctly.

## Account (`/account`)
- Purpose: Profile, saved addresses, order history.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/account__default.png`
  - `docs/screenshots/desktop/en/light/account__loading.png`
  - `docs/screenshots/desktop/en/light/account__empty.png`
  - `docs/screenshots/desktop/en/light/account__error.png`
  - `docs/screenshots/desktop/en/light/account__success-add-address.png`
  - `docs/screenshots/desktop/en/light/account__flow-account.png`
  - `docs/screenshots/desktop/en/light/account__flow-order-history.png`
- Visual description: Two-column desktop layout; left profile card dense, right order panel sparse when only one order.
- Component review: Saved address list + form + order list rows and status chips render and function.

## Order Details (`/account/orders/:id`)
- Purpose: Order line items, timeline, summary, return request.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/order-details__default.png`
  - `docs/screenshots/desktop/en/light/order-details__loading.png`
  - `docs/screenshots/desktop/en/light/order-details__empty-not-found.png`
  - `docs/screenshots/desktop/en/light/order-details__error.png`
  - `docs/screenshots/desktop/en/light/order-details__validation-return-reason-required.png`
  - `docs/screenshots/desktop/en/light/order-details__success-submit-return.png`
  - `docs/screenshots/desktop/en/light/order-details__flow-order-details.png`
- Visual description: Information architecture is strong in default state (left details, right summary).
- Component review: Timeline cards, summary metrics, return form behavior are visible; not-found/error fallback is minimal text only.

## Wishlist (`/wishlist`)
- Purpose: Saved items.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/wishlist__default.png`
  - `docs/screenshots/desktop/en/light/wishlist__empty.png`
  - `docs/screenshots/desktop/en/light/wishlist__default-with-items.png`
- Visual description: Empty state is clear; filled state reuses product card design consistently.
- Component review: Header + empty panel + card grid are stable.

## Compare (`/compare`)
- Purpose: Side-by-side product attribute comparison.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/compare__default.png`
  - `docs/screenshots/desktop/en/light/compare__empty.png`
  - `docs/screenshots/desktop/en/light/compare__default-with-items.png`
- Visual description: Horizontal attribute matrix is readable but visually flat (few separators).
- Component review: Clear-compare action and empty state present.

## Admin (`/admin`)
- Purpose: Dashboard + CRUD-like admin operations.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/admin__default.png`
  - `docs/screenshots/desktop/en/light/admin__loading.png`
  - `docs/screenshots/desktop/en/light/admin__error.png`
  - `docs/screenshots/desktop/en/light/admin__success-create-category.png`
  - `docs/screenshots/desktop/en/light/admin__flow-admin-dashboard.png`
  - `docs/screenshots/desktop/en/light/admin__flow-admin-crud-action.png`
- Visual description: Dense dashboard with multiple cards/tables; consistent card style but high information density.
- Component review: KPI cards, create forms, analytics feed, orders/users tables all render and interactive actions show toasts.

## Not Found (`*`)
- Purpose: Unknown route fallback.
- Key screenshots:
  - `docs/screenshots/desktop/en/light/not-found__default.png`
- Visual description: Clean 404 card with two recovery CTAs; strong clarity.
- Component review: Badge/title/body/actions visually coherent and accessible.

---

## Issues by severity

### P0 Broken
- None observed in captured UI states.

### P1 Serious
1. **Order details error/not-found fallback is too weak and blocks recovery flow quality**
- Observed: page can render only plain text (“Order not found”) with no contextual recovery action in `docs/screenshots/desktop/en/light/order-details__error.png`.
- Why it matters: dead-end state in a post-purchase flow increases support tickets and user drop-off.
- Fix: replace plain text fallback with full `EmptyState` including “Back to account” and “Go to orders” CTAs + support link.
- Screenshots: `docs/screenshots/desktop/en/light/order-details__error.png`, `docs/screenshots/desktop/en/light/order-details__empty-not-found.png`.

2. **Admin page has no explicit global error treatment**
- Observed: forced admin data failure still renders dashboard shell with partial/zero metrics and no visible error banner in `docs/screenshots/desktop/en/light/admin__error.png`.
- Why it matters: admins can take actions on stale/partial data without understanding data load failure.
- Fix: add top-level error alert and disable mutation actions until critical queries resolve.
- Screenshots: `docs/screenshots/desktop/en/light/admin__error.png`, `docs/screenshots/desktop/en/light/admin__default.png`.

3. **Global floating help widget overlaps content and toasts**
- Observed: help button sits over content edges and conflicts with toast location in success states.
- Why it matters: overlaps can hide action feedback or clickable controls.
- Fix: reserve safe-area spacing, auto-hide/move widget while snackbar/toast is open, and disable on narrow content regions.
- Screenshots: `docs/screenshots/desktop/en/light/product-detail__default.png`, `docs/screenshots/desktop/en/light/account__success-add-address.png`, `docs/screenshots/desktop/en/light/cart__success-promo.png`.

### P2 Minor
1. **Image placeholders dominate primary merchandising cards**
- Observed: many cards show “No Image” blocks in home/products/detail/wishlist.
- Why it matters: weak perceived quality and reduced conversion confidence.
- Fix: enforce fallback product imagery pipeline and aspect-ratio-safe thumbnails.
- Screenshots: `docs/screenshots/desktop/en/light/home__default.png`, `docs/screenshots/desktop/en/light/products__default.png`, `docs/screenshots/desktop/en/light/wishlist__default-with-items.png`.

2. **Inconsistent loading treatment across pages**
- Observed: some pages use skeleton-like loaders, others plain text or spinner, others near-static UI.
- Why it matters: inconsistent motion/feedback increases perceived latency.
- Fix: standardize on page-level skeleton templates per layout type.
- Screenshots: `docs/screenshots/desktop/en/light/home__loading.png`, `docs/screenshots/desktop/en/light/account__loading.png`, `docs/screenshots/desktop/en/light/admin__loading.png`.

3. **Native browser validation tooltips create inconsistent UX and localization gaps**
- Observed: required validation bubbles are browser-native English messages on auth forms.
- Why it matters: inconsistent styling and non-localized validation in FA/RTL journeys.
- Fix: implement controlled validation messages using MUI helper/error text and localized strings.
- Screenshots: `docs/screenshots/desktop/en/light/login__validation-required.png`, `docs/screenshots/desktop/en/light/register__validation-required.png`, `docs/screenshots/desktop/en/light/forgot-password__validation-required.png`.

4. **Auth pages share full global footer/newsletter and utility controls**
- Observed: login/register/forgot include full commerce footer + newsletter and all utility icons.
- Why it matters: increased cognitive load on critical auth conversion screens.
- Fix: provide a simplified auth layout variant (minimal header/footer).
- Screenshots: `docs/screenshots/desktop/en/light/login__default.png`, `docs/screenshots/desktop/en/light/register__default.png`.

5. **Large unused whitespace in sparse-data states**
- Observed: account/order/admin/compare pages leave large blank zones with low content density.
- Why it matters: makes pages feel incomplete and lowers confidence.
- Fix: add secondary modules (tips/recent activity/recommendations) or tighten container max width and spacing.
- Screenshots: `docs/screenshots/desktop/en/light/account__default.png`, `docs/screenshots/desktop/en/light/compare__default-with-items.png`.

6. **Mobile header utility icons are visually dense**
- Observed: mobile top bar packs many icon actions into limited width.
- Why it matters: tap target crowding and reduced scannability.
- Fix: collapse low-priority actions into overflow/menu on mobile.
- Screenshots: `docs/screenshots/mobile/en/light/products__default.png`.

7. **Compare matrix readability can be improved**
- Observed: row/column separation is subtle in filled comparison state.
- Why it matters: users must parse attributes manually with weak visual rails.
- Fix: add alternating row backgrounds/dividers and stronger column headers.
- Screenshots: `docs/screenshots/desktop/en/light/compare__default-with-items.png`.

---

## Consistency checks
- Spacing consistency: generally consistent 8/16/24 rhythm; sparse-data pages show oversized empty regions.
- Buttons and cards: style language is mostly consistent across store, auth, account, and admin.
- Typography scale: headings are coherent; some dense admin table/body text could use stronger hierarchy.
- Alignment/overflow/truncation: no severe overflow found; mobile dense header is the primary edge case.
- Z-index/layering: sticky header, help widget, and snackbars can visually compete.
- RTL correctness: FA screenshots show proper text direction and mirrored alignment (`docs/screenshots/desktop/fa/light/home__default.png`, `docs/screenshots/desktop/fa/light/products__default.png`).
- Accessibility visual checks:
  - Focus indicators visible on form fields/buttons.
  - Error alerts visible where implemented.
  - Native validation tooltip style is inconsistent and not localized.
  - Dark mode contrast appears acceptable in sampled screens (`docs/screenshots/desktop/en/dark/home__default.png`).

## Critical flow evidence
- Browse -> Detail -> Add -> Cart -> Checkout -> Confirmation:
  - `docs/screenshots/desktop/en/light/products__flow-browse-start.png`
  - `docs/screenshots/desktop/en/light/product-detail__flow-product-detail.png`
  - `docs/screenshots/desktop/en/light/product-detail__flow-added-to-cart.png`
  - `docs/screenshots/desktop/en/light/cart__flow-cart.png`
  - `docs/screenshots/desktop/en/light/checkout__flow-checkout.png`
  - `docs/screenshots/desktop/en/light/checkout__flow-confirmation.png`
- Login/Register -> Account -> Order History -> Order Details:
  - `docs/screenshots/desktop/en/light/login__flow-login-start.png`
  - `docs/screenshots/desktop/en/light/register__flow-register.png`
  - `docs/screenshots/desktop/en/light/account__flow-account.png`
  - `docs/screenshots/desktop/en/light/account__flow-order-history.png`
  - `docs/screenshots/desktop/en/light/order-details__flow-order-details.png`
- Admin dashboard + CRUD action:
  - `docs/screenshots/desktop/en/light/admin__flow-admin-dashboard.png`
  - `docs/screenshots/desktop/en/light/admin__flow-admin-crud-action.png`

## Top 10 ROI improvements (before -> after)
1. Order-details plain-text error -> structured empty/error screen with clear CTAs.
2. Silent/implicit admin partial failure -> explicit global admin error banner + action lock.
3. Floating help overlapping feedback -> dynamic safe-positioning relative to snackbars.
4. “No Image” placeholders -> guaranteed fallback product imagery and image QA gate.
5. Mixed loading patterns -> unified skeleton system by page template.
6. Native browser validation prompts -> localized inline validation components.
7. Full-commerce chrome on auth screens -> minimal auth shell for focus and conversion.
8. Mobile utility icon crowding -> overflow menu pattern with prioritized actions.
9. Compare table low separation -> stronger visual grid/dividers and sticky row labels.
10. Sparse blank zones -> contextual secondary content modules or tighter max-width behavior.

## Notes on non-triggerable/limited states
- Some pages do not implement dedicated error/loading UI (for example compare/wishlist are mostly local-state driven); nearest available state was captured and documented.
- Backend was not required for deterministic coverage; GraphQL responses were mocked to force each UI state reliably.
