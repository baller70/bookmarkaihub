
import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from "@/lib/dev-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFile, deleteFile } from '@/lib/s3';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: params.id, userId: user.id }
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const imageType = formData.get('imageType') as string; // 'favicon', 'logo', or 'background'
    const file = formData.get('file') as File;

    if (!imageType || !['favicon', 'logo', 'background'].includes(imageType)) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
    }

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

    // Delete old image if exists
    const fieldMap = {
      favicon: 'customFavicon',
      logo: 'customLogo',
      background: 'customBackground'
    };
    const field = fieldMap[imageType as keyof typeof fieldMap];
    const oldPath = bookmark[field as keyof typeof bookmark] as string | null;

    if (oldPath) {
      try {
        await deleteFile(oldPath);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Update bookmark with new image path
    const updatedBookmark = await prisma.bookmark.update({
      where: { id: params.id },
      data: { [field]: cloudStoragePath }
    });

    return NextResponse.json({ 
      success: true, 
      [field]: updatedBookmark[field as keyof typeof updatedBookmark]
    });
  } catch (error) {
    console.error('Error uploading custom image:', error);
    return NextResponse.json({ error: 'Failed to upload custom image' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: params.id, userId: user.id }
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const imageType = searchParams.get('imageType'); // 'favicon', 'logo', or 'background'

    if (!imageType || !['favicon', 'logo', 'background'].includes(imageType)) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
    }

    const fieldMap = {
      favicon: 'customFavicon',
      logo: 'customLogo',
      background: 'customBackground'
    };
    const field = fieldMap[imageType as keyof typeof fieldMap];
    const imagePath = bookmark[field as keyof typeof bookmark] as string | null;

    // Delete from S3 if exists
    if (imagePath) {
      try {
        await deleteFile(imagePath);
      } catch (error) {
        console.error('Error deleting image from S3:', error);
      }
    }

    // Remove custom image from bookmark
    await prisma.bookmark.update({
      where: { id: params.id },
      data: { [field]: null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom image:', error);
    return NextResponse.json({ error: 'Failed to delete custom image' }, { status: 500 });
  }
}
