import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Prevent pre-rendering during build
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        title: true,
        uploadedAt: true,
        searchable: true,
      }
    })

    return NextResponse.json({
      documents,
      total: documents.length,
    })

  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch documents',
        documents: [],
        total: 0
      },
      { status: 500 }
    )
  }
} 