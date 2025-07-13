import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tasks } from '@trigger.dev/sdk/v3'
import mammoth from 'mammoth'

// Prevent pre-rendering during build
export const dynamic = 'force-dynamic'

// Helper function to extract text from different file types
async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase()
  console.log(`Processing file: ${fileName}, size: ${file.size} bytes, type: ${file.type}`)
  
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    // Handle Word documents
    try {
      console.log('Processing Word document...')
      
      // Try to get the file as a buffer first
      let arrayBuffer: ArrayBuffer
      
      try {
        arrayBuffer = await file.arrayBuffer()
        console.log('ArrayBuffer size:', arrayBuffer.byteLength)
      } catch (bufferError) {
        console.error('Failed to get ArrayBuffer:', bufferError)
        throw new Error('Failed to read file data')
      }
      
      // Validate the buffer
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('File appears to be empty')
      }
      
      const result = await mammoth.extractRawText({ buffer: arrayBuffer })
      console.log('Mammoth extraction successful, text length:', result.value.length)
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('Extracted text is empty')
      }
      
      return result.value
    } catch (mammothError) {
      console.error('Mammoth extraction error:', mammothError)
      
      // Provide more specific error information
      if (mammothError instanceof Error) {
        if (mammothError.message.includes('Invalid file format')) {
          throw new Error('The file is not a valid Word document format')
        } else if (mammothError.message.includes('Empty file')) {
          throw new Error('The Word document appears to be empty')
        } else {
          throw new Error(`Word document processing failed: ${mammothError.message}`)
        }
      } else {
        throw new Error('Word document processing failed: Unknown error')
      }
    }
  } else {
    // Handle text-based files (txt, md, json)
    console.log('Processing text file...')
    const text = await file.text()
    console.log('Text file content length:', text.length)
    return text
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || file.name
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Extract text content based on file type
    let content: string
    try {
      content = await extractTextFromFile(file)
    } catch (extractError) {
      console.error('Error extracting text from file:', extractError)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to extract text from file. Please ensure the file is not corrupted and is in a supported format.'
      let details = extractError instanceof Error ? extractError.message : 'Unknown extraction error'
      
      if (details.includes('Word document processing failed')) {
        errorMessage = 'Failed to process Word document. The file might be corrupted or in an unsupported format.'
      } else if (details.includes('Extracted text is empty')) {
        errorMessage = 'The Word document appears to be empty or contains no readable text.'
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: details,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }, { status: 400 })
    }
    
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
          fileType: file.name.split('.').pop()?.toLowerCase(),
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
