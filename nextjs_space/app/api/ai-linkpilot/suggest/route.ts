
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

    // Get user's bookmarks for context
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
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
      orderBy: { totalVisits: 'desc' },
      take: 50,
    })

    // Prepare context for AI
    const bookmarkContext = bookmarks
      .map(
        (b: any) => {
          const categoryNames = b.categories?.map((c: any) => c.category.name).join(', ') || 'Uncategorized'
          const tagNames = b.tags?.map((t: any) => t.tag.name).join(', ') || 'None'
          return `- ${b.title} (${categoryNames}): ${b.description || 'No description'} [Tags: ${tagNames}]`
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
            content: `You are an AI bookmark assistant. Based on the user's bookmarks and their query, provide intelligent suggestions for bookmark collections, related resources, or organizational improvements.

Please respond in JSON format with the following structure:
{
  "suggestions": [
    {
      "title": "Collection title",
      "description": "What this collection is about",
      "bookmarks": ["bookmark_id1", "bookmark_id2"],
      "category": "Category name",
      "reasoning": "Why this suggestion makes sense"
    }
  ]
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`,
          },
          {
            role: 'user',
            content: `User Query: ${query}

User's Bookmarks:
${bookmarkContext}

Please analyze the bookmarks and provide intelligent suggestions based on the query.`,
          },
        ],
        response_format: { type: 'json_object' },
        stream: true,
        max_tokens: 2000,
      }),
    })

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let buffer = ''
        let partialRead = ''

        try {
          while (true) {
            const { done, value } = await reader!.read()
            if (done) break

            partialRead += decoder.decode(value, { stream: true })
            let lines = partialRead.split('\n')
            partialRead = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  try {
                    const finalResult = JSON.parse(buffer)
                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: finalResult,
                    })
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
                  } catch (e) {
                    console.error('Error parsing final result:', e)
                    const errorData = JSON.stringify({
                      status: 'error',
                      message: 'Failed to parse AI response',
                    })
                    controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
                  }
                  return
                }
                try {
                  const parsed = JSON.parse(data)
                  buffer += parsed.choices?.[0]?.delta?.content || ''
                  const progressData = JSON.stringify({
                    status: 'processing',
                    message: 'Analyzing bookmarks...',
                  })
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`))
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
          const errorData = JSON.stringify({
            status: 'error',
            message: 'Stream processing failed',
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI suggest error:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
