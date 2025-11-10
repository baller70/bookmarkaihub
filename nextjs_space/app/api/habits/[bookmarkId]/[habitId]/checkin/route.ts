
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/habits/[bookmarkId]/[habitId]/checkin - Create or toggle a check-in
export async function POST(
  request: Request,
  { params }: { params: { bookmarkId: string; habitId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date, completed, count, note } = await request.json()
    const checkinDate = date ? new Date(date) : new Date()
    
    // Set time to midnight for date comparison
    checkinDate.setHours(0, 0, 0, 0)

    // Try to find existing check-in
    const existingCheckin = await prisma.habitCheckIn.findUnique({
      where: {
        habitId_date: {
          habitId: params.habitId,
          date: checkinDate
        }
      }
    })

    if (existingCheckin) {
      // Toggle or update existing check-in
      const checkin = await prisma.habitCheckIn.update({
        where: { id: existingCheckin.id },
        data: {
          completed: completed ?? !existingCheckin.completed,
          count: count ?? existingCheckin.count,
          note: note ?? existingCheckin.note
        }
      })
      return NextResponse.json(checkin)
    } else {
      // Create new check-in
      const checkin = await prisma.habitCheckIn.create({
        data: {
          habitId: params.habitId,
          date: checkinDate,
          completed: completed ?? true,
          count: count ?? 1,
          note: note || null
        }
      })
      return NextResponse.json(checkin)
    }
  } catch (error) {
    console.error('Error checking in habit:', error)
    return NextResponse.json({ error: 'Failed to check in habit' }, { status: 500 })
  }
}
