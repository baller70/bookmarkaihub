
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST add item to list
export async function POST(
  req: NextRequest,
  { params }: { params: { bookmarkId: string; listId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookmarkId, listId } = params
    const body = await req.json()
    const { todoItemId, order } = body

    if (!todoItemId) {
      return NextResponse.json(
        { error: 'TodoItem ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const list = await prisma.taskList.findFirst({
      where: {
        id: listId,
        bookmarkId,
        bookmark: {
          userId: session.user.id
        }
      }
    })

    if (!list) {
      return NextResponse.json(
        { error: 'Task list not found' },
        { status: 404 }
      )
    }

    // Verify todo item belongs to same bookmark
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

    // Check if item already in list
    const existing = await prisma.taskListItem.findFirst({
      where: {
        taskListId: listId,
        todoItemId
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Item already in list' },
        { status: 400 }
      )
    }

    // Get next order if not provided
    let itemOrder = order
    if (itemOrder === undefined || itemOrder === null) {
      const lastItem = await prisma.taskListItem.findFirst({
        where: { taskListId: listId },
        orderBy: { order: 'desc' }
      })
      itemOrder = lastItem ? lastItem.order + 1 : 0
    }

    const item = await prisma.taskListItem.create({
      data: {
        taskListId: listId,
        todoItemId,
        order: itemOrder
      },
      include: {
        todoItem: true
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error adding item to list:', error)
    return NextResponse.json(
      { error: 'Failed to add item to list' },
      { status: 500 }
    )
  }
}

// DELETE remove item from list
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookmarkId: string; listId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookmarkId, listId } = params
    const { searchParams } = new URL(req.url)
    const todoItemId = searchParams.get('todoItemId')

    if (!todoItemId) {
      return NextResponse.json(
        { error: 'TodoItem ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const list = await prisma.taskList.findFirst({
      where: {
        id: listId,
        bookmarkId,
        bookmark: {
          userId: session.user.id
        }
      }
    })

    if (!list) {
      return NextResponse.json(
        { error: 'Task list not found' },
        { status: 404 }
      )
    }

    await prisma.taskListItem.deleteMany({
      where: {
        taskListId: listId,
        todoItemId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing item from list:', error)
    return NextResponse.json(
      { error: 'Failed to remove item from list' },
      { status: 500 }
    )
  }
}
