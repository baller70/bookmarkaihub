
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET: Fetch all time capsules for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const capsules = await prisma.timeCapsule.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(capsules)
  } catch (error) {
    console.error('Error fetching time capsules:', error)
    return NextResponse.json({ error: 'Failed to fetch time capsules' }, { status: 500 })
  }
}

// POST: Create a new time capsule
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description } = body

    // Fetch current user's bookmarks, categories, and tags for the snapshot
    const [bookmarks, categories, tags] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: session.user.id },
        include: {
          categories: {
            include: { category: true }
          },
          tags: {
            include: { tag: true }
          }
        }
      }),
      prisma.category.findMany({
        where: { userId: session.user.id }
      }),
      prisma.tag.findMany({
        where: { userId: session.user.id }
      })
    ])

    // Calculate stats
    const totalBookmarks = bookmarks.length
    const totalFolders = categories.length
    const totalSize = Math.floor(JSON.stringify({ bookmarks, categories, tags }).length / 1024) // KB

    // Create snapshot data
    const snapshot = {
      bookmarks: bookmarks.map((b: typeof bookmarks[0]) => ({
        id: b.id,
        title: b.title,
        url: b.url,
        description: b.description,
        favicon: b.favicon,
        priority: b.priority,
        isFavorite: b.isFavorite,
        categories: b.categories.map((c: typeof b.categories[0]) => c.category.name),
        tags: b.tags.map((t: typeof b.tags[0]) => t.tag.name),
        createdAt: b.createdAt
      })),
      categories: categories.map((c: typeof categories[0]) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        color: c.color,
        icon: c.icon
      })),
      tags: tags.map((t: typeof tags[0]) => ({
        id: t.id,
        name: t.name,
        color: t.color
      }))
    }

    // Generate AI summary (placeholder for now)
    const aiSummary = `Snapshot captured ${totalBookmarks} bookmarks across ${totalFolders} folders. This represents your current bookmark collection at this point in time.`

    // Create the time capsule
    const capsule = await prisma.timeCapsule.create({
      data: {
        title,
        description,
        date: new Date(),
        totalBookmarks,
        totalFolders,
        totalSize,
        snapshot,
        aiSummary,
        userId: session.user.id
      }
    })

    return NextResponse.json(capsule, { status: 201 })
  } catch (error) {
    console.error('Error creating time capsule:', error)
    return NextResponse.json({ error: 'Failed to create time capsule' }, { status: 500 })
  }
}
