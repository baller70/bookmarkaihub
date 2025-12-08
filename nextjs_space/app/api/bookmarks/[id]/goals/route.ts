
import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/bookmarks/[id]/goals - Get goals linked to a bookmark
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookmarkId = params.id

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        user: { email: session.user.email },
      },
    })

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }

    // Get linked goals
    const goalBookmarks = await prisma.goalBookmark.findMany({
      where: {
        bookmarkId: bookmarkId,
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            description: true,
            goalType: true,
            color: true,
            priority: true,
            status: true,
            progress: true,
            deadline: true,
          },
        },
      },
    })

    return NextResponse.json(goalBookmarks)
  } catch (error) {
    console.error('Error fetching bookmark goals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/bookmarks/[id]/goals - Link goals to a bookmark
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookmarkId = params.id
    const body = await req.json()
    const { goalIds } = body

    if (!Array.isArray(goalIds) || goalIds.length === 0) {
      return NextResponse.json(
        { error: 'goalIds must be a non-empty array' },
        { status: 400 }
      )
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        user: { email: session.user.email },
      },
    })

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }

    // Verify all goals belong to the user
    const goals = await prisma.goal.findMany({
      where: {
        id: { in: goalIds },
        user: { email: session.user.email },
      },
    })

    if (goals.length !== goalIds.length) {
      return NextResponse.json(
        { error: 'Some goals not found' },
        { status: 404 }
      )
    }

    // Create goal-bookmark entries (skip duplicates)
    const createPromises = goalIds.map((goalId) =>
      prisma.goalBookmark.upsert({
        where: {
          goalId_bookmarkId: {
            goalId: goalId,
            bookmarkId: bookmarkId,
          },
        },
        update: {},
        create: {
          goalId: goalId,
          bookmarkId: bookmarkId,
        },
      })
    )

    await Promise.all(createPromises)

    // Return updated list
    const updatedGoalBookmarks = await prisma.goalBookmark.findMany({
      where: {
        bookmarkId: bookmarkId,
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            description: true,
            goalType: true,
            color: true,
            priority: true,
            status: true,
            progress: true,
            deadline: true,
          },
        },
      },
    })

    return NextResponse.json(updatedGoalBookmarks)
  } catch (error) {
    console.error('Error linking goals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/bookmarks/[id]/goals - Remove a goal link
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookmarkId = params.id
    const { searchParams } = new URL(req.url)
    const goalId = searchParams.get('goalId')

    if (!goalId) {
      return NextResponse.json(
        { error: 'goalId is required' },
        { status: 400 }
      )
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        user: { email: session.user.email },
      },
    })

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }

    // Delete the relationship
    await prisma.goalBookmark.deleteMany({
      where: {
        bookmarkId: bookmarkId,
        goalId: goalId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing goal link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
