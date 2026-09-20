require('dotenv').config();
const { PrismaClient } = require('../app/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing old data from Supabase...');
  try {
    await prisma.paymentTransaction.deleteMany({});
  } catch (e) {}
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.blogPost.deleteMany({});
  await prisma.childProfile.deleteMany({});
  await prisma.userAddress.deleteMany({});
  await prisma.productSizeStock.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding products...');
  const lionTee = await prisma.product.create({
    data: {
      emoji: '🦁',
      name: 'Lion Safari Tee',
      ageRange: '4–8 yrs',
      price: 499,
      oldPrice: 799,
      bg: 'var(--coral-l)',
      tag: '🔥 Hot',
      tagClass: 'p-c',
      description: 'Super soft graphic tee made with 100% organic cotton. Reinforced seams for maximum play durability.',
      isFeatured: true,
      sizes: {
        create: [
          { size: '3–4Y', stock: 10 },
          { size: '4–5Y', stock: 15 },
          { size: '5–6Y', stock: 2 },
          { size: '6–7Y', stock: 8 },
          { size: '7–8Y', stock: 0 },
        ],
      },
    },
  });

  const floralDress = await prisma.product.create({
    data: {
      emoji: '🌸',
      name: 'Floral Summer Dress',
      ageRange: '3–7 yrs',
      price: 749,
      bg: 'var(--teal-l)',
      tag: 'New',
      tagClass: 'p-t',
      description: 'Flowy, breathable summer dress with hand-drawn floral prints. Fully lined with cotton for comfort.',
      isFeatured: true,
      sizes: {
        create: [
          { size: '3–4Y', stock: 5 },
          { size: '4–5Y', stock: 10 },
          { size: '5–6Y', stock: 12 },
          { size: '6–7Y', stock: 4 },
        ],
      },
    },
  });

  const spaceExplorer = await prisma.product.create({
    data: {
      emoji: '🚀',
      name: 'Space Explorer Set',
      ageRange: '6–10 yrs',
      price: 999,
      oldPrice: 1499,
      bg: 'var(--sun-l)',
      tag: 'Sale',
      tagClass: 'p-s',
      description: 'Matching tee and shorts coordinate set featuring fun astronaut graphics. Comfy, elastic waistband.',
      isFeatured: true,
      isSale: true,
      sizes: {
        create: [
          { size: '4–5Y', stock: 8 },
          { size: '6–7Y', stock: 12 },
          { size: '8–9Y', stock: 4 },
        ],
      },
    },
  });

  const sparkleJogger = await prisma.product.create({
    data: {
      emoji: '🌟',
      name: 'Sparkle Jogger Set',
      ageRange: '10–14 yrs',
      price: 1199,
      bg: 'var(--purple-l)',
      tag: 'New',
      tagClass: 'p-p',
      description: 'Lounge set in pastel colors with glitter star highlights. Soft rib trim on cuffs and collar.',
      isFeatured: true,
      isNew: true,
      sizes: {
        create: [
          { size: '10–11Y', stock: 10 },
          { size: '12–13Y', stock: 14 },
          { size: '13–14Y', stock: 5 },
        ],
      },
    },
  });

  const foxRomper = await prisma.product.create({
    data: {
      emoji: '🦊',
      name: 'Fox Print Romper',
      ageRange: '0–12m',
      price: 599,
      bg: 'var(--coral-l)',
      tag: 'New',
      tagClass: 'p-t',
      description: 'Super-stretchy baby romper with cute fox graphics and two-way zippers for easy diaper changes.',
      isFeatured: true,
      isNew: true,
      sizes: {
        create: [
          { size: '0M', stock: 10 },
          { size: '3M', stock: 12 },
          { size: '6M', stock: 15 },
          { size: '12M', stock: 6 },
        ],
      },
    },
  });

  const oceanShorts = await prisma.product.create({
    data: {
      emoji: '🌊',
      name: 'Ocean Shorts',
      ageRange: '5–9 yrs',
      price: 349,
      oldPrice: 549,
      bg: 'var(--teal-l)',
      tag: 'Sale',
      tagClass: 'p-c',
      description: 'Quick-dry shorts with drawstring waist. Perfect for beach trips, pool play, or sunny afternoons.',
      isFeatured: true,
      isSale: true,
      sizes: {
        create: [
          { size: '4–5Y', stock: 5 },
          { size: '5–6Y', stock: 10 },
          { size: '6–7Y', stock: 0 },
        ],
      },
    },
  });

  // Add-on products for complete-the-look or cart upsell
  await prisma.product.create({
    data: {
      emoji: '🩳',
      name: 'Denim Shorts',
      ageRange: '3–8 yrs',
      price: 449,
      bg: 'var(--teal-l)',
      description: 'Soft-wash adjustable waist denim shorts.',
      sizes: {
        create: [
          { size: '3–4Y', stock: 20 },
          { size: '4–5Y', stock: 20 },
          { size: '5–6Y', stock: 20 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      emoji: '🧢',
      name: 'Fun Cap',
      ageRange: 'All sizes',
      price: 299,
      bg: 'var(--sun-l)',
      description: 'Sun protection cap with custom embroidery.',
      sizes: {
        create: [
          { size: 'One size', stock: 50 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      emoji: '🧦',
      name: 'Cute Socks',
      ageRange: 'All sizes',
      price: 149,
      bg: 'var(--purple-l)',
      description: 'Pack of 3 combed cotton socks with animal motifs.',
      sizes: {
        create: [
          { size: 'One size', stock: 100 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      emoji: '🎒',
      name: 'Mini Backpack',
      ageRange: 'All sizes',
      price: 699,
      bg: 'var(--coral-l)',
      description: 'Perfect toddler-sized backpack for nursery or park outings.',
      sizes: {
        create: [
          { size: 'One size', stock: 15 },
        ],
      },
    },
  });

  console.log('Seeding reviews...');
  await prisma.review.createMany({
    data: [
      {
        productId: lionTee.id,
        userName: 'Priya R.',
        avatarBg: 'var(--teal-l)',
        avatarFg: 'var(--teal-d)',
        rating: 5,
        comment: 'My 5-year-old loves this! The fabric is so soft and vibrant even after 10+ washes. Ordering another color!',
      },
      {
        productId: lionTee.id,
        userName: 'Amit M.',
        avatarBg: 'var(--sun-l)',
        avatarFg: 'var(--sun-d)',
        rating: 5,
        comment: 'Great quality for the price. Sizing runs slightly large — perfect for growing into. Fast delivery too!',
      },
      {
        productId: lionTee.id,
        userName: 'Sunita K.',
        avatarBg: 'var(--coral-l)',
        avatarFg: 'var(--coral-d)',
        rating: 5,
        comment: 'Colors exactly as shown. My daughter refuses to wear anything else! 😂',
      },
    ],
  });

  console.log('Seeding blogs...');
  await prisma.blogPost.createMany({
    data: [
      {
        title: '5 summer outfits your kids will absolutely love in 2025',
        tag: 'Style guide',
        readTime: '5 min read',
        emoji: '☀️',
        content: `Summer is here — and dressing kids for the heat while keeping them cute is an art. We've curated five best outfit combinations that are breathable, fun, and totally kid-approved.\n\n### 1. The Safari Explorer 🦁\n\nPair our Lion Safari Tee with lightweight denim shorts and a cap. Perfect for outdoor adventures or just a very enthusiastic afternoon in the park.`,
      },
      {
        title: 'How to pick the right size every time',
        tag: 'Sizing tips',
        readTime: '4 min read',
        emoji: '📏',
        content: `Finding the right fit for your growing child is crucial. E-commerce size charts and age recommendations are great baselines, but checking physical measurements of chest and height is always the most accurate method.`,
      },
      {
        title: 'Diwali outfits — the 2025 festive edit',
        tag: 'Occasions',
        readTime: '3 min read',
        emoji: '🎉',
        content: `Celebrate with colors and comfort. Our upcoming Diwali 2025 collection features skin-safe fabrics with traditional prints, tailored for kids to run around and play freely while looking their festive best.`,
      },
    ],
  });

  console.log('Seeding coupons...');
  await prisma.coupon.createMany({
    data: [
      { code: 'NAVVY20', discountPct: 20 },
      { code: 'NAVVY10', discountPct: 10 },
    ],
  });

  console.log('Seeding demo user...');
  await prisma.user.create({
    data: {
      phone: '9876543210',
      coins: 480,
      addresses: {
        create: [
          {
            name: 'Priya Sharma',
            phone: '+91 98765 43210',
            address: '42, Green Park Colony',
            pincode: '440010',
            city: 'Nagpur',
            state: 'Maharashtra',
            type: 'Home',
            isDefault: true,
          },
        ],
      },
      childProfiles: {
        create: [
          {
            name: 'Aanya',
            age: 5,
            size: '4–5Y',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
