
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFile, deleteFile } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to S3
    const cloudStoragePath = await uploadFile(buffer, file.name);

    // Delete old logo if exists
    if (user.customLogo) {
      try {
        await deleteFile(user.customLogo);
      } catch (error) {
        console.error('Error deleting old logo:', error);
      }
    }

    // Update user with new custom logo path
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { customLogo: cloudStoragePath }
    });

    return NextResponse.json({ 
      success: true, 
      customLogo: updatedUser.customLogo 
    });
  } catch (error) {
    console.error('Error uploading custom logo:', error);
    return NextResponse.json({ error: 'Failed to upload custom logo' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete from S3 if exists
    if (user.customLogo) {
      try {
        await deleteFile(user.customLogo);
      } catch (error) {
        console.error('Error deleting logo from S3:', error);
      }
    }

    // Remove custom logo from user
    await prisma.user.update({
      where: { id: user.id },
      data: { customLogo: null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom logo:', error);
    return NextResponse.json({ error: 'Failed to delete custom logo' }, { status: 500 });
  }
}
