import { cookies } from 'next/headers';
import { prisma } from './db';

export async function getActiveCompanyId(userId: string): Promise<string | null> {
  const cookieStore = cookies();
  const activeCompanyId = cookieStore.get('activeCompanyId')?.value;

  console.log(`🔍 getActiveCompanyId called for user: ${userId}`);
  console.log(`🍪 Current cookie value: ${activeCompanyId || 'NONE'}`);

  if (activeCompanyId) {
    // Verify the company belongs to the user
    const company = await prisma.company.findUnique({
      where: { id: activeCompanyId },
    });

    if (company && company.ownerId === userId) {
      console.log(`✅ Cookie valid - company ${company.name} belongs to user`);
      return activeCompanyId;
    } else {
      console.warn(`⚠️ Cookie invalid - company ${activeCompanyId} does not belong to user or doesn't exist`);
    }
  }

  // If no valid active company, return the first company
  const firstCompany = await prisma.company.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: 'asc' },
  });

  if (!firstCompany) {
    console.error(`❌ No companies found for user ${userId}`);
    return null;
  }

  console.log(`📍 First company found: ${firstCompany.name} (${firstCompany.id})`);

  // CRITICAL FIX: Auto-set the cookie if missing to prevent bookmark disappearance
  if (!activeCompanyId) {
    console.log(`🔧 Setting activeCompanyId cookie to: ${firstCompany.id}`);
    cookieStore.set('activeCompanyId', firstCompany.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return firstCompany.id;
}
