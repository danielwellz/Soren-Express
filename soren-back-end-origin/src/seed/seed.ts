import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { describeDbConnectionError, resolveRuntimeDbConfig, sanitizeDbConfig } from 'src/config/runtime-env';
import {
  Brand,
  Category,
  Coupon,
  ENTITIES,
  Inventory,
  Product,
  ProductVariant,
  Review,
  ShippingRule,
  TaxRule,
  User,
} from 'src/entities';
import { CouponType, ReviewStatus, UserRole } from 'src/common/enums';

async function seed(): Promise<void> {
  const db = resolveRuntimeDbConfig();
  // eslint-disable-next-line no-console
  console.log(`[seed] Using DB config: ${JSON.stringify(sanitizeDbConfig(db))}`);

  const connection = await createConnection({
    type: 'mariadb',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.database,
    synchronize: db.synchronize,
    entities: ENTITIES,
  });

  try {
    const userRepo = connection.getRepository(User);
    const categoryRepo = connection.getRepository(Category);
    const brandRepo = connection.getRepository(Brand);
    const productRepo = connection.getRepository(Product);
    const variantRepo = connection.getRepository(ProductVariant);
    const inventoryRepo = connection.getRepository(Inventory);
    const reviewRepo = connection.getRepository(Review);
    const couponRepo = connection.getRepository(Coupon);
    const taxRepo = connection.getRepository(TaxRule);
    const shippingRepo = connection.getRepository(ShippingRule);

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@soren.store';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

    let admin = await userRepo.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = await userRepo.save(
        userRepo.create({
          email: adminEmail,
          passwordHash: await bcrypt.hash(adminPassword, 10),
          fullName: 'Soren Admin',
          role: UserRole.ADMIN,
          phone: '+15550001000',
          address: '1 Admin Ave',
        }),
      );
    }

    let customer = await userRepo.findOne({ where: { email: 'customer@soren.store' } });
    if (!customer) {
      customer = await userRepo.save(
        userRepo.create({
          email: 'customer@soren.store',
          passwordHash: await bcrypt.hash('Customer123!', 10),
          fullName: 'Demo Customer',
          role: UserRole.CUSTOMER,
          phone: '+15550002000',
          address: '22 Market St',
        }),
      );
    }

    const categories: Record<string, Category> = {};
    for (const item of [
      { name: 'Speakers', description: 'Portable and home speaker systems' },
      { name: 'Headphones', description: 'Wireless and wired headphones' },
      { name: 'Wearables', description: 'Smart watches and accessories' },
    ]) {
      let entity = await categoryRepo.findOne({ where: { name: item.name } });
      if (!entity) {
        entity = await categoryRepo.save(categoryRepo.create(item));
      }
      categories[item.name] = entity;
    }

    const brands: Record<string, Brand> = {};
    for (const item of [
      { name: 'JBL', description: 'Performance audio products' },
      { name: 'Harman Kardon', description: 'Premium home audio' },
      { name: 'Apple', description: 'Connected accessories' },
    ]) {
      let entity = await brandRepo.findOne({ where: { name: item.name } });
      if (!entity) {
        entity = await brandRepo.save(brandRepo.create(item));
      }
      brands[item.name] = entity;
    }

    const productSeeds = [
      {
        name: 'JBL Flip 6',
        slug: 'jbl-flip-6',
        description: 'Rugged portable speaker with clear highs and deep bass.',
        basePrice: 129.99,
        category: categories.Speakers,
        brand: brands.JBL,
        thumbnail: '/images/product-images/Speakers/JBL Flip 6/Black/Tehranspeaker-JBL-Flip-6-Black-1.jpg',
        galleryUrls: [
          '/images/product-images/Speakers/JBL Flip 6/Black/Tehranspeaker-JBL-Flip-6-Black-1.jpg',
          '/images/product-images/Speakers/JBL Flip 6/White/Tehranspeaker-JBL-Flip-6-White-1.jpg',
        ],
        isFeatured: true,
        variants: [
          { sku: 'JBL-FLIP6-BLK', color: 'Black', size: 'One Size', priceAdjustment: 0, inventory: 25 },
          { sku: 'JBL-FLIP6-WHT', color: 'White', size: 'One Size', priceAdjustment: 0, inventory: 16 },
        ],
      },
      {
        name: 'Harman Kardon Onyx Studio 8',
        slug: 'harman-kardon-onyx-studio-8',
        description: 'Room-filling audio with elegant design and premium build.',
        basePrice: 349.99,
        category: categories.Speakers,
        brand: brands['Harman Kardon'],
        thumbnail: '/images/product-images/Speakers/Harman Kardon Onyx Sudio 8/Black/Tehranspeaker-Harman-Kardon-Onyx-Studio-8-Black-1.jpg',
        galleryUrls: [
          '/images/product-images/Speakers/Harman Kardon Onyx Sudio 8/Black/Tehranspeaker-Harman-Kardon-Onyx-Studio-8-Black-1.jpg',
          '/images/product-images/Speakers/Harman Kardon Onyx Sudio 8/Champagne/Tehranspeaker-Harman-Kardon-Onyx-Studio-8-Champagne-1.jpg',
        ],
        isFeatured: true,
        variants: [
          { sku: 'HK-ONYX8-BLK', color: 'Black', size: 'One Size', priceAdjustment: 0, inventory: 9 },
          { sku: 'HK-ONYX8-CHAMP', color: 'Champagne', size: 'One Size', priceAdjustment: 20, inventory: 5 },
        ],
      },
      {
        name: 'AirPods Pro (2nd Gen)',
        slug: 'airpods-pro-2nd-gen',
        description: 'Adaptive noise cancellation and transparency with MagSafe charging.',
        basePrice: 249.99,
        category: categories.Headphones,
        brand: brands.Apple,
        thumbnail: '/images/150x150.png',
        galleryUrls: ['/images/150x150.png'],
        isFeatured: true,
        variants: [
          { sku: 'APP-AIRPODS2-WHT', color: 'White', size: 'Standard', priceAdjustment: 0, inventory: 33 },
        ],
      },
    ];

    for (const seedProduct of productSeeds) {
      let product = await productRepo.findOne({ where: { slug: seedProduct.slug } });
      if (!product) {
        product = await productRepo.save(
          productRepo.create({
            name: seedProduct.name,
            slug: seedProduct.slug,
            description: seedProduct.description,
            basePrice: seedProduct.basePrice,
            category: seedProduct.category,
            brand: seedProduct.brand,
            thumbnail: seedProduct.thumbnail,
            galleryUrls: seedProduct.galleryUrls,
            isFeatured: seedProduct.isFeatured,
            published: true,
          }),
        );
      }

      for (const seedVariant of seedProduct.variants) {
        let variant = await variantRepo.findOne({ where: { sku: seedVariant.sku } });
        if (!variant) {
          variant = await variantRepo.save(
            variantRepo.create({
              product,
              sku: seedVariant.sku,
              color: seedVariant.color,
              size: seedVariant.size,
              priceAdjustment: seedVariant.priceAdjustment,
            }),
          );
        }

        let inventory = await inventoryRepo.findOne({ where: { variant } });
        if (!inventory) {
          inventory = inventoryRepo.create({
            variant,
            quantity: seedVariant.inventory,
            lowStockThreshold: 4,
          });
        } else {
          inventory.quantity = Math.max(inventory.quantity, seedVariant.inventory);
        }
        await inventoryRepo.save(inventory);
      }
    }

    const reviewProduct = await productRepo.findOne({ where: { slug: 'jbl-flip-6' } });
    if (reviewProduct) {
      const existingReview = await reviewRepo.findOne({ where: { product: reviewProduct, user: customer } });
      if (!existingReview) {
        await reviewRepo.save(
          reviewRepo.create({
            product: reviewProduct,
            user: customer,
            rating: 5,
            comment: 'Fantastic clarity and battery life for outdoor trips.',
            status: ReviewStatus.APPROVED,
          }),
        );
      }
    }

    for (const coupon of [
      {
        code: 'WELCOME10',
        type: CouponType.PERCENT,
        amount: 10,
        minOrderAmount: 100,
        active: true,
      },
      {
        code: 'SAVE25',
        type: CouponType.FIXED,
        amount: 25,
        minOrderAmount: 200,
        active: true,
      },
    ]) {
      const existing = await couponRepo.findOne({ where: { code: coupon.code } });
      if (!existing) {
        await couponRepo.save(couponRepo.create(coupon));
      }
    }

    for (const rule of [
      { region: 'US-CA', rate: 0.0825, active: true },
      { region: 'US-NY', rate: 0.088, active: true },
      { region: 'US-TX', rate: 0.0625, active: true },
      { region: 'US-DEFAULT', rate: 0.07, active: true },
    ]) {
      const existing = await taxRepo.findOne({ where: { region: rule.region } });
      if (!existing) {
        await taxRepo.save(taxRepo.create(rule));
      }
    }

    for (const rule of [
      { region: 'US-CA', flatRate: 12, freeShippingOver: 150, active: true },
      { region: 'US-NY', flatRate: 10, freeShippingOver: 150, active: true },
      { region: 'US-TX', flatRate: 9, freeShippingOver: 125, active: true },
      { region: 'US-DEFAULT', flatRate: 11, freeShippingOver: 150, active: true },
    ]) {
      const existing = await shippingRepo.findOne({ where: { region: rule.region } });
      if (!existing) {
        await shippingRepo.save(shippingRepo.create(rule));
      }
    }

    // eslint-disable-next-line no-console
    console.log('Seed complete');
    // eslint-disable-next-line no-console
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  } finally {
    await connection.close();
  }
}

seed().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(`[seed] Failed: ${describeDbConnectionError(error)}`);
  process.exit(1);
});
