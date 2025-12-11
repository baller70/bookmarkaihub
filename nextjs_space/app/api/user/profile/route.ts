import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from '@/lib/dev-auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, fullName: true, email: true }
    })

    const name = user?.name || ''
    const parts = name.split(' ')
    const firstName = parts[0] || ''
    const lastName = parts.slice(1).join(' ')

    return NextResponse.json({
      name,
      fullName: user?.fullName || name,
      firstName,
      lastName,
      email: user?.email || session.user.email || ''
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const firstName = (body.firstName || '').trim()
    const lastName = (body.lastName || '').trim()
    if (!firstName) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 })
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: fullName,
        fullName: fullName,
      },
      select: { id: true, name: true, fullName: true }
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
