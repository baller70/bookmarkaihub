import { cookies } from 'next/headers';
import { prisma } from './db';

export async function getActiveCompanyId(userId: string): Promise<string | null> {
  const cookieStore = cookies();
  const activeCompanyId = cookieStore.get('activeCompanyId')?.value;

  if (activeCompanyId) {
    // Verify the company belongs to the user
    const company = await prisma.company.findUnique({
      where: { id: activeCompanyId },
    });

    if (company && company.ownerId === userId) {
      return activeCompanyId;
    }
  }

  // If no valid active company, return the first company
  const firstCompany = await prisma.company.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: 'asc' },
  });

  return firstCompany?.id || null;
}
