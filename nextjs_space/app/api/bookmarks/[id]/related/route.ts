
import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/bookmarks/[id]/related - Get related bookmarks
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

    // Get related bookmarks
    const relatedBookmarks = await prisma.relatedBookmark.findMany({
      where: {
        bookmarkId: bookmarkId,
      },
      include: {
        relatedBookmark: {
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            favicon: true,
            priority: true,
            isFavorite: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(relatedBookmarks)
  } catch (error) {
    console.error('Error fetching related bookmarks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/bookmarks/[id]/related - Add related bookmarks
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
    const { relatedBookmarkIds } = body

    if (!Array.isArray(relatedBookmarkIds) || relatedBookmarkIds.length === 0) {
      return NextResponse.json(
        { error: 'relatedBookmarkIds must be a non-empty array' },
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

    // Verify all related bookmarks belong to the user
    const relatedBookmarks = await prisma.bookmark.findMany({
      where: {
        id: { in: relatedBookmarkIds },
        user: { email: session.user.email },
      },
    })

    if (relatedBookmarks.length !== relatedBookmarkIds.length) {
      return NextResponse.json(
        { error: 'Some related bookmarks not found' },
        { status: 404 }
      )
    }

    // Create related bookmark entries (skip duplicates)
    const createPromises = relatedBookmarkIds.map((relatedId) =>
      prisma.relatedBookmark.upsert({
        where: {
          bookmarkId_relatedBookmarkId: {
            bookmarkId: bookmarkId,
            relatedBookmarkId: relatedId,
          },
        },
        update: {},
        create: {
          bookmarkId: bookmarkId,
          relatedBookmarkId: relatedId,
        },
      })
    )

    await Promise.all(createPromises)

    // Return updated list
    const updatedRelatedBookmarks = await prisma.relatedBookmark.findMany({
      where: {
        bookmarkId: bookmarkId,
      },
      include: {
        relatedBookmark: {
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            favicon: true,
            priority: true,
            isFavorite: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(updatedRelatedBookmarks)
  } catch (error) {
    console.error('Error adding related bookmarks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/bookmarks/[id]/related - Remove a related bookmark
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
    const relatedBookmarkId = searchParams.get('relatedBookmarkId')

    if (!relatedBookmarkId) {
      return NextResponse.json(
        { error: 'relatedBookmarkId is required' },
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
    await prisma.relatedBookmark.deleteMany({
      where: {
        bookmarkId: bookmarkId,
        relatedBookmarkId: relatedBookmarkId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing related bookmark:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
