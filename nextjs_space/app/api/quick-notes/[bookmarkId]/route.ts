
import { NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/quick-notes/[bookmarkId] - Get all notes for a bookmark
export async function GET(
  request: Request,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getDevSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notes = await prisma.quickNote.findMany({
      where: { bookmarkId: params.bookmarkId },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

// POST /api/quick-notes/[bookmarkId] - Create a new note
export async function POST(
  request: Request,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getDevSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const note = await prisma.quickNote.create({
      data: {
        bookmarkId: params.bookmarkId,
        title: title?.trim() || null,
        content: content.trim()
      }
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
