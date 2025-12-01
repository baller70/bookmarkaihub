import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveCompanyId } from "@/lib/company";
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "Not authenticated",
        status: "❌ NO SESSION"
      }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: "User not found",
        status: "❌ NO USER IN DB"
      }, { status: 404 });
    }

    // Get companies
    const companies = await prisma.company.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    // Get cookie
    const cookieStore = cookies();
    const cookieValue = cookieStore.get('activeCompanyId')?.value;

    // Get active company
    const activeCompanyId = await getActiveCompanyId(user.id);

    // Count bookmarks by company
    const bookmarksByCompany: any[] = [];
    for (const company of companies) {
      const count = await prisma.bookmark.count({
        where: {
          userId: user.id,
          companyId: company.id,
        }
      });
      bookmarksByCompany.push({
        companyId: company.id,
        companyName: company.name,
        bookmarkCount: count,
        isActive: company.id === activeCompanyId,
      });
    }

    // Count total bookmarks
    const totalBookmarks = await prisma.bookmark.count({
      where: { userId: user.id }
    });

    const nullCompanyCount = await prisma.bookmark.count({
      where: { userId: user.id, companyId: null }
    });

    return NextResponse.json({
      status: "✅ DIAGNOSTIC COMPLETE",
      user: {
        id: user.id,
        email: user.email,
        tier: user.subscriptionTier,
      },
      companies: {
        total: companies.length,
        list: companies.map(c => ({ id: c.id, name: c.name })),
      },
      cookie: {
        value: cookieValue || "❌ NOT SET",
        matches: cookieValue === activeCompanyId,
      },
      activeCompany: {
        id: activeCompanyId || "❌ NULL",
        name: companies.find(c => c.id === activeCompanyId)?.name || "N/A",
      },
      bookmarks: {
        total: totalBookmarks,
        nullCompany: nullCompanyCount,
        byCompany: bookmarksByCompany,
      },
      diagnosis: {
        hasCompanies: companies.length > 0,
        cookieSet: !!cookieValue,
        activeCompanyValid: !!activeCompanyId,
        bookmarksVisible: totalBookmarks > 0 && !!activeCompanyId,
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      status: "❌ ERROR"
    }, { status: 500 });
  }
}
