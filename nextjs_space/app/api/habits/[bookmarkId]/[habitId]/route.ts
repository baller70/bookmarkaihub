
import { NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH /api/habits/[bookmarkId]/[habitId] - Update a habit
export async function PATCH(
  request: Request,
  { params }: { params: { bookmarkId: string; habitId: string } }
) {
  try {
    const session = await getDevSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const habit = await prisma.habit.update({
      where: { id: params.habitId },
      data
    })

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error updating habit:', error)
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 })
  }
}

// DELETE /api/habits/[bookmarkId]/[habitId] - Delete a habit
export async function DELETE(
  request: Request,
  { params }: { params: { bookmarkId: string; habitId: string } }
) {
  try {
    const session = await getDevSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.habit.update({
      where: { id: params.habitId },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 })
  }
}
