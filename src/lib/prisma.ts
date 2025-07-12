import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Handle different database URL formats for Vercel
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  
  // If it's already a Prisma URL, return as is
  if (url.startsWith('prisma://') || url.startsWith('prisma+postgres://')) {
    return url
  }
  
  // Convert regular PostgreSQL URL to Prisma format if needed
  if (url.startsWith('postgresql://')) {
    return url
  }
  
  return url
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
