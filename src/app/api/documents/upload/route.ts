import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tasks } from '@trigger.dev/sdk/v3'

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
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
