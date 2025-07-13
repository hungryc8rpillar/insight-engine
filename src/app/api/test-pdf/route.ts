import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    console.log('Testing PDF processing with file:', file.name, file.size, file.type)
    
    const arrayBuffer = await file.arrayBuffer()
    console.log('ArrayBuffer size:', arrayBuffer.byteLength)
    
    const buffer = Buffer.from(arrayBuffer)
    const result = await pdf(buffer)
    
    return NextResponse.json({
      success: true,
      textLength: result.text.length,
      numPages: result.numpages,
      preview: result.text.substring(0, 200),
      info: result.info,
      metadata: result.metadata,
      version: result.version
    })
    
  } catch (error) {
    console.error('PDF test error:', error)
    return NextResponse.json({
      error: 'PDF test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 