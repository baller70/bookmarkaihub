
import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET: Fetch a specific time capsule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const capsule = await prisma.timeCapsule.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!capsule) {
      return NextResponse.json({ error: 'Time capsule not found' }, { status: 404 })
    }

    return NextResponse.json(capsule)
  } catch (error) {
    console.error('Error fetching time capsule:', error)
    return NextResponse.json({ error: 'Failed to fetch time capsule' }, { status: 500 })
  }
}

// DELETE: Delete a specific time capsule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.timeCapsule.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: 'Time capsule deleted successfully' })
  } catch (error) {
    console.error('Error deleting time capsule:', error)
    return NextResponse.json({ error: 'Failed to delete time capsule' }, { status: 500 })
  }
}
