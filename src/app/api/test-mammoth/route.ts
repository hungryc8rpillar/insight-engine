import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    console.log('Testing mammoth with file:', file.name, file.size, file.type)
    
    const arrayBuffer = await file.arrayBuffer()
    console.log('ArrayBuffer size:', arrayBuffer.byteLength)
    
    const result = await mammoth.extractRawText({ buffer: arrayBuffer })
    
    return NextResponse.json({
      success: true,
      textLength: result.value.length,
      preview: result.value.substring(0, 200),
      messages: result.messages
    })
    
  } catch (error) {
    console.error('Mammoth test error:', error)
    return NextResponse.json({
      error: 'Mammoth test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 