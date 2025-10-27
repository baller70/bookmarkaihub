
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/dna-profile/search-history - Get user's search history
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

    const searchHistory = await prisma.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 searches
    })

    return NextResponse.json(searchHistory)
  } catch (error) {
    console.error('Error fetching search history:', error)
    return NextResponse.json({ error: 'Failed to fetch search history' }, { status: 500 })
  }
}

// POST /api/dna-profile/search-history - Add search to history
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

    const { query, filters, results } = await req.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const searchEntry = await prisma.searchHistory.create({
      data: {
        query,
        filters: filters || {},
        results: results || 0,
        userId: user.id
      }
    })

    return NextResponse.json(searchEntry)
  } catch (error) {
    console.error('Error adding search history:', error)
    return NextResponse.json({ error: 'Failed to add search history' }, { status: 500 })
  }
}

// DELETE /api/dna-profile/search-history - Clear search history
export async function DELETE(req: NextRequest) {
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

    await prisma.searchHistory.deleteMany({
      where: { userId: user.id }
    })

    return NextResponse.json({ message: 'Search history cleared' })
  } catch (error) {
    console.error('Error clearing search history:', error)
    return NextResponse.json({ error: 'Failed to clear search history' }, { status: 500 })
  }
}
