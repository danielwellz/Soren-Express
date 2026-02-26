import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { useLocaleFormatters } from '../hooks/useLocaleFormatters';
import {
  ADMIN_ANALYTICS_QUERY,
  ADMIN_COUPONS_QUERY,
  ADMIN_CREATE_BRAND_MUTATION,
  ADMIN_CREATE_CATEGORY_MUTATION,
  ADMIN_CREATE_COUPON_MUTATION,
  ADMIN_CREATE_PRODUCT_MUTATION,
  ADMIN_CREATE_VARIANT_MUTATION,
  ADMIN_ORDERS_QUERY,
  ADMIN_PRODUCTS_QUERY,
  ADMIN_UPDATE_ORDER_STATUS_MUTATION,
  ADMIN_UPDATE_USER_ROLE_MUTATION,
  ADMIN_USERS_QUERY,
  BRANDS_QUERY,
  CATEGORIES_QUERY,
} from '../graphql/documents';

const dashboardCard = {
  borderRadius: 3,
  background: (theme: any) =>
    `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.88)}, ${alpha(theme.palette.background.paper, 0.98)})`,
  border: '1px solid',
  borderColor: 'divider',
};

function localizeStatus(status: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    PENDING: t('orderDetails.status.pending'),
    PAID: t('orderDetails.status.paid'),
    FULFILLED: t('orderDetails.status.fulfilled'),
    CANCELLED: t('orderDetails.status.cancelled'),
  };
  return map[status] || status;
}

