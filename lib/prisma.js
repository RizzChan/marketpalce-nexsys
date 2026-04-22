import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  })()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
