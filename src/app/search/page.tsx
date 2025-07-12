'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, Clock, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  content: string
  summary: string
  keywords: string
  uploadedAt: Date
  textMatch: number
  highlights: any[]
  snippet: string
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  limit: number
  query: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const performSearch = async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) {
      setResults([])
      setTotal(0)
      setSearchPerformed(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=10`)
      const data: SearchResponse = await response.json()
      
      setResults(data.results)
      setTotal(data.total)
      setCurrentPage(page)
      setSearchPerformed(true)
      
      // Update URL
      const newUrl = `/search?q=${encodeURIComponent(searchQuery)}`
      router.push(newUrl, { scroll: false })
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // Handle search on mount if query exists
  useEffect(() => {
    const initialQuery = searchParams.get('q')
    if (initialQuery) {
      setQuery(initialQuery)
      performSearch(initialQuery)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      performSearch(query)
      setShowSuggestions(false)
    }
  }

  const getSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setSuggestions(data.suggestions || [])
      setShowSuggestions(data.suggestions && data.suggestions.length > 0)
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    getSuggestions(value)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    performSearch(suggestion)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const highlightText = (text: string, highlights: any[]) => {
    if (!highlights || highlights.length === 0) return text
    
    let highlightedText = text
    highlights.forEach((highlight: any) => {
      const regex = new RegExp(`(${highlight.snippet})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
    })
    
    return highlightedText
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/documents">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Documents
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Search Documents</h1>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-20" />
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search your documents..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 mt-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" disabled={loading} className="px-6">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Results */}
        {searchPerformed && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                {loading ? 'Searching...' : `${total} result${total !== 1 ? 's' : ''} found`}
              </p>
              {total > 0 && (
                <Badge variant="secondary">
                  Page {currentPage} of {Math.ceil(total / 10)}
                </Badge>
              )}
            </div>

            {!loading && total === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search terms or check if your documents have been processed.
                  </p>
                  <Link href="/documents">
                    <Button variant="outline">View All Documents</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-4">
                {results.map((result) => (
                  <Card key={result.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          <Link 
                            href={`/chat?doc=${result.id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {result.title}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(result.textMatch * 100)}% match
                          </Badge>
                          <Link href={`/chat?doc=${result.id}`}>
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              Chat
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(result.uploadedAt)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {result.summary && (
                        <p className="text-gray-700 mb-3 text-sm">
                          <strong>Summary:</strong> {result.summary}
                        </p>
                      )}
                      
                      {result.keywords && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Keywords:</strong>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {result.keywords.split(', ').map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div 
                        className="text-gray-600 text-sm"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(truncateContent(result.content), result.highlights)
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && total > 10 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => performSearch(query, currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(total / 10)}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= Math.ceil(total / 10)}
                  onClick={() => performSearch(query, currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Search Tips */}
        {!searchPerformed && !loading && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                💡 Search Tips
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Search by document title, content, or keywords</li>
                <li>• Use quotes for exact phrase matching</li>
                <li>• Try different keywords if no results appear</li>
                <li>• Make sure your documents have been processed (check the documents page)</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
} 