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
  
  // For Vercel deployment, we need to handle the URL format
  if (process.env.NODE_ENV === 'production' && url.startsWith('postgresql://')) {
    // In production, Vercel expects prisma:// format
    // But we'll use the direct URL for now
    return url
  }
  
  return url
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
