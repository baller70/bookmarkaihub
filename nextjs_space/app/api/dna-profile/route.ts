
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/dna-profile - Get user's DNA profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { dnaProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If no profile exists, create one
    if (!user.dnaProfile) {
      const newProfile = await prisma.dNAProfile.create({
        data: {
          userId: user.id,
          fullName: user.fullName || user.name || '',
        }
      })
      return NextResponse.json(newProfile)
    }

    // Convert JSON fields to arrays
    const profile = {
      ...user.dnaProfile,
      subIndustrySkills: user.dnaProfile.subIndustrySkills as string[] || [],
      skillsExpertise: user.dnaProfile.skillsExpertise as string[] || [],
      personalInterests: user.dnaProfile.personalInterests as string[] || [],
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching DNA profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT /api/dna-profile - Update user's DNA profile
export async function PUT(req: NextRequest) {
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

    const body = await req.json()

    // Prepare data for upsert
    const updateData: any = {
      ...body,
      userId: user.id,
    }

    // Convert array fields to JSON
    if (body.subIndustrySkills) {
      updateData.subIndustrySkills = body.subIndustrySkills
    }
    if (body.skillsExpertise) {
      updateData.skillsExpertise = body.skillsExpertise
    }
    if (body.personalInterests) {
      updateData.personalInterests = body.personalInterests
    }

    const profile = await prisma.dNAProfile.upsert({
      where: { userId: user.id },
      update: updateData,
      create: updateData
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating DNA profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
