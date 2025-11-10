
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all timer queue items for a bookmark
export async function GET(
  req: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookmarkId } = params

    const queueItems = await prisma.timerQueue.findMany({
      where: {
        bookmarkId,
        bookmark: {
          userId: session.user.id
        }
      },
      include: {
        todoItem: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(queueItems)
  } catch (error) {
    console.error('Error fetching timer queue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timer queue' },
      { status: 500 }
    )
  }
}

// POST add item to timer queue
export async function POST(
  req: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookmarkId } = params
    const body = await req.json()
    const { todoItemId, duration, isBreak } = body

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: session.user.id
      }
    })

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      )
    }

    // If todoItemId provided, verify it belongs to this bookmark
    if (todoItemId) {
      const todoItem = await prisma.todoItem.findFirst({
        where: {
          id: todoItemId,
          bookmarkId
        }
      })

      if (!todoItem) {
        return NextResponse.json(
          { error: 'Todo item not found' },
          { status: 404 }
        )
      }
    }

    // Get next order number
    const lastItem = await prisma.timerQueue.findFirst({
      where: { bookmarkId },
      orderBy: { order: 'desc' }
    })

    const queueItem = await prisma.timerQueue.create({
      data: {
        bookmarkId,
        todoItemId: todoItemId || null,
        duration: duration || 1500,
        isBreak: isBreak || false,
        order: lastItem ? lastItem.order + 1 : 0
      },
      include: {
        todoItem: true
      }
    })

    return NextResponse.json(queueItem)
  } catch (error) {
    console.error('Error adding to timer queue:', error)
    return NextResponse.json(
      { error: 'Failed to add to timer queue' },
      { status: 500 }
    )
  }
}

// DELETE clear all or remove specific item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookmarkId } = params
    const { searchParams } = new URL(req.url)
    const queueItemId = searchParams.get('itemId')

    // Verify ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: session.user.id
      }
    })

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      )
    }

    if (queueItemId) {
      // Delete specific item
      await prisma.timerQueue.delete({
        where: { id: queueItemId }
      })
    } else {
      // Clear entire queue
      await prisma.timerQueue.deleteMany({
        where: { bookmarkId }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from timer queue:', error)
    return NextResponse.json(
      { error: 'Failed to remove from timer queue' },
      { status: 500 }
    )
  }
}

// PATCH update queue item (e.g., mark as completed or reorder)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookmarkId } = params
    const body = await req.json()
    const { queueItemId, ...updates } = body

    if (!queueItemId) {
      return NextResponse.json(
        { error: 'Queue item ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const queueItem = await prisma.timerQueue.findFirst({
      where: {
        id: queueItemId,
        bookmarkId,
        bookmark: {
          userId: session.user.id
        }
      }
    })

    if (!queueItem) {
      return NextResponse.json(
        { error: 'Queue item not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.timerQueue.update({
      where: { id: queueItemId },
      data: updates,
      include: {
        todoItem: true
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating timer queue item:', error)
    return NextResponse.json(
      { error: 'Failed to update timer queue item' },
      { status: 500 }
    )
  }
}
