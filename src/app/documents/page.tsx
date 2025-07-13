import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Search, MessageSquare, FileText, Clock, CheckCircle, AlertCircle, File, FileText as FileTextIcon } from 'lucide-react'

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic'

interface Document {
  id: string
  title: string
  content: string
  uploadedAt: Date
  searchable: boolean
  typesenseId: string | null
  filePath?: string | null
}

// Helper function to get file type and icon
function getFileTypeInfo(filePath: string | null | undefined) {
  if (!filePath) return { type: 'unknown', icon: File, label: 'Unknown' }
  
  const extension = filePath.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'docx':
    case 'doc':
      return { type: 'word', icon: FileTextIcon, label: 'Word Document' }
    case 'txt':
      return { type: 'text', icon: FileText, label: 'Text File' }
    case 'md':
      return { type: 'markdown', icon: FileText, label: 'Markdown' }
    case 'json':
      return { type: 'json', icon: FileText, label: 'JSON File' }
    default:
      return { type: 'unknown', icon: File, label: 'Unknown' }
  }
}

export default async function DocumentsPage() {
  let documents: Document[] = []
  let error: string | null = null
  
  try {
    // Test database connection first
    await prisma.$connect()
    
    documents = await prisma.document.findMany({
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        uploadedAt: true,
        searchable: true,
        typesenseId: true,
        filePath: true,
      }
    })
  } catch (dbError) {
    console.error('Database error in documents page:', dbError)
    error = dbError instanceof Error ? dbError.message : 'Unknown database error'
  } finally {
    await prisma.$disconnect()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Database Connection Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Please check your DATABASE_URL and DIRECT_URL environment variables in Vercel.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Documents
            </h1>
            <p className="text-gray-600">
              {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/search">
              <Button variant="outline" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </Button>
            </Link>
          </div>
        </div>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents yet
              </h3>
              <p className="text-gray-600 mb-4">
                Upload your first document to get started
              </p>
              <Link href="/">
                <Button>Upload Document</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => {
              const fileTypeInfo = getFileTypeInfo(document.filePath)
              const FileIcon = fileTypeInfo.icon
              
              return (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">
                        {document.title}
                      </CardTitle>
                      <Badge 
                        variant={document.searchable ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {document.searchable ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Ready
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Processing
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(document.uploadedAt)}
                      </div>
                      <div className="flex items-center">
                        <FileIcon className="w-4 h-4 mr-1" />
                        {fileTypeInfo.label}
                      </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {truncateContent(document.content)}
                  </p>
                  
                  <div className="flex gap-2">
                    {document.searchable && (
                      <>
                        <Link href={`/search?q=${encodeURIComponent(document.title)}`}>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Search className="w-3 h-3" />
                            Search
                          </Button>
                        </Link>
                        <Link href={`/chat?doc=${document.id}`}>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Chat
                          </Button>
                        </Link>
                      </>
                    )}
                    {!document.searchable && (
                      <div className="flex items-center text-sm text-gray-500">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Processing...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
            })}
          </div>
        )}

        {/* Stats */}
        {documents.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Documents</p>
                    <p className="text-2xl font-bold">{documents.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ready for Search</p>
                    <p className="text-2xl font-bold">
                      {documents.filter(d => d.searchable).length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processing</p>
                    <p className="text-2xl font-bold">
                      {documents.filter(d => !d.searchable).length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
} 