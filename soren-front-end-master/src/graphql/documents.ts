import { gql } from '@apollo/client';

export const PRODUCTS_QUERY = gql`
  query Products($filter: ProductFilterInput, $pagination: PaginationInput, $sort: SortInput) {
    products(filter: $filter, pagination: $pagination, sort: $sort) {
      total
      page
      pageSize
      items {
        id
        name
        slug
        description
        basePrice
        thumbnail
        galleryUrls
        averageRating
        brand {
          id
          name
        }
        category {
          id
          name
        }
        variants {
          id
          sku
          color
          size
          priceAdjustment
          inventory {
            quantity
            reserved
          }
        }
      }
    }
  }
`;

export const PRODUCT_QUERY = gql`
  query Product($id: Int!, $sessionId: String) {
    product(id: $id, sessionId: $sessionId) {
      id
      name
      slug
      description
      basePrice
      thumbnail
      galleryUrls
      averageRating
      brand {
        id
        name
      }
      category {
        id
        name
      }
      variants {
        id
        sku
        color
        size
        priceAdjustment
        inventory {
          quantity
          reserved
        }
      }
      relatedProducts {
        id
        name
        basePrice
        thumbnail
        brand {
          name
        }
      }
    }
  }
`;

export const FEATURED_PRODUCTS_QUERY = gql`
  query FeaturedProducts {
    featuredProducts {
      id
      name
      basePrice
      thumbnail
      brand {
        name
      }
      category {
        name
      }
      variants {
        id
        inventory {
          quantity
          reserved
        }
      }
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      description
    }
  }
`;

export const BRANDS_QUERY = gql`
  query Brands {
    brands {
      id
      name
      description
    }
  }
`;

export const CART_QUERY = gql`
  query Cart($context: CartContextInput) {
    cart(context: $context) {
      id
      sessionId
      active
      promoCode
      giftCardCode
      items {
        id
        quantity
        unitPrice
        variant {
          id
          sku
          color
          size
          product {
            id
            name
            thumbnail
            basePrice
          }
          inventory {
            quantity
            reserved
          }
        }
      }
    }
  }
`;

export const REVIEWS_QUERY = gql`
  query Reviews($filter: ReviewFilterInput!) {
    reviews(filter: $filter) {
      id
      rating
      comment
      createdAt
      status
      user {
        id
        fullName
      }
    }
  }
`;

export const CHECKOUT_PREVIEW_QUERY = gql`
  query CheckoutPreview($input: CheckoutTotalsInput!) {
    checkoutPreview(input: $input) {
      totals {
        subtotal
        discount
        shipping
        tax
        total
      }
      cart {
        id
        items {
          id
          quantity
          unitPrice
          variant {
            id
            sku
            product {
              name
            }
          }
        }
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      fullName
      phone
      role
      address
    }
  }
`;

export const MY_ORDERS_QUERY = gql`
  query MyOrders {
    myOrders {
      id
      status
      total
      subtotal
      discount
      shipping
      tax
      createdAt
      shippingName
      shippingAddress
      shippingCity
      shippingRegion
      shippingPostalCode
      items {
        id
        productName
        variantLabel
        sku
        quantity
        unitPrice
        lineTotal
      }
      payment {
        id
        status
        provider
        last4
      }
      shipment {
        id
        status
        trackingNumber
      }
      coupon {
        code
      }
      statusHistory {
        id
        status
        note
        createdAt
      }
      returnRequests {
        id
        reason
        exchangePreferred
        status
        createdAt
      }
    }
  }
`;

export const ORDER_BY_ID_QUERY = gql`
  query OrderById($id: Int!) {
    orderById(id: $id) {
      id
      status
      total
      subtotal
      discount
      shipping
      tax
      createdAt
      shippingName
      shippingAddress
      shippingCity
      shippingRegion
      shippingPostalCode
      items {
        id
        productName
        variantLabel
        sku
        quantity
        unitPrice
        lineTotal
      }
      payment {
        id
        status
        provider
        last4
      }
      shipment {
        id
        status
        carrier
        trackingNumber
      }
      coupon {
        code
      }
      statusHistory {
        id
        status
        note
        createdAt
      }
      returnRequests {
        id
        reason
        exchangePreferred
        status
        createdAt
      }
    }
  }
`;

export const ORDER_STATUS_TIMELINE_QUERY = gql`
  query OrderStatusTimeline($orderId: Int!) {
    orderStatusTimeline(orderId: $orderId) {
      id
      status
      note
      createdAt
    }
  }
`;

