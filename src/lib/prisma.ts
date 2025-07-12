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
  
  // For Vercel deployment with Supabase, we need to handle connection pooling
  if (process.env.NODE_ENV === 'production' && url.includes('supabase.co')) {
    // Use the direct URL for production to avoid connection pooling issues
    const directUrl = process.env.DIRECT_URL
    if (directUrl) {
      return directUrl
    }
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
