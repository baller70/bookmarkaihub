
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all task lists for a bookmark
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

    const lists = await prisma.taskList.findMany({
      where: {
        bookmarkId,
        bookmark: {
          userId: session.user.id
        }
      },
      include: {
        items: {
          include: {
            todoItem: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(lists)
  } catch (error) {
    console.error('Error fetching task lists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task lists' },
      { status: 500 }
    )
  }
}

// POST create a new task list
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
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

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

    // Get next order number
    const lastList = await prisma.taskList.findFirst({
      where: { bookmarkId },
      orderBy: { order: 'desc' }
    })

    const list = await prisma.taskList.create({
      data: {
        bookmarkId,
        name,
        description,
        color: color || '#3B82F6',
        order: lastList ? lastList.order + 1 : 0
      },
      include: {
        items: {
          include: {
            todoItem: true
          }
        }
      }
    })

    return NextResponse.json(list)
  } catch (error) {
    console.error('Error creating task list:', error)
    return NextResponse.json(
      { error: 'Failed to create task list' },
      { status: 500 }
    )
  }
}
