
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/bookmark-tools/[bookmarkId] - Get tool preferences for a bookmark
export async function GET(
  request: Request,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookmarkId = params.bookmarkId

    // Get all tools
    const allTools = await prisma.bookmarkTool.findMany({
      orderBy: { createdAt: 'asc' }
    })

    // Get user's preferences for this bookmark
    const preferences = await prisma.bookmarkToolPreference.findMany({
      where: { bookmarkId },
      include: { tool: true }
    })

    // Create a map of preferences
    const preferencesMap = new Map(
      preferences.map(p => [p.toolKey, p])
    )

    // Merge tools with preferences
    const toolsWithPreferences = allTools.map((tool, index) => {
      const preference = preferencesMap.get(tool.key)
      return {
        ...tool,
        isEnabled: preference?.isEnabled ?? tool.isDefault,
        order: preference?.order ?? index,
        preferenceId: preference?.id
      }
    })

    // Sort by order
    toolsWithPreferences.sort((a, b) => a.order - b.order)

    return NextResponse.json(toolsWithPreferences)
  } catch (error) {
    console.error('Error fetching tool preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tool preferences' },
      { status: 500 }
    )
  }
}

// PUT /api/bookmark-tools/[bookmarkId] - Update tool preferences
export async function PUT(
  request: Request,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookmarkId = params.bookmarkId
    const { toolKey, isEnabled, order } = await request.json()

    // Verify bookmark belongs to user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: user.id
      }
    })

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }

    // Upsert preference
    const preference = await prisma.bookmarkToolPreference.upsert({
      where: {
        bookmarkId_toolKey: {
          bookmarkId,
          toolKey
        }
      },
      update: {
        isEnabled: isEnabled ?? undefined,
        order: order ?? undefined
      },
      create: {
        bookmarkId,
        toolKey,
        isEnabled: isEnabled ?? true,
        order: order ?? 0
      }
    })

    return NextResponse.json(preference)
  } catch (error) {
    console.error('Error updating tool preference:', error)
    return NextResponse.json(
      { error: 'Failed to update tool preference' },
      { status: 500 }
    )
  }
}
