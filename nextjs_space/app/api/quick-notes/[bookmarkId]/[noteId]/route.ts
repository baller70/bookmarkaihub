
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH /api/quick-notes/[bookmarkId]/[noteId] - Update a note
export async function PATCH(
  request: Request,
  { params }: { params: { bookmarkId: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content } = await request.json()

    const note = await prisma.quickNote.update({
      where: { id: params.noteId },
      data: {
        title: title ?? undefined,
        content: content ?? undefined
      }
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

// DELETE /api/quick-notes/[bookmarkId]/[noteId] - Delete a note
export async function DELETE(
  request: Request,
  { params }: { params: { bookmarkId: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.quickNote.delete({
      where: { id: params.noteId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
