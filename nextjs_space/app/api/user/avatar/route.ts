import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from '@/lib/dev-auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/user/avatar
 * Fetch the user's custom avatar URL
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true }
    })

    return NextResponse.json({ avatarUrl: user?.image || null })
  } catch (error) {
    console.error('Error fetching avatar:', error)
    return NextResponse.json({ error: 'Failed to fetch avatar' }, { status: 500 })
  }
}

/**
 * POST /api/user/avatar
 * Upload a new avatar image
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    // Convert file to base64 data URL for simple storage
    // In production, you'd want to upload to S3/Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type
    const dataUrl = `data:${mimeType};base64,${base64}`

    // Update user's image in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: dataUrl }
    })

    return NextResponse.json({ 
      success: true, 
      avatarUrl: dataUrl,
      message: 'Avatar updated successfully'
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
  }
}

/**
 * DELETE /api/user/avatar
 * Remove the user's custom avatar
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear user's image
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Avatar removed successfully'
    })
  } catch (error) {
    console.error('Error removing avatar:', error)
    return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 })
  }
}




