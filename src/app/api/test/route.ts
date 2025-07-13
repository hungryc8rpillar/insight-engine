import { NextRequest, NextResponse } from 'next/server'
import { prisma, withRetry } from '@/lib/prisma'
import { typesenseClient, initializeTypesenseCollection } from '@/lib/typesense'

// Prevent pre-rendering during build
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const results: any = {
    success: false,
    services: {}
  }

  try {
    // Add environment variable logging
    console.log('=== PRISMA CONNECTION DEBUG ===')
    console.log('DATABASE_URL (first 50 chars):', process.env.DATABASE_URL?.substring(0, 50) + '...')
    console.log('DIRECT_URL (first 50 chars):', process.env.DIRECT_URL?.substring(0, 50) + '...')
    console.log('DATABASE_URL contains pooler:', process.env.DATABASE_URL?.includes('pooler'))
    console.log('DATABASE_URL port:', process.env.DATABASE_URL?.match(/:(\d+)/)?.[1])
    console.log('DIRECT_URL port:', process.env.DIRECT_URL?.match(/:(\d+)/)?.[1])
    
    // Test Prisma connection with retry logic
    try {
      console.log('Attempting Prisma connection...')
      const documentCount = await withRetry(async () => {
        return await prisma.document.count()
      })
      console.log('Prisma connection successful, document count:', documentCount)
      results.services.prisma = { connected: true, documentCount }
    } catch (error) {
      console.error('Prisma connection failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const isConnectionError = errorMessage.includes("Can't reach database server") || 
                               errorMessage.includes("connection") ||
                               errorMessage.includes("timeout")
      
      results.services.prisma = { 
        connected: false, 
        error: errorMessage,
        isConnectionError,
        suggestions: isConnectionError ? [
          'Check if DATABASE_URL and DIRECT_URL are set correctly in Vercel',
          'Verify Supabase database is not paused',
          'Check if Supabase allows connections from Vercel IPs',
          'Try using Prisma Accelerate for better serverless performance',
          'Ensure DATABASE_URL uses pooler (port 6543) and DIRECT_URL uses direct (port 5432)'
        ] : []
      }
    }

    // Test Supabase connection (only if env vars are set)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        // Simple test - just check if we can connect
        const { error } = await supabase.from('documents').select('count', { count: 'exact', head: true })
        results.services.supabase = { connected: !error, error: error?.message }
      } else {
        results.services.supabase = { 
          connected: false, 
          error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY' 
        }
      }
    } catch (error) {
      results.services.supabase = { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }

    // Test Typesense connection
    try {
      await initializeTypesenseCollection()
      const typesenseHealth = await typesenseClient.health.retrieve()
      results.services.typesense = { connected: true, health: typesenseHealth }
    } catch (error) {
      results.services.typesense = { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }

    // Check if at least one service is working
    const hasWorkingService = Object.values(results.services).some((service: any) => service.connected)
    results.success = hasWorkingService

    return NextResponse.json(results)
  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      services: results.services
    }, { status: 500 })
  }
}
