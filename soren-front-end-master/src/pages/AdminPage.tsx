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
import React, { useMemo, useState } from 'react';
import { useToast } from '../context/ToastContext';
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
  background: 'linear-gradient(135deg, rgba(255,255,255,0.86), rgba(255,255,255,0.98))',
  border: '1px solid rgba(217,229,243,0.9)',
};

export function AdminPage() {
  const { showToast } = useToast();

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
        Admin dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          ['Products', metrics.products],
          ['Orders', metrics.orders],
          ['Users', metrics.users],
          ['Coupons', metrics.coupons],
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
              <Typography variant="h6">Create category</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <TextField
                  fullWidth
                  label="Category name"
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
                        showToast('Category created', 'success');
                      })
                      .catch((error: Error) => showToast(error.message, 'error'));
                  }}
                >
                  Add
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={dashboardCard}>
            <CardContent>
              <Typography variant="h6">Create brand</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <TextField
                  fullWidth
                  label="Brand name"
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
                        showToast('Brand created', 'success');
                      })
                      .catch((error: Error) => showToast(error.message, 'error'));
                  }}
                >
                  Add
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={dashboardCard}>
            <CardContent>
              <Typography variant="h6">Create coupon</Typography>
              <Grid container spacing={1.2} sx={{ mt: 0.2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Code"
                    value={couponForm.code}
                    onChange={(event) =>
                      setCouponForm((old) => ({ ...old, code: event.target.value.toUpperCase() }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="coupon-type-label">Type</InputLabel>
                    <Select
                      labelId="coupon-type-label"
                      label="Type"
                      value={couponForm.type}
                      onChange={(event) =>
                        setCouponForm((old) => ({ ...old, type: event.target.value }))
                      }
                    >
                      <MenuItem value="PERCENT">Percent</MenuItem>
                      <MenuItem value="FIXED">Fixed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2.5}>
                  <TextField
                    fullWidth
                    label="Amount"
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
                    label="Min"
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
                      showToast('Coupon created', 'success');
                    })
                    .catch((error: Error) => showToast(error.message, 'error'));
                }}
              >
                Save coupon
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={8}>
          <Card sx={dashboardCard}>
            <CardContent>
              <Typography variant="h6">Create product</Typography>
              <Grid container spacing={1.2} sx={{ mt: 0.3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm((old) => ({ ...old, name: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Slug"
                    value={productForm.slug}
                    onChange={(event) =>
                      setProductForm((old) => ({ ...old, slug: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm((old) => ({ ...old, description: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Base price"
                    type="number"
                    value={productForm.basePrice}
                    onChange={(event) =>
                      setProductForm((old) => ({ ...old, basePrice: Number(event.target.value) }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="category-id-label">Category</InputLabel>
                    <Select
                      labelId="category-id-label"
                      label="Category"
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
                    <InputLabel id="brand-id-label">Brand</InputLabel>
                    <Select
                      labelId="brand-id-label"
                      label="Brand"
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
                    label="Thumbnail URL"
                    value={productForm.thumbnail}
                    onChange={(event) =>
                      setProductForm((old) => ({ ...old, thumbnail: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Gallery URLs (comma-separated)"
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
                      showToast('Product created', 'success');
                      void refetchProducts();
                    })
                    .catch((error: Error) => showToast(error.message, 'error'));
                }}
              >
                Save product
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ ...dashboardCard, mt: 2 }}>
            <CardContent>
              <Typography variant="h6">Create variant + inventory</Typography>
              <Grid container spacing={1.2} sx={{ mt: 0.3 }}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="variant-product-label">Product</InputLabel>
                    <Select
                      labelId="variant-product-label"
                      label="Product"
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
                    label="SKU"
                    value={variantForm.sku}
                    onChange={(event) =>
                      setVariantForm((old) => ({ ...old, sku: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2.2}>
                  <TextField
                    fullWidth
                    label="Color"
                    value={variantForm.color}
                    onChange={(event) =>
                      setVariantForm((old) => ({ ...old, color: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2.2}>
                  <TextField
                    fullWidth
                    label="Size"
                    value={variantForm.size}
                    onChange={(event) =>
                      setVariantForm((old) => ({ ...old, size: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2.2}>
                  <TextField
                    fullWidth
                    label="Price adj"
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
                    label="Inventory"
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
                      showToast('Variant created', 'success');
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
                Save variant
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={dashboardCard}>
            <CardContent>
              <Typography variant="h6">Latest analytics events</Typography>
              <Stack spacing={1} sx={{ mt: 1.2 }}>
                {(analyticsData?.adminAnalyticsEvents || []).slice(0, 10).map((event: any) => (
                  <Box key={event.id} sx={{ p: 1.2, border: '1px solid #e5edf3', borderRadius: 1 }}>
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
                Orders
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(ordersData?.adminOrders || []).map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.user?.fullName || order.user?.email}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell>${Number(order.total).toFixed(2)}</TableCell>
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
                                  showToast(`Order moved to ${nextStatus}`, 'success');
                                  void refetchOrders();
                                })
                                .catch((error: Error) => showToast(error.message, 'error'));
                            }}
                          >
                            Advance status
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
                Users
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(usersData?.adminUsers || []).map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.role}</TableCell>
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
                                  showToast(`Updated to ${nextRole}`, 'success');
                                  void refetchUsers();
                                })
                                .catch((error: Error) => showToast(error.message, 'error'));
                            }}
                          >
                            Toggle role
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
