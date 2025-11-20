
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get active company from cookie
    const cookieStore = cookies();
    const activeCompanyId = cookieStore.get('activeCompanyId')?.value;

    if (activeCompanyId) {
      const company = await prisma.company.findUnique({
        where: { id: activeCompanyId },
      });

      if (company && company.ownerId === user.id) {
        return NextResponse.json(company);
      }
    }

    // If no active company or invalid, return the first company
    const firstCompany = await prisma.company.findFirst({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    if (!firstCompany) {
      return NextResponse.json({ error: 'No companies found' }, { status: 404 });
    }

    return NextResponse.json(firstCompany);
  } catch (error) {
    console.error('Error fetching active company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active company' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Verify company ownership
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (company.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Set active company cookie
    const response = NextResponse.json(company);
    response.cookies.set('activeCompanyId', companyId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Error setting active company:', error);
    return NextResponse.json(
      { error: 'Failed to set active company' },
      { status: 500 }
    );
  }
}
