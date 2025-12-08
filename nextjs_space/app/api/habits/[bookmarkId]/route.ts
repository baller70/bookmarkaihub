
import { NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/habits/[bookmarkId] - Get all habits for a bookmark
export async function GET(
  request: Request,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getDevSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const habits = await prisma.habit.findMany({
      where: { bookmarkId: params.bookmarkId, isActive: true },
      include: {
        checkins: {
          orderBy: { date: 'desc' },
          take: 30 // Last 30 days
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(habits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 })
  }
}

// POST /api/habits/[bookmarkId] - Create a new habit
export async function POST(
  request: Request,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getDevSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, color, frequency, targetCount } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const habit = await prisma.habit.create({
      data: {
        bookmarkId: params.bookmarkId,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        frequency: frequency || 'DAILY',
        targetCount: targetCount || 1
      }
    })

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
  }
}
