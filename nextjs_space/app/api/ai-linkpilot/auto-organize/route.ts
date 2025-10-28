
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all bookmarks with their categories and tags
    const allBookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      take: 30,
    })

    // Filter bookmarks that need organization (no categories or no tags)
    const bookmarks = allBookmarks.filter(
      (b: typeof allBookmarks[0]) => b.categories.length === 0 || b.tags.length === 0
    )

    if (bookmarks.length === 0) {
      return NextResponse.json({
        message: 'All bookmarks are already organized!',
        organized: 0,
      })
    }

    // Get existing categories for consistency
    const existingCategories = await prisma.category.findMany({
      where: { userId: user.id },
      select: { name: true },
    })

    const categoryList = existingCategories
      .map((c: any) => c.name)
      .filter(Boolean)
      .join(', ')

    // Get existing tags
    const existingTags = await prisma.tag.findMany({
      where: { userId: user.id },
      select: { name: true },
    })

    const tagList = existingTags
      .map((t: any) => t.name)
      .filter(Boolean)
      .join(', ')

    // Prepare bookmarks for AI
    const bookmarkList = bookmarks
      .map((b: any) => {
        const currentCategories = b.categories?.map((c: any) => c.category.name).join(', ') || 'None'
        const currentTags = b.tags?.map((t: any) => t.tag.name).join(', ') || 'None'
        return `ID: ${b.id} | Title: ${b.title} | URL: ${b.url} | Description: ${b.description || 'None'} | Current Categories: ${currentCategories} | Current Tags: ${currentTags}`
      })
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
            content: `You are an AI bookmark organizer. Analyze bookmarks and suggest appropriate categories and tags.

Existing categories: ${categoryList || 'None yet - create new ones'}
Existing tags: ${tagList || 'None yet - create new ones'}

Please respond in JSON format with the following structure:
{
  "organizations": [
    {
      "bookmarkId": "bookmark_id",
      "categories": ["Category1", "Category2"],
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}

Guidelines:
- Reuse existing categories when appropriate
- Create new categories only when necessary
- Reuse existing tags when appropriate
- Suggest 1-2 categories and 2-4 relevant tags per bookmark
- Categories should be broad (e.g., "Development", "Design", "Productivity")
- Tags should be specific (e.g., "react", "ui-design", "time-management")

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`,
          },
          {
            role: 'user',
            content: `Please organize these bookmarks:

${bookmarkList}`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      }),
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)

    // Apply the AI suggestions
    let organized = 0
    for (const org of result.organizations || []) {
      try {
        const bookmarkId = org.bookmarkId

        // Handle categories
        if (org.categories && org.categories.length > 0) {
          for (const categoryName of org.categories) {
            // Find or create category
            let category = await prisma.category.findFirst({
              where: { name: categoryName, userId: user.id },
            })

            if (!category) {
              category = await prisma.category.create({
                data: {
                  name: categoryName,
                  userId: user.id,
                  color: '#3B82F6', // Default blue color
                },
              })
            }

            // Link bookmark to category
            await prisma.bookmarkCategory.upsert({
              where: {
                bookmarkId_categoryId: {
                  bookmarkId,
                  categoryId: category.id,
                },
              },
              create: {
                bookmarkId,
                categoryId: category.id,
              },
              update: {},
            })
          }
        }

        // Handle tags
        if (org.tags && org.tags.length > 0) {
          for (const tagName of org.tags) {
            // Find or create tag
            let tag = await prisma.tag.findFirst({
              where: { name: tagName, userId: user.id },
            })

            if (!tag) {
              tag = await prisma.tag.create({
                data: {
                  name: tagName,
                  userId: user.id,
                  color: '#10B981', // Default green color
                },
              })
            }

            // Link bookmark to tag
            await prisma.bookmarkTag.upsert({
              where: {
                bookmarkId_tagId: {
                  bookmarkId,
                  tagId: tag.id,
                },
              },
              create: {
                bookmarkId,
                tagId: tag.id,
              },
              update: {},
            })
          }
        }

        organized++
      } catch (error) {
        console.error(`Failed to update bookmark ${org.bookmarkId}:`, error)
      }
    }

    return NextResponse.json({
      message: `Successfully organized ${organized} bookmarks!`,
      organized,
      details: result.organizations,
    })
  } catch (error) {
    console.error('Auto-organize error:', error)
    return NextResponse.json(
      { error: 'Failed to auto-organize bookmarks' },
      { status: 500 }
    )
  }
}
