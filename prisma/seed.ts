import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@marketplace.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@marketplace.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin created: admin@marketplace.com')

  const customerPassword = await bcrypt.hash('customer123', 10)
  await prisma.user.upsert({
    where: { email: 'customer@marketplace.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'customer@marketplace.com',
      password: customerPassword,
      phone: '081234567890',
      role: 'CUSTOMER',
    },
  })
  console.log('✅ Customer created: customer@marketplace.com')

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Gadgets dan elektronik',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'fashion' },
      update: {},
      create: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Pakaian dan aksesoris',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-living' },
      update: {},
      create: {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Perlengkapan rumah',
      },
    }),
  ])
  console.log('✅ Categories created:', categories.length)

  await Promise.all([
    prisma.product.upsert({
      where: { slug: 'wireless-earbuds-pro' },
      update: {},
      create: {
        name: 'Wireless Earbuds Pro',
        slug: 'wireless-earbuds-pro',
        description: 'Earbuds wireless berkualitas tinggi dengan noise cancelling.',
        price: 299000,
        stock: 50,
        images: ['https://placehold.co/400x400/1a1a2e/white?text=Earbuds'],
        weight: 200,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'mechanical-keyboard' },
      update: {},
      create: {
        name: 'Mechanical Keyboard TKL',
        slug: 'mechanical-keyboard',
        description: 'Keyboard mekanikal tenkeyless dengan switch blue.',
        price: 450000,
        stock: 30,
        images: ['https://placehold.co/400x400/16213e/white?text=Keyboard'],
        weight: 800,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'kaos-polos-premium' },
      update: {},
      create: {
        name: 'Kaos Polos Premium',
        slug: 'kaos-polos-premium',
        description: 'Kaos polos bahan cotton combed 30s.',
        price: 85000,
        stock: 100,
        images: ['https://placehold.co/400x400/0f3460/white?text=Kaos'],
        weight: 250,
        categoryId: categories[1].id,
      },
    }),
  ])
  console.log('✅ Products created: 3')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