export const MY_WISHLIST_QUERY = gql`
  query MyWishlist {
    myWishlist {
      id
      name
      slug
      description
      basePrice
      thumbnail
      averageRating
      brand {
        id
        name
      }
      category {
        id
        name
      }
      variants {
        id
        sku
        color
        size
        inventory {
          quantity
          reserved
        }
      }
    }
  }
`;

export const MY_ADDRESSES_QUERY = gql`
  query MyAddresses {
    myAddresses {
      id
      label
      fullName
      line1
      city
      region
      postalCode
      isDefault
    }
  }
`;

export const MY_CHECKOUT_PROFILE_QUERY = gql`
  query MyCheckoutProfile {
    myCheckoutProfile {
      id
      shippingName
      shippingLine1
      shippingCity
      shippingRegion
      shippingPostalCode
      cardholderName
      cardLast4
      cardExpiry
    }
  }
`;

export const SHIPPING_ESTIMATE_QUERY = gql`
  query ShippingEstimate($input: ShippingEstimateInput!) {
    shippingEstimate(input: $input) {
      region
      flatRate
      freeShippingOver
      remainingForFreeShipping
      eligibleForFreeShipping
      estimatedMinDays
      estimatedMaxDays
    }
  }
`;

export const ADMIN_PRODUCTS_QUERY = gql`
  query AdminProducts {
    adminProducts {
      id
      name
      slug
      basePrice
      published
      isFeatured
      category {
        id
        name
      }
      brand {
        id
        name
      }
      variants {
        id
        sku
        color
        size
        inventory {
          quantity
          lowStockThreshold
        }
      }
    }
  }
`;

export const ADMIN_ORDERS_QUERY = gql`
  query AdminOrders {
    adminOrders {
      id
      status
      total
      createdAt
      user {
        id
        fullName
        email
      }
      items {
        id
        productName
        quantity
      }
    }
  }
`;

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers {
    adminUsers {
      id
      fullName
      email
      role
      active
      createdAt
    }
  }
`;

export const ADMIN_COUPONS_QUERY = gql`
  query AdminCoupons {
    adminCoupons {
      id
      code
      type
      amount
      minOrderAmount
      active
      expiresAt
    }
  }
`;

export const ADMIN_ANALYTICS_QUERY = gql`
  query AdminAnalyticsEvents($limit: Int) {
    adminAnalyticsEvents(limit: $limit) {
      id
      eventType
      sessionId
      createdAt
      metadata
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        fullName
        role
      }
      tokens {
        accessToken
        refreshToken
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
        fullName
        role
      }
      tokens {
        accessToken
        refreshToken
      }
    }
  }
`;

export const REFRESH_MUTATION = gql`
  mutation Refresh($input: RefreshInput!) {
    refresh(input: $input) {
      user {
        id
      }
      tokens {
        accessToken
        refreshToken
      }
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($input: AddCartItemInput!) {
    addToCart(input: $input) {
      id
      items {
        id
      }
    }
  }
`;

export const UPDATE_CART_ITEM_MUTATION = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      id
      items {
        id
      }
    }
  }
`;

export const REMOVE_CART_ITEM_MUTATION = gql`
  mutation RemoveCartItem($input: RemoveCartItemInput!) {
    removeCartItem(input: $input) {
      id
      items {
        id
      }
    }
  }
`;

export const APPLY_CART_PROMO_MUTATION = gql`
  mutation ApplyCartPromo($input: ApplyCartPromoInput!) {
    applyCartPromo(input: $input) {
      id
      promoCode
      items {
        id
      }
    }
  }
`;

export const REMOVE_CART_PROMO_MUTATION = gql`
  mutation RemoveCartPromo($input: RemoveCartPromoInput) {
    removeCartPromo(input: $input) {
      id
      promoCode
      items {
        id
      }
    }
  }
`;

export const MERGE_GUEST_CART_MUTATION = gql`
  mutation MergeGuestCart($input: MergeGuestCartInput!) {
    mergeGuestCart(input: $input) {
      id
    }
  }
`;

export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      comment
      status
    }
  }
`;

export const ADD_TO_WISHLIST_MUTATION = gql`
  mutation AddToWishlist($input: WishlistProductInput!) {
    addToWishlist(input: $input) {
      id
    }
  }
`;

export const REMOVE_FROM_WISHLIST_MUTATION = gql`
  mutation RemoveFromWishlist($input: WishlistProductInput!) {
    removeFromWishlist(input: $input) {
      id
    }
  }
`;

export const CREATE_RETURN_REQUEST_MUTATION = gql`
  mutation CreateReturnRequest($input: CreateReturnRequestInput!) {
    createReturnRequest(input: $input) {
      id
      reason
      exchangePreferred
      status
      createdAt
    }
  }
