
import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { query } = await request.json()

    // Get all user bookmarks
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        totalVisits: true,
        timeSpent: true,
        favicon: true,
        createdAt: true,
        categories: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    // Prepare bookmarks for AI
    const bookmarkList = bookmarks
      .map(
        (b: any) => {
          const categoryNames = b.categories?.map((c: any) => c.category.name).join(', ') || 'None'
          const tagNames = b.tags?.map((t: any) => t.tag.name).join(', ') || 'None'
          return `ID: ${b.id} | Title: ${b.title} | URL: ${b.url} | Categories: ${categoryNames} | Tags: ${tagNames} | Description: ${b.description || 'None'}`
        }
      )
      .join('\n')

    // Call AI API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI bookmark search assistant. Based on the user's natural language query, find and rank the most relevant bookmarks.

Please respond in JSON format with the following structure:
{
  "results": [
    {
      "bookmarkId": "bookmark_id",
      "relevanceScore": 0.95,
      "reasoning": "Why this bookmark matches the query"
    }
  ],
  "summary": "Brief explanation of the search results"
}

- Only include bookmarks with relevance score > 0.5
- Rank by relevance score (highest first)
- Provide clear reasoning for each result

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`,
          },
          {
            role: 'user',
            content: `Search Query: ${query}

Available Bookmarks:
${bookmarkList}

Find the most relevant bookmarks for this query.`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      }),
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)

    // Get full bookmark details for results
    const resultBookmarkIds = result.results?.map((r: any) => r.bookmarkId) || []
    const fullBookmarks = await prisma.bookmark.findMany({
      where: {
        id: { in: resultBookmarkIds },
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        favicon: true,
        totalVisits: true,
        timeSpent: true,
        categories: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    // Combine AI results with full bookmark data
    const enrichedResults = result.results?.map((r: any) => {
      const bookmark = fullBookmarks.find((b: any) => b.id === r.bookmarkId)
      if (!bookmark) return null
      
      // Extract category and tag names
      const category = bookmark.categories?.[0]?.category?.name || null
      const tags = bookmark.tags?.map((t: any) => t.tag.name) || []
      
      return {
        ...bookmark,
        category,
        tags,
        relevanceScore: r.relevanceScore,
        reasoning: r.reasoning,
      }
    }).filter(Boolean)

    return NextResponse.json({
      results: enrichedResults || [],
      summary: result.summary || 'Search completed',
      count: enrichedResults?.length || 0,
    })
  } catch (error) {
    console.error('Smart search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform smart search' },
      { status: 500 }
    )
  }
}
