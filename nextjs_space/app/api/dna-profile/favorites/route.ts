
import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

// GET /api/dna-profile/favorites - Get user's favorite bookmarks with stats
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

    // Get all favorite bookmarks with their categories
    const favorites = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
        isFavorite: true
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        lastVisited: 'desc'
      }
    })

    // Calculate stats
    const totalFavorites = favorites.length
    const totalVisits = favorites.reduce((sum: number, b: any) => sum + b.totalVisits, 0)
    const avgVisits = totalFavorites > 0 ? Math.round(totalVisits / totalFavorites) : 0
    
    const mostVisitedBookmark = favorites.reduce((max: any, b: any) => 
      b.totalVisits > (max?.totalVisits || 0) ? b : max, 
      favorites[0]
    )

    const stats = {
      totalFavorites,
      totalVisits,
      avgVisits,
      mostVisited: mostVisitedBookmark ? {
        title: mostVisitedBookmark.title,
        visits: mostVisitedBookmark.totalVisits
      } : { title: 'N/A', visits: 0 }
    }

    return NextResponse.json({ favorites, stats })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}
