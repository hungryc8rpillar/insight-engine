import { NextRequest, NextResponse } from 'next/server'
import { typesenseClient } from '@/lib/typesense'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    // Get search suggestions from Typesense - only search by title for now
    const suggestions = await typesenseClient.collections('documents').documents().search({
      q: query,
      query_by: 'title', // Only search by title for suggestions
      per_page: 5,
      sort_by: '_text_match:desc',
      group_by: 'title',
      group_limit: 1,
    })

    // Extract unique suggestions from results
    const uniqueSuggestions = suggestions.grouped_hits?.map((group: any) => {
      const hit = group.hits[0]
      return {
        text: hit.document.title,
        type: 'title',
        score: hit.text_match,
      }
    }) || []

    // Sort by relevance and limit results
    const sortedSuggestions = uniqueSuggestions
        .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
        .slice(0, 8)
        .map((s: { text: string }) => s.text)

    return NextResponse.json({ 
      suggestions: sortedSuggestions,
      query 
    })

  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get suggestions',
        suggestions: [],
        query 
      },
      { status: 500 }
    )
  }
} 