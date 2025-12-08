
import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/dna-profile/time-capsules - Get user's time capsules
export async function GET(req: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const capsules = await prisma.timeCapsule.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(capsules)
  } catch (error) {
    console.error('Error fetching time capsules:', error)
    return NextResponse.json({ error: 'Failed to fetch time capsules' }, { status: 500 })
  }
}

// POST /api/dna-profile/time-capsules - Create a new time capsule
export async function POST(req: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { title, description, date } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Snapshot current state
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        categories: {
          include: { category: true }
        },
        tags: {
          include: { tag: true }
        }
      }
    })

    const categories = await prisma.category.findMany({
      where: { userId: user.id }
    })

    const snapshot = {
      bookmarks,
      categories,
      timestamp: new Date().toISOString()
    }

    // Calculate stats
    const totalBookmarks = bookmarks.length
    const totalFolders = categories.length
    const totalSize = Math.round(JSON.stringify(snapshot).length / 1024) // Size in KB

    // Create AI summary (simplified)
    const aiSummary = `Captured ${totalBookmarks} bookmarks across ${totalFolders} categories. Most active category: ${categories[0]?.name || 'None'}.`

    const capsule = await prisma.timeCapsule.create({
      data: {
        title,
        description,
        date: date ? new Date(date) : new Date(),
        totalBookmarks,
        totalFolders,
        totalSize,
        snapshot,
        aiSummary,
        userId: user.id
      }
    })

    return NextResponse.json(capsule)
  } catch (error) {
    console.error('Error creating time capsule:', error)
    return NextResponse.json({ error: 'Failed to create time capsule' }, { status: 500 })
  }
}
