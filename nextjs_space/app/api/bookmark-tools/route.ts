
import { NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

// GET /api/bookmark-tools - Get all available tools
export async function GET() {
  try {
    const session = await getDevSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tools = await prisma.bookmarkTool.findMany({
      orderBy: [
        { isSystem: 'desc' },
        { label: 'asc' }
      ]
    })

    return NextResponse.json(tools)
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}
