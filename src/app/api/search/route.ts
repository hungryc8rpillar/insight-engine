import { NextRequest, NextResponse } from 'next/server'
import { typesenseClient } from '@/lib/typesense'
import { prisma } from '@/lib/prisma'

// Prevent pre-rendering during build
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ 
      results: [], 
      total: 0, 
      page, 
      limit,
      query: ''
    })
  }

  try {
    // Search in Typesense - only search by fields that definitely exist
    const searchResults = await typesenseClient.collections('documents').documents().search({
      q: query,
      query_by: 'title,content', // Only search by title and content for now
      sort_by: '_text_match:desc,uploadedAt:desc',
      per_page: limit,
      page: page - 1, // Typesense uses 0-based pagination
      highlight_full_fields: 'title,content',
      snippet_threshold: 1,
      num_typos: 2, // Allow 2 typos for better search experience
    })

    // Log search query for analytics
    await prisma.searchQuery.create({
      data: {
        query: query,
        results: {
          found: searchResults.found,
          hits: searchResults.hits?.length || 0,
          query: query,
          searchTime: Date.now(),
        },
        userId: 'demo-user', // Replace with actual user ID when auth is implemented
      }
    })

    // Format results
    const formattedResults = searchResults.hits?.map((hit: any) => ({
      id: hit.document.id,
      title: hit.document.title,
      content: hit.document.content,
      summary: hit.document.summary || '', // Handle missing field
      keywords: hit.document.keywords || '', // Handle missing field
      uploadedAt: new Date(hit.document.uploadedAt),
      textMatch: hit.text_match,
      highlights: hit.highlights,
      snippet: hit.snippet,
    })) || []

    return NextResponse.json({
      results: formattedResults,
      total: searchResults.found || 0,
      page,
      limit,
      query,
      facets: searchResults.facet_counts,
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        total: 0,
        page,
        limit,
        query
      },
      { status: 500 }
    )
  }
} 