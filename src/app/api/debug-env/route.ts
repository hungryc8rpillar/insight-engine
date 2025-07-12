import { NextResponse } from 'next/server'

// Prevent pre-rendering during build
export const dynamic = 'force-dynamic'

export async function GET() {
  const envInfo = {
    // Database
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    DIRECT_URL: process.env.DIRECT_URL ? 'Set' : 'Not set',
    
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
    
    // Typesense
    TYPESENSE_HOST: process.env.TYPESENSE_HOST ? 'Set' : 'Not set',
    TYPESENSE_PORT: process.env.TYPESENSE_PORT ? 'Set' : 'Not set',
    TYPESENSE_PROTOCOL: process.env.TYPESENSE_PROTOCOL ? 'Set' : 'Not set',
    TYPESENSE_API_KEY: process.env.TYPESENSE_API_KEY ? 'Set' : 'Not set',
    
    // OpenAI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set',
    
    // Trigger.dev
    TRIGGER_API_KEY: process.env.TRIGGER_API_KEY ? 'Set' : 'Not set',
    TRIGGER_PROJECT_ID: process.env.TRIGGER_PROJECT_ID ? 'Set' : 'Not set',
    NEXT_PUBLIC_TRIGGER_API_URL: process.env.NEXT_PUBLIC_TRIGGER_API_URL ? 'Set' : 'Not set',
    
    // Environment
    NODE_ENV: process.env.NODE_ENV || 'Not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'Not set',
  }

  return NextResponse.json({
    success: true,
    environment: envInfo,
    timestamp: new Date().toISOString(),
  })
} 