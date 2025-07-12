'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  ArrowLeft, 
  FileText, 
  Search, 
  MessageSquare, 
  Loader2,
  Bot,
  User
} from 'lucide-react'
import Link from 'next/link'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  context?: string
  documentTitle?: string
}

interface Document {
  id: string
  title: string
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get document ID from URL if provided
  const documentId = searchParams.get('doc')

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load documents and current document info
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch('/api/documents')
        const data = await response.json()
        setDocuments(data.documents || [])
        
        if (documentId) {
          const doc = data.documents?.find((d: Document) => d.id === documentId)
          if (doc) {
            setCurrentDocument(doc)
            // Add initial message about the document
            setMessages([{
              id: 'initial',
              role: 'assistant',
              content: `Hello! I'm ready to help you with the document "${doc.title}". You can ask me questions about its content, request summaries, or discuss specific topics from it. What would you like to know?`,
              timestamp: new Date(),
              documentTitle: doc.title
            }])
          }
        }
      } catch (error) {
        console.error('Failed to load documents:', error)
      }
    }

    loadDocuments()
  }, [documentId])

  const sendMessage = async (message: string) => {
    if (!message.trim() || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      // Create a unique conversation ID based on document and session
      const conversationId = currentDocument 
        ? `doc-${currentDocument.id}-${Date.now()}`
        : `general-${Date.now()}`

      // Send conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          documentId: currentDocument?.id,
          conversationId,
          conversationHistory,
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        context: data.context,
        documentTitle: data.documentTitle
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getSuggestedQuestions = () => {
    if (currentDocument) {
      return [
        `What are the main topics discussed in "${currentDocument.title}"?`,
        `Can you summarize the key points from this document?`,
        `What are the most important details in this document?`,
        `Are there any specific recommendations or conclusions?`
      ]
    }
    return [
      'What documents do you have about [topic]?',
      'Can you help me find information about [subject]?',
      'What are the main themes across your documents?',
      'Which documents are most relevant to [query]?'
    ]
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/documents">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Chat</h1>
                {currentDocument && (
                  <p className="text-sm text-gray-600">
                    Chatting about: <span className="font-medium">{currentDocument.title}</span>
                  </p>
                )}
              </div>
            </div>
            
            {currentDocument && (
              <Link href={`/search?q=${encodeURIComponent(currentDocument.title)}`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !currentDocument && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-600 mb-6">
                  Ask questions about your documents or start a conversation about a specific document.
                </p>
                
                {/* Document Selection */}
                {documents.length > 0 && (
                  <div className="max-w-md mx-auto">
                    <h4 className="font-medium text-gray-900 mb-3">Chat about a specific document:</h4>
                    <div className="space-y-2">
                      {documents.slice(0, 5).map((doc) => (
                        <Link key={doc.id} href={`/chat?doc=${doc.id}`}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{doc.title}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Message List */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    
                    <div className={`rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                        {message.context && (
                          <span className="ml-2">
                            • {message.context}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 0 && currentDocument && (
            <div className="px-6 pb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested questions:</h4>
              <div className="flex flex-wrap gap-2">
                {getSuggestedQuestions().map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="border-t bg-white p-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={currentDocument 
                    ? `Ask about "${currentDocument.title}"...` 
                    : "Ask about your documents..."
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !inputMessage.trim()}
                className="px-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
} 