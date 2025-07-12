import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Prevent pre-rendering during build
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test basic connection
    await prisma.$connect()
    
    // Test a simple query
    const documentCount = await prisma.document.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      documentCount,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set',
    })
  } catch (error) {
    console.error('Database test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set',
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 