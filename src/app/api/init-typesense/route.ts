import { NextRequest, NextResponse } from 'next/server'
import { initializeTypesenseCollection, recreateTypesenseCollection } from '@/lib/init-typesense'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'recreate') {
      const success = await recreateTypesenseCollection()
      return NextResponse.json({ 
        success, 
        message: success ? 'Collection recreated successfully' : 'Failed to recreate collection' 
      })
    } else {
      const success = await initializeTypesenseCollection()
      return NextResponse.json({ 
        success, 
        message: success ? 'Collection initialized successfully' : 'Collection needs to be recreated' 
      })
    }
  } catch (error) {
    console.error('Typesense initialization error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 