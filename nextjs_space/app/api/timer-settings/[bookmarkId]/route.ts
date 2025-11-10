
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET timer settings for a bookmark
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

    let settings = await prisma.timerSettings.findFirst({
      where: {
        bookmarkId,
        bookmark: {
          userId: session.user.id
        }
      }
    })

    // Create default settings if none exist
    if (!settings) {
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

      settings = await prisma.timerSettings.create({
        data: {
          bookmarkId,
          isEnabled: true,
          workDuration: 1500, // 25 minutes
          shortBreak: 300,    // 5 minutes
          longBreak: 900,     // 15 minutes
          autoStartBreaks: false,
          autoStartPomodoros: false,
          soundEnabled: true
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching timer settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timer settings' },
      { status: 500 }
    )
  }
}

// PATCH update timer settings
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

    // Upsert settings
    const settings = await prisma.timerSettings.upsert({
      where: { bookmarkId },
      create: {
        bookmarkId,
        ...body
      },
      update: body
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating timer settings:', error)
    return NextResponse.json(
      { error: 'Failed to update timer settings' },
      { status: 500 }
    )
  }
}
