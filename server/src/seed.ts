import prisma from './config/prisma';
import bcrypt from 'bcryptjs';

const products = [
  {
    name: "Butter Croissant 100g",
    description: "Flaky and buttery artisanal pastry freshly baked every morning.",
    price: 45,
    originalPrice: 50,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/zvoeqbvrbrt7atqj0dbu.png",
    category: "bakery",
    unit: "100g",
    stock: 100,
    isOrganic: false,
    rating: 4.5,
    reviewCount: 12,
  },
  {
    name: "Organic Quinoa 500g",
    description: "High protein, 100% gluten-free grain rich in fiber and minerals.",
    price: 420,
    originalPrice: 450,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/cxrrgnf12xuhkr4dyhi2.png",
    category: "pantry-staples",
    unit: "500g",
    stock: 100,
    isOrganic: true,
    rating: 4.5,
    reviewCount: 12,
  },
  {
    name: "Fresh Whole Milk 1L",
    description: "Pure farm fresh pasteurized whole cow milk packed with nutrients.",
    price: 65,
    originalPrice: 70,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/spb5sgy8g24rned9nwog.png",
    category: "dairy-eggs",
    unit: "1L",
    stock: 80,
    isOrganic: true,
    rating: 4.8,
    reviewCount: 34,
  },
  {
    name: "Organic Honeycrisp Apples 1kg",
    description: "Crisp, sweet, and juicy handpicked organic apples from local orchards.",
    price: 180,
    originalPrice: 220,
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    category: "fruits-vegetables",
    unit: "1kg",
    stock: 50,
    isOrganic: true,
    rating: 4.9,
    reviewCount: 45,
  },
  {
    name: "Farm Fresh Large Brown Eggs (12-pack)",
    description: "Free-range, grain-fed hen eggs with rich golden yolks.",
    price: 120,
    originalPrice: 140,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400",
    category: "dairy-eggs",
    unit: "12 pcs",
    stock: 90,
    isOrganic: true,
    rating: 4.7,
    reviewCount: 28,
  }
];

async function seed() {
  console.log('Seeding InstantMart database...');

  // 1. Create primary admin user (admin@instantmart.com)
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@instantmart.com' },
    update: {
      password: adminPassword,
    },
    create: {
      name: 'Super Admin',
      email: 'admin@instantmart.com',
      password: adminPassword,
      phone: '+1 555 0100',
    },
  });
  console.log('Primary Admin ready: admin@instantmart.com / admin123');

  // Secondary admin
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: adminPassword,
    },
    create: {
      name: 'Admin Demo',
      email: 'admin@example.com',
      password: adminPassword,
      phone: '+1 555 0101',
    },
  });
  console.log('Secondary Admin ready: admin@example.com / admin123');

  // 2. Create delivery partners (both approved and pending for testing)
  const partnerPassword = await bcrypt.hash('delivery123', 10);
  await prisma.deliveryPartner.upsert({
    where: { email: 'rahul@example.com' },
    update: {
      password: partnerPassword,
      isActive: true,
      status: 'APPROVED',
    },
    create: {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: partnerPassword,
      phone: '+1 555 0192',
      vehicleType: 'bike',
      isActive: true,
      status: 'APPROVED',
    },
  });
  console.log('Approved Delivery partner ready: rahul@example.com / delivery123');

  await prisma.deliveryPartner.upsert({
    where: { email: 'johndoe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: partnerPassword,
      phone: '+1 555 0193',
      vehicleType: 'scooter',
      isActive: false,
      status: 'PENDING',
    },
  });
  console.log('Pending Delivery partner ready (for approval test): johndoe@example.com / delivery123');

  // 3. Create sample products with remote hosted image URLs (Cloudinary / Unsplash)
  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }
  console.log(`Seeded ${products.length} sample products with remote CDN images.`);
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
