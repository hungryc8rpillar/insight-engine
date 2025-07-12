import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { prisma } from '@/lib/prisma'
import { typesenseClient } from '@/lib/typesense'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatRequest {
  message: string
  documentId?: string
  conversationId?: string
  searchQuery?: string
  conversationHistory?: ChatMessage[]
}

// In-memory conversation storage (in production, use Redis or database)
const conversationStore = new Map<string, ChatMessage[]>()

export async function POST(request: NextRequest) {
  try {
    const { message, documentId, conversationId, searchQuery, conversationHistory }: ChatRequest = await request.json()

    if (!message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Use provided conversation history or get from store
    let messages: ChatMessage[] = []
    if (conversationHistory) {
      messages = conversationHistory
    } else if (conversationId && conversationStore.has(conversationId)) {
      messages = conversationStore.get(conversationId) || []
    }

    let context = ''
    let documentTitle = ''

    // If a specific document is provided, get its content
    if (documentId) {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { title: true, content: true }
      })
      
      if (document) {
        context = `Document: "${document.title}"\n\nContent:\n${document.content.substring(0, 3000)}...`
        documentTitle = document.title
      }
    }
    // If a search query is provided, search for relevant documents
    else if (searchQuery) {
      try {
        const searchResults = await typesenseClient.collections('documents').documents().search({
          q: searchQuery,
          query_by: 'title,content',
          per_page: 3,
          sort_by: '_text_match:desc',
        })

        if (searchResults.hits && searchResults.hits.length > 0) {
          const relevantDocs = searchResults.hits.map((hit: any) => ({
            title: hit.document.title,
            content: hit.document.content.substring(0, 1000),
            score: hit.text_match
          }))

          context = `Relevant documents based on search "${searchQuery}":\n\n` +
            relevantDocs.map((doc, index) => 
              `${index + 1}. "${doc.title}" (relevance: ${Math.round(doc.score * 100)}%)\n${doc.content}...`
            ).join('\n\n')
        }
      } catch (error) {
        console.error('Search error in chat:', error)
        // Continue without search context
      }
    }

    // Build the system prompt
    const systemPrompt = `You are a helpful AI assistant that can answer questions about documents. 

${context ? `Here is the context from the documents:\n\n${context}\n\n` : ''}

Instructions:
- Answer questions based on the provided document context
- If asked about specific documents, refer to them by title
- If no relevant context is provided, say you don't have information about that topic
- Be helpful, accurate, and concise
- If you're not sure about something, say so rather than guessing
- You can ask clarifying questions if needed
- Remember the conversation context and refer back to previous messages when relevant

${documentTitle ? `You are currently discussing the document: "${documentTitle}"` : ''}

${messages.length > 0 ? `This is an ongoing conversation. Please maintain context and refer to previous messages when relevant.` : ''}`

    // Prepare messages for OpenAI
    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ]

    // Create the chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      max_tokens: 1000,
      temperature: 0.7,
    })

    const assistantMessage = completion.choices[0].message.content

    // Add new messages to conversation history
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    const newAssistantMessage: ChatMessage = {
      role: 'assistant',
      content: assistantMessage || 'No response from AI',
      timestamp: new Date()
    }

    const updatedMessages = [...messages, newUserMessage, newAssistantMessage]

    // Store conversation in memory (in production, use database)
    if (conversationId && conversationId.trim()) {
      conversationStore.set(conversationId, updatedMessages)
      
      // Limit conversation history to last 20 messages to prevent token limits
      if (updatedMessages.length > 20) {
        const limitedMessages = updatedMessages.slice(-20)
        conversationStore.set(conversationId, limitedMessages)
      }
    }

    // Log the conversation for analytics
    await prisma.searchQuery.create({
      data: {
        query: `Chat: ${message}`,
        results: {
          conversationId,
          documentId,
          searchQuery,
          response: assistantMessage,
          timestamp: new Date().toISOString(),
          messageCount: updatedMessages.length,
        },
        userId: 'demo-user',
      }
    })

    return NextResponse.json({
      message: assistantMessage,
      context: context ? 'Document context provided' : 'No specific context',
      documentTitle: documentTitle || null,
      conversationId: conversationId || null,
      messageCount: updatedMessages.length,
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { 
        error: 'Chat failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 