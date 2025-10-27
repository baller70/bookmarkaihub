
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/dna-profile/playbooks - Get user's playbooks
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const playbooks = await prisma.playbook.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            bookmark: {
              select: {
                id: true,
                title: true,
                url: true,
                favicon: true,
                description: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(playbooks)
  } catch (error) {
    console.error('Error fetching playbooks:', error)
    return NextResponse.json({ error: 'Failed to fetch playbooks' }, { status: 500 })
  }
}

// POST /api/dna-profile/playbooks - Create a new playbook
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { title, description, category, bookmarkIds } = await req.json()

    if (!title || !bookmarkIds || bookmarkIds.length === 0) {
      return NextResponse.json({ error: 'Title and bookmarks are required' }, { status: 400 })
    }

    // Calculate total duration (5 min per bookmark by default)
    const totalDuration = bookmarkIds.length * 300

    // Create playbook with items
    const playbook = await prisma.playbook.create({
      data: {
        title,
        description,
        category,
        duration: totalDuration,
        userId: user.id,
        items: {
          create: bookmarkIds.map((bookmarkId: string, index: number) => ({
            bookmarkId,
            order: index,
            duration: 300 // 5 minutes default
          }))
        }
      },
      include: {
        items: {
          include: {
            bookmark: {
              select: {
                id: true,
                title: true,
                url: true,
                favicon: true,
                description: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(playbook)
  } catch (error) {
    console.error('Error creating playbook:', error)
    return NextResponse.json({ error: 'Failed to create playbook' }, { status: 500 })
  }
}
