
import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH update a task list
export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookmarkId: string; listId: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookmarkId, listId } = params
    const body = await req.json()

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

    const updatedList = await prisma.taskList.update({
      where: { id: listId },
      data: body,
      include: {
        items: {
          include: {
            todoItem: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(updatedList)
  } catch (error) {
    console.error('Error updating task list:', error)
    return NextResponse.json(
      { error: 'Failed to update task list' },
      { status: 500 }
    )
  }
}

// DELETE a task list
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookmarkId: string; listId: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookmarkId, listId } = params

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

    await prisma.taskList.delete({
      where: { id: listId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task list:', error)
    return NextResponse.json(
      { error: 'Failed to delete task list' },
      { status: 500 }
    )
  }
}
