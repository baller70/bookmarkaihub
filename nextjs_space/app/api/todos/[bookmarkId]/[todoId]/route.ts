
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH /api/todos/[bookmarkId]/[todoId] - Update a todo
export async function PATCH(
  request: Request,
  { params }: { params: { bookmarkId: string; todoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const todo = await prisma.todoItem.update({
      where: { id: params.todoId },
      data: {
        ...data,
        completedAt: data.completed ? new Date() : null
      }
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

// DELETE /api/todos/[bookmarkId]/[todoId] - Delete a todo
export async function DELETE(
  request: Request,
  { params }: { params: { bookmarkId: string; todoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.todoItem.delete({
      where: { id: params.todoId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
  }
}
