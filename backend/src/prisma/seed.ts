import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password', 10);

  await prisma.user.upsert({
    where: { email: 'customer1@test.com' },
    update: {},
    create: {
      email: 'customer1@test.com',
      passwordHash: password,
      role: Role.CUSTOMER,
      name: 'Customer One',
      phone: '0812345678'
    }
  });

  await prisma.user.upsert({
    where: { email: 'merchant@test.com' },
    update: {},
    create: {
      email: 'merchant@test.com',
      passwordHash: password,
      role: Role.MERCHANT_ADMIN,
      name: 'Merchant Admin',
      phone: '0899999999'
    }
  });

  const customer = await prisma.user.findUnique({ where: { email: 'customer1@test.com' } });
  if (customer) {
    const existingAddress = await prisma.address.count({ where: { userId: customer.id } });
    if (existingAddress === 0) {
      await prisma.address.createMany({
        data: [
          {
            userId: customer.id,
            label: 'Home',
            recipientName: customer.name,
            phone: customer.phone,
            line1: '99 Sample Road, Bangkok',
            note: 'Leave at lobby',
            isDefault: true
          },
          {
            userId: customer.id,
            label: 'Office',
            recipientName: customer.name,
            phone: customer.phone,
            line1: '88 Business Park, Bangkok',
            note: 'Call when arrive',
            isDefault: false
          }
        ]
      });
    }
  }

  const categories = await prisma.menuCategory.createMany({
    data: [
      { name: 'Rice' },
      { name: 'Noodles' },
      { name: 'Drinks' }
    ],
    skipDuplicates: true
  });

  const existingCategories = await prisma.menuCategory.findMany();
  const rice = existingCategories.find(c => c.name === 'Rice');
  const noodles = existingCategories.find(c => c.name === 'Noodles');
  const drinks = existingCategories.find(c => c.name === 'Drinks');

  if (rice && noodles && drinks) {
    await prisma.menuItem.createMany({
      data: [
        {
          categoryId: rice.id,
          name: 'Chicken Rice',
          description: 'Steamed chicken with fragrant rice',
          price: 60,
          imageUrl: 'https://picsum.photos/seed/chicken-rice/600/400',
          isAvailable: true,
          isRecommended: true
        },
        {
          categoryId: rice.id,
          name: 'Pork Basil Rice',
          description: 'Spicy basil pork with rice',
          price: 55,
          imageUrl: 'https://picsum.photos/seed/basil/600/400',
          isAvailable: true,
          isRecommended: false
        },
        {
          categoryId: noodles.id,
          name: 'Tom Yum Noodles',
          description: 'Hot and sour noodles',
          price: 70,
          imageUrl: 'https://picsum.photos/seed/tomyum/600/400',
          isAvailable: true,
          isRecommended: true
        },
        {
          categoryId: drinks.id,
          name: 'Thai Milk Tea',
          description: 'Sweet and creamy tea',
          price: 35,
          imageUrl: 'https://picsum.photos/seed/thaitea/600/400',
          isAvailable: true,
          isRecommended: true
        }
      ],
      skipDuplicates: true
    });
  }

  await prisma.restaurantSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      deliveryFee: 0,
      openHours: '09:00 - 21:00',
      acceptCash: true,
      qrImageUrl: 'https://picsum.photos/seed/qr/600/400'
    }
  });

  await prisma.promotion.createMany({
    data: [
      {
        title: 'Weekend Promo',
        imageUrl: 'https://picsum.photos/seed/promo1/1000/400',
        isActive: true,
        sortOrder: 1
      },
      {
        title: 'Lunch Deal',
        imageUrl: 'https://picsum.photos/seed/promo2/1000/400',
        isActive: true,
        sortOrder: 2
      }
    ],
    skipDuplicates: true
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