`;

export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      total
      status
    }
  }
`;

export const CREATE_PAYMENT_INTENT_MUTATION = gql`
  mutation CreatePaymentIntent($input: CreatePaymentIntentInput!) {
    createPaymentIntent(input: $input) {
      clientSecret
      payment {
        id
        intentId
        status
      }
    }
  }
`;

export const CONFIRM_PAYMENT_MUTATION = gql`
  mutation ConfirmPayment($input: ConfirmPaymentInput!) {
    confirmPayment(input: $input) {
      order {
        id
        status
        total
      }
      payment {
        id
        status
        last4
      }
    }
  }
`;

export const ADMIN_CREATE_CATEGORY_MUTATION = gql`
  mutation AdminCreateCategory($input: CreateCategoryInput!) {
    adminCreateCategory(input: $input) {
      id
      name
    }
  }
`;

export const ADMIN_CREATE_BRAND_MUTATION = gql`
  mutation AdminCreateBrand($input: CreateBrandInput!) {
    adminCreateBrand(input: $input) {
      id
      name
    }
  }
`;

export const ADMIN_CREATE_PRODUCT_MUTATION = gql`
  mutation AdminCreateProduct($input: CreateProductInput!) {
    adminCreateProduct(input: $input) {
      id
      name
    }
  }
`;

export const ADMIN_CREATE_VARIANT_MUTATION = gql`
  mutation AdminCreateVariant($input: CreateVariantInput!) {
    adminCreateVariant(input: $input) {
      id
      sku
      inventory {
        quantity
      }
    }
  }
`;

export const ADMIN_UPDATE_INVENTORY_MUTATION = gql`
  mutation AdminUpdateInventory($input: UpdateInventoryInput!) {
    adminUpdateInventory(input: $input) {
      id
      quantity
      lowStockThreshold
    }
  }
`;

export const ADMIN_CREATE_COUPON_MUTATION = gql`
  mutation AdminCreateCoupon($input: CreateCouponInput!) {
    adminCreateCoupon(input: $input) {
      id
      code
    }
  }
`;

export const ADMIN_UPDATE_ORDER_STATUS_MUTATION = gql`
  mutation AdminUpdateOrderStatus($input: UpdateOrderStatusInput!) {
    adminUpdateOrderStatus(input: $input) {
      id
      status
    }
  }
`;

export const ADMIN_UPDATE_USER_ROLE_MUTATION = gql`
  mutation AdminUpdateUserRole($input: UpdateUserRoleInput!) {
    adminUpdateUserRole(input: $input) {
      id
      role
    }
  }
`;

export const SUBSCRIBE_NEWSLETTER_MUTATION = gql`
  mutation SubscribeNewsletter($input: NewsletterSubscriptionInput!) {
    subscribeNewsletter(input: $input) {
      success
      message
    }
  }
`;

export const SUBSCRIBE_BACK_IN_STOCK_MUTATION = gql`
  mutation SubscribeBackInStock($input: BackInStockSubscriptionInput!) {
    subscribeBackInStock(input: $input) {
      success
      message
    }
  }
`;

export const SUBMIT_SUPPORT_MESSAGE_MUTATION = gql`
  mutation SubmitSupportMessage($input: SupportMessageInput!) {
    submitSupportMessage(input: $input) {
      id
      status
      message
    }
  }
`;

export const TRACK_ANALYTICS_EVENT_MUTATION = gql`
  mutation TrackAnalyticsEvent($input: ClientAnalyticsInput!) {
    trackClientAnalytics(input: $input) {
      id
      eventType
      metadata
    }
  }
`;

export const SAVE_ADDRESS_MUTATION = gql`
  mutation SaveAddress($input: SaveAddressInput!) {
    saveAddress(input: $input) {
      id
      fullName
      line1
      city
      region
      postalCode
      isDefault
    }
  }
`;

export const UPDATE_ADDRESS_MUTATION = gql`
  mutation UpdateAddress($input: UpdateAddressInput!) {
    updateAddress(input: $input) {
      id
      fullName
      line1
      city
      region
      postalCode
      isDefault
    }
  }
`;

export const DELETE_ADDRESS_MUTATION = gql`
  mutation DeleteAddress($id: Int!) {
    deleteAddress(id: $id)
  }
`;

export const SET_DEFAULT_ADDRESS_MUTATION = gql`
  mutation SetDefaultAddress($id: Int!) {
    setDefaultAddress(id: $id) {
      id
      isDefault
    }
  }
`;