export function AdminPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { formatCurrency } = useLocaleFormatters();

  const { data: productsData, refetch: refetchProducts } = useQuery(ADMIN_PRODUCTS_QUERY);
  const { data: ordersData, refetch: refetchOrders } = useQuery(ADMIN_ORDERS_QUERY);
  const { data: usersData, refetch: refetchUsers } = useQuery(ADMIN_USERS_QUERY);
  const { data: couponsData, refetch: refetchCoupons } = useQuery(ADMIN_COUPONS_QUERY);
  const { data: analyticsData } = useQuery(ADMIN_ANALYTICS_QUERY, { variables: { limit: 20 } });
  const { data: categoriesData, refetch: refetchCategories } = useQuery(CATEGORIES_QUERY);
  const { data: brandsData, refetch: refetchBrands } = useQuery(BRANDS_QUERY);

  const [createCategory] = useMutation(ADMIN_CREATE_CATEGORY_MUTATION);
  const [createBrand] = useMutation(ADMIN_CREATE_BRAND_MUTATION);
  const [createProduct] = useMutation(ADMIN_CREATE_PRODUCT_MUTATION);
  const [createVariant] = useMutation(ADMIN_CREATE_VARIANT_MUTATION);
  const [createCoupon] = useMutation(ADMIN_CREATE_COUPON_MUTATION);
  const [updateOrderStatus] = useMutation(ADMIN_UPDATE_ORDER_STATUS_MUTATION);
  const [updateUserRole] = useMutation(ADMIN_UPDATE_USER_ROLE_MUTATION);

  const [categoryName, setCategoryName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'PERCENT',
    amount: 10,
    minOrderAmount: 0,
  });

  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    basePrice: 0,
    categoryId: '',
    brandId: '',
    thumbnail: '',
    galleryUrls: '',
    isFeatured: true,
    published: true,
  });

  const [variantForm, setVariantForm] = useState({
    productId: '',
    sku: '',
    color: '',
    size: '',
    priceAdjustment: 0,
    inventoryQuantity: 0,
  });

  const metrics = useMemo(
    () => ({
      products: productsData?.adminProducts?.length || 0,
      orders: ordersData?.adminOrders?.length || 0,
      users: usersData?.adminUsers?.length || 0,
      coupons: couponsData?.adminCoupons?.length || 0,
    }),
    [productsData, ordersData, usersData, couponsData],
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2.5 }}>
        {t('admin.title')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          [t('admin.metrics.products'), metrics.products],
          [t('admin.metrics.orders'), metrics.orders],
          [t('admin.metrics.users'), metrics.users],
          [t('admin.metrics.coupons'), metrics.coupons],
        ].map(([label, value]) => (
          <Grid item xs={6} md={3} key={label}>
            <Card sx={dashboardCard}>
              <CardContent>
                <Typography color="text.secondary">{label}</Typography>
                <Typography variant="h4">{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={dashboardCard}>
            <CardContent>
              <Typography variant="h6">{t('admin.createCategory')}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <TextField
                  fullWidth
                  label={t('admin.categoryName')}
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    void createCategory({
                      variables: { input: { name: categoryName } },
                    })
                      .then(() => {
                        setCategoryName('');
                        void refetchCategories();
                        showToast(t('admin.categoryCreated'), 'success');
                      })
                      .catch((error: Error) => showToast(error.message, 'error'));
                  }}
                >
                  {t('common.add')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={dashboardCard}>
            <CardContent>
              <Typography variant="h6">{t('admin.createBrand')}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <TextField
                  fullWidth
                  label={t('admin.brandName')}
                  value={brandName}
                  onChange={(event) => setBrandName(event.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    void createBrand({
                      variables: { input: { name: brandName } },
                    })
                      .then(() => {
                        setBrandName('');
                        void refetchBrands();
                        showToast(t('admin.brandCreated'), 'success');
                      })
                      .catch((error: Error) => showToast(error.message, 'error'));
                  }}
                >
                  {t('common.add')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={dashboardCard}>
            <CardContent>
              <Typography variant="h6">{t('admin.createCoupon')}</Typography>
              <Grid container spacing={1.2} sx={{ mt: 0.2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('admin.code')}
                    value={couponForm.code}
                    onChange={(event) =>
                      setCouponForm((old) => ({ ...old, code: event.target.value.toUpperCase() }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="coupon-type-label">{t('admin.type')}</InputLabel>
                    <Select
                      labelId="coupon-type-label"
                      label={t('admin.type')}
                      value={couponForm.type}
                      onChange={(event) =>
                        setCouponForm((old) => ({ ...old, type: event.target.value }))
                      }
                    >
                      <MenuItem value="PERCENT">{t('admin.percent')}</MenuItem>
                      <MenuItem value="FIXED">{t('admin.fixed')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2.5}>
                  <TextField
                    fullWidth
                    label={t('admin.amount')}
                    type="number"
                    value={couponForm.amount}
                    onChange={(event) =>
                      setCouponForm((old) => ({ ...old, amount: Number(event.target.value) }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2.5}>
                  <TextField
                    fullWidth
                    label={t('admin.min')}
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(event) =>
                      setCouponForm((old) => ({ ...old, minOrderAmount: Number(event.target.value) }))
                    }
                  />
                </Grid>
              </Grid>
              <Button
                sx={{ mt: 1.2 }}
                variant="contained"
                onClick={() => {
                  void createCoupon({
                    variables: {
                      input: {
                        ...couponForm,
                        active: true,
                      },
                    },
                  })
                    .then(() => {
                      setCouponForm({ code: '', type: 'PERCENT', amount: 10, minOrderAmount: 0 });
                      void refetchCoupons();
                      showToast(t('admin.couponCreated'), 'success');
                    })
                    .catch((error: Error) => showToast(error.message, 'error'));
                }}
              >
                {t('admin.saveCoupon')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={8}>
          <Card sx={dashboardCard}>
            <CardContent>
              <Typography variant="h6">{t('admin.createProduct')}</Typography>
              <Grid container spacing={1.2} sx={{ mt: 0.3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('admin.name')}
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm((old) => ({ ...old, name: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('admin.slug')}
                    value={productForm.slug}
                    onChange={(event) =>
                      setProductForm((old) => ({ ...old, slug: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('admin.description')}
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm((old) => ({ ...old, description: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label={t('admin.basePrice')}
                    type="number"
                    value={productForm.basePrice}
                    onChange={(event) =>
                      setProductForm((old) => ({ ...old, basePrice: Number(event.target.value) }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="category-id-label">{t('admin.category')}</InputLabel>
                    <Select
                      labelId="category-id-label"
                      label={t('admin.category')}
                      value={productForm.categoryId}
                      onChange={(event) =>
                        setProductForm((old) => ({ ...old, categoryId: event.target.value }))
                      }
                    >
                      {(categoriesData?.categories || []).map((category: any) => (
                        <MenuItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="brand-id-label">{t('admin.brand')}</InputLabel>
                    <Select
                      labelId="brand-id-label"
                      label={t('admin.brand')}
                      value={productForm.brandId}
                      onChange={(event) =>
                        setProductForm((old) => ({ ...old, brandId: event.target.value }))
                      }
                    >
                      {(brandsData?.brands || []).map((brand: any) => (
                        <MenuItem key={brand.id} value={String(brand.id)}>
                          {brand.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label={t('admin.thumbnail')}
                    value={productForm.thumbnail}
                    onChange={(event) =>
                      setProductForm((old) => ({ ...old, thumbnail: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('admin.galleryUrls')}
                    value={productForm.galleryUrls}
                    onChange={(event) =>
                      setProductForm((old) => ({ ...old, galleryUrls: event.target.value }))
                    }
                  />
                </Grid>
              </Grid>
              <Button
                sx={{ mt: 1.2 }}
                variant="contained"
                onClick={() => {
                  void createProduct({
                    variables: {
                      input: {
                        name: productForm.name,
                        slug: productForm.slug,
                        description: productForm.description,
                        basePrice: Number(productForm.basePrice),
                        categoryId: Number(productForm.categoryId),
                        brandId: Number(productForm.brandId),
                        thumbnail: productForm.thumbnail || undefined,
                        galleryUrls: productForm.galleryUrls
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean),
                        isFeatured: productForm.isFeatured,
                        published: productForm.published,
                      },
                    },
                  })
                    .then(() => {
                      showToast(t('admin.productCreated'), 'success');
                      void refetchProducts();
                    })
                    .catch((error: Error) => showToast(error.message, 'error'));
                }}
              >
                {t('admin.saveProduct')}
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ ...dashboardCard, mt: 2 }}>
            <CardContent>
              <Typography variant="h6">{t('admin.createVariant')}</Typography>
              <Grid container spacing={1.2} sx={{ mt: 0.3 }}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="variant-product-label">{t('admin.product')}</InputLabel>
                    <Select
                      labelId="variant-product-label"
                      label={t('admin.product')}
                      value={variantForm.productId}
                      onChange={(event) =>
                        setVariantForm((old) => ({ ...old, productId: event.target.value }))
                      }
                    >
                      {(productsData?.adminProducts || []).map((product: any) => (
                        <MenuItem key={product.id} value={String(product.id)}>
                          {product.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2.2}>
                  <TextField
                    fullWidth
                    label={t('admin.sku')}
                    value={variantForm.sku}
                    onChange={(event) =>
                      setVariantForm((old) => ({ ...old, sku: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2.2}>
                  <TextField
                    fullWidth
                    label={t('admin.color')}
                    value={variantForm.color}
                    onChange={(event) =>
                      setVariantForm((old) => ({ ...old, color: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2.2}>
                  <TextField
                    fullWidth
                    label={t('admin.size')}
                    value={variantForm.size}
                    onChange={(event) =>
                      setVariantForm((old) => ({ ...old, size: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2.2}>
                  <TextField
                    fullWidth
                    label={t('admin.priceAdjustment')}
                    type="number"
                    value={variantForm.priceAdjustment}
                    onChange={(event) =>
                      setVariantForm((old) => ({ ...old, priceAdjustment: Number(event.target.value) }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2.2}>
                  <TextField
                    fullWidth
                    label={t('admin.inventory')}
                    type="number"
                    value={variantForm.inventoryQuantity}
                    onChange={(event) =>
                      setVariantForm((old) => ({ ...old, inventoryQuantity: Number(event.target.value) }))
                    }
                  />
                </Grid>
              </Grid>
              <Button
                sx={{ mt: 1.2 }}
                variant="contained"
                onClick={() => {
                  void createVariant({
                    variables: {
                      input: {
                        productId: Number(variantForm.productId),
                        sku: variantForm.sku,
                        color: variantForm.color || undefined,
                        size: variantForm.size || undefined,
                        priceAdjustment: Number(variantForm.priceAdjustment),
                        inventoryQuantity: Number(variantForm.inventoryQuantity),
                      },
                    },
                  })
                    .then(() => {
                      showToast(t('admin.variantCreated'), 'success');
                      void refetchProducts();
                      setVariantForm({
                        productId: '',
                        sku: '',
                        color: '',
                        size: '',
                        priceAdjustment: 0,
                        inventoryQuantity: 0,
                      });
                    })
                    .catch((error: Error) => showToast(error.message, 'error'));
                }}
              >
                {t('admin.saveVariant')}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={dashboardCard}>
            <CardContent>
              <Typography variant="h6">{t('admin.latestAnalytics')}</Typography>
              <Stack spacing={1} sx={{ mt: 1.2 }}>
                {(analyticsData?.adminAnalyticsEvents || []).slice(0, 10).map((event: any) => (
                  <Box key={event.id} sx={{ p: 1.2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {event.eventType}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card sx={dashboardCard}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('admin.orders')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('admin.id')}</TableCell>
                      <TableCell>{t('admin.customer')}</TableCell>
                      <TableCell>{t('admin.status')}</TableCell>
                      <TableCell>{t('admin.total')}</TableCell>
                      <TableCell align="right">{t('admin.action')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(ordersData?.adminOrders || []).map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.user?.fullName || order.user?.email}</TableCell>
                        <TableCell>{localizeStatus(order.status, t)}</TableCell>
                        <TableCell>{formatCurrency(Number(order.total || 0))}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => {
                              const nextStatus = order.status === 'PENDING' ? 'PAID' : 'FULFILLED';
                              void updateOrderStatus({
                                variables: {
                                  input: {
                                    orderId: Number(order.id),
                                    status: nextStatus,
                                  },
                                },
                              })
                                .then(() => {
                                  showToast(
                                    t('admin.orderMoved', {
                                      status: localizeStatus(nextStatus, t),
                                    }),
                                    'success',
                                  );
                                  void refetchOrders();
                                })
                                .catch((error: Error) => showToast(error.message, 'error'));
                            }}
                          >
                            {t('admin.advanceStatus')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={dashboardCard}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('admin.users')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('admin.name')}</TableCell>
                      <TableCell>{t('admin.role')}</TableCell>
                      <TableCell align="right">{t('admin.action')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(usersData?.adminUsers || []).map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{t(`account.roles.${String(user.role || '').toLowerCase()}`)}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => {
                              const nextRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
                              void updateUserRole({
                                variables: {
                                  input: {
                                    userId: Number(user.id),
                                    role: nextRole,
                                  },
                                },
                              })
                                .then(() => {
                                  showToast(
                                    t('admin.roleUpdated', {
                                      role: t(`account.roles.${String(nextRole).toLowerCase()}`),
                                    }),
                                    'success',
                                  );
                                  void refetchUsers();
                                })
                                .catch((error: Error) => showToast(error.message, 'error'));
                            }}
                          >
                            {t('admin.toggleRole')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
