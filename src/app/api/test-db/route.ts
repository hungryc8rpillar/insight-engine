import { NextResponse } from 'next/server'
import { prisma, withRetry } from '@/lib/prisma'

// Prevent pre-rendering during build
export const dynamic = 'force-dynamic'

async function testDirectConnection() {
  try {
    // Try to import and use the postgres driver directly
    const { Client } = await import('pg')
    
    const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL
    if (!databaseUrl) {
      return { success: false, error: 'No database URL available' }
    }
    
    const client = new Client({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
    
    await client.connect()
    const result = await client.query('SELECT NOW() as current_time')
    await client.end()
    
    return { success: true, currentTime: result.rows[0].current_time }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function GET() {
  try {
    // Test direct connection first
    const directConnection = await testDirectConnection()
    
    // Test Prisma connection with retry logic
    const documentCount = await withRetry(async () => {
      await prisma.$connect()
      return await prisma.document.count()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      documentCount,
      directConnection,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV || 'Not set',
      vercelEnv: process.env.VERCEL_ENV || 'Not set',
    })
  } catch (error) {
    console.error('Database test error:', error)
    
    // Test direct connection even if Prisma fails
    const directConnection = await testDirectConnection()
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isConnectionError = errorMessage.includes("Can't reach database server") || 
                             errorMessage.includes("connection") ||
                             errorMessage.includes("timeout")
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      isConnectionError,
      directConnection,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV || 'Not set',
      vercelEnv: process.env.VERCEL_ENV || 'Not set',
      suggestions: isConnectionError ? [
        'Check if DATABASE_URL and DIRECT_URL are set correctly in Vercel',
        'Verify Supabase database is not paused',
        'Check if Supabase allows connections from Vercel IPs',
        'Try using Prisma Accelerate for better serverless performance',
        'Ensure both DATABASE_URL and DIRECT_URL have the same value in Vercel'
      ] : []
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 