import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tasks } from '@trigger.dev/sdk/v3'

// Prevent pre-rendering during build
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || file.name
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file content
    const content = await file.text()
    
    // Test database connection first
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json({
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set',
      }, { status: 500 })
    }
    
    // Create document record in database
    const document = await prisma.document.create({
      data: {
        title,
        content,
        filePath: file.name,
        userId: 'demo-user', // Replace with actual user ID when auth is implemented
        searchable: false, // Will be set to true after processing
      }
    })

    try {
      // Trigger background processing job
      const handle = await tasks.trigger(
        "process-document",
        {
          documentId: document.id,
          title: document.title,
          content: document.content,
        }
      )

      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          title: document.title,
          uploadedAt: document.uploadedAt,
        },
        jobId: handle.id,
      })
    } catch (triggerError) {
      console.error('Trigger.dev error:', triggerError)
      
      // If Trigger.dev fails, still return success but without job ID
      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          title: document.title,
          uploadedAt: document.uploadedAt,
        },
        error: 'Document uploaded but background processing failed. Please check Trigger.dev configuration.',
        triggerError: triggerError instanceof Error ? triggerError.message : 'Unknown trigger error'
      })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
