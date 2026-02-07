import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITIES } from './entities';
import { AnalyticsService } from './analytics/analytics.service';
import { AuthResolver } from './auth/auth.resolver';
import { AuthService } from './auth/auth.service';
import { GqlAuthGuard } from './auth/gql-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { CartResolver } from './cart/cart.resolver';
import { CartService } from './cart/cart.service';
import { CatalogResolver } from './catalog/catalog.resolver';
import { CatalogService } from './catalog/catalog.service';
import { CheckoutResolver } from './checkout/checkout.resolver';
import { CheckoutService } from './checkout/checkout.service';
import { PricingService } from './checkout/pricing.service';
import { NotificationService } from './notifications/notification.service';
import { OrdersResolver } from './orders/orders.resolver';
import { OrdersService } from './orders/orders.service';
import { ReviewsResolver } from './reviews/reviews.resolver';
import { ReviewsService } from './reviews/reviews.service';
import { AdminService } from './admin/admin.service';
import { AdminResolver } from './admin/admin.resolver';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([...ENTITIES]),
  ],
  providers: [
    AnalyticsService,
    AuthResolver,
    AuthService,
    GqlAuthGuard,
    RolesGuard,
    CartResolver,
    CartService,
    CatalogResolver,
    CatalogService,
    CheckoutResolver,
    CheckoutService,
    PricingService,
    NotificationService,
    OrdersResolver,
    OrdersService,
    ReviewsResolver,
    ReviewsService,
    AdminService,
    AdminResolver,
  ],
  exports: [
    AuthService,
    CartService,
    CatalogService,
    CheckoutService,
    OrdersService,
    ReviewsService,
    AdminService,
    AnalyticsService,
  ],
})
export class StoreModule {}
