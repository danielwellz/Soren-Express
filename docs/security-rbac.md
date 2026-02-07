# Security RBAC Matrix

## Roles
- `ADMIN`: full catalog, pricing/rules, inventory, user, and order management.
- `CUSTOMER`: storefront, cart, checkout, profile, and own orders only.

## GraphQL access matrix
| Area | Operation | CUSTOMER | ADMIN |
|---|---|---:|---:|
| Catalog | `products`, `productBySlug`, `categories`, `brands` | Yes | Yes |
| Cart | `cart`, `addToCart`, `updateCartItem`, `removeCartItem` | Yes | Yes |
| Checkout | `createOrder`, `createPaymentIntent`, `confirmPayment` | Yes (authenticated) | Yes |
| Orders | `myOrders`, `myOrderById`, `orderStatusTimeline` | Yes (own only) | Yes |
| Admin Catalog | `adminCreate/Update/DeleteCategory` | No | Yes |
| Admin Catalog | `adminCreate/Update/DeleteBrand` | No | Yes |
| Admin Products | `adminCreate/Update/DeleteProduct`, `adminCreateVariant` | No | Yes |
| Admin Inventory | `adminUpdateInventory` | No | Yes |
| Admin Pricing | `adminCreate/Update/DeleteCoupon`, `adminUpsertTaxRule`, `adminUpsertShippingRule` | No | Yes |
| Admin Users | `adminUpdateUserRole`, `adminUpdateUserStatus`, `adminDeleteUser` | No | Yes |
| Admin Orders | `adminUpdateOrderStatus` | No | Yes |

## Enforcement notes
- `AdminResolver` is class-guarded with `GqlAuthGuard` + `RolesGuard` and `@Roles(UserRole.ADMIN)`.
- Customer order access checks ownership in service layer (`order.user.id === currentUser.id`).
- All admin mutations create `admin_audit_log` records with actor id, action, entity, and sanitized before/after snapshots.

## Audit fields
- `actorUserId`
- `action`
- `entityType`
- `entityId`
- `beforeState` / `afterState` (sensitive keys redacted)
- `correlationId`
- `createdAt`
