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
  
  // For Vercel deployment, prioritize DIRECT_URL
  if (process.env.NODE_ENV === 'production') {
    const directUrl = process.env.DIRECT_URL
    if (directUrl) {
      console.log('Using DIRECT_URL for production connection')
      return directUrl
    }
  }
  
  return url
}

// Create Prisma client with optimized settings for Vercel
const createPrismaClient = () => {
  const databaseUrl = getDatabaseUrl()
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

// Add connection retry logic for serverless
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // If it's a connection error and we have retries left, try again
      if (i < maxRetries - 1 && (
        errorMessage.includes("Can't reach database server") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("ECONNREFUSED")
      )) {
        console.log(`Database connection attempt ${i + 1} failed, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))) // Exponential backoff
        continue
      }
      
      throw error
    }
  }
  
  throw new Error('Max retries exceeded')
}

// Initialize connection on module load for serverless
if (process.env.NODE_ENV === 'production') {
  // Warm up the connection
  prisma.$connect().catch(console.error)
}
