import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from '@/lib/dev-auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const setting = await prisma.timeCapsuleSetting.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(setting || {
      frequency: 'weekly',
      maxCapsules: 10,
      enableAutoSnapshots: true,
      autoCleanup: true,
      nextRun: null,
    })
  } catch (error) {
    console.error('Error fetching time capsule settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { frequency, maxCapsules, enableAutoSnapshots, autoCleanup, nextRun } = body

    const setting = await prisma.timeCapsuleSetting.upsert({
      where: { userId: session.user.id },
      update: {
        frequency,
        maxCapsules: Number(maxCapsules) || 10,
        enableAutoSnapshots: Boolean(enableAutoSnapshots),
        autoCleanup: Boolean(autoCleanup),
        nextRun: nextRun ? new Date(nextRun) : null,
      },
      create: {
        userId: session.user.id,
        frequency: frequency || 'weekly',
        maxCapsules: Number(maxCapsules) || 10,
        enableAutoSnapshots: Boolean(enableAutoSnapshots ?? true),
        autoCleanup: Boolean(autoCleanup ?? true),
        nextRun: nextRun ? new Date(nextRun) : null,
      },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error saving time capsule settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}




