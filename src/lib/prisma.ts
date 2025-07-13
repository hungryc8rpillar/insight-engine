import { PrismaClient } from '@prisma/client'

// Global variable to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  
  // Always use DATABASE_URL (pooler) for regular operations
  // DIRECT_URL is only used internally by Prisma for migrations
  console.log('Using DATABASE_URL for connection')
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

// Add connection retry logic for serverless with better error handling
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Connection-related errors that should be retried
      const isRetryableError = 
        errorMessage.includes("Can't reach database server") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ETIMEDOUT") ||
        errorMessage.includes("connection terminated unexpectedly")
      
      // If it's a connection error and we have retries left, try again
      if (i < maxRetries - 1 && isRetryableError) {
        console.log(`Database connection attempt ${i + 1} failed, retrying in ${1000 * (i + 1)}ms...`)
        console.log(`Error: ${errorMessage}`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))) // Exponential backoff
        continue
      }
      
      // Log final error for debugging
      if (i === maxRetries - 1) {
        console.error(`Database connection failed after ${maxRetries} attempts:`, errorMessage)
      }
      
      throw error
    }
  }
  
  throw new Error('Max retries exceeded')
}

// Connection warming for serverless - but don't block startup
if (process.env.NODE_ENV === 'production') {
  // Warm up the connection in the background
  prisma.$connect()
    .then(() => console.log('Database connection warmed up'))
    .catch(err => console.error('Failed to warm up database connection:', err.message))
}
