import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🏢 Seeding default companies...');

  // Get all users
  const users = await prisma.user.findMany();

  for (const user of users) {
    // Check if user already has a company
    const existingCompany = await prisma.company.findFirst({
      where: { ownerId: user.id },
    });

    if (existingCompany) {
      console.log(`✅ User ${user.email} already has a company: ${existingCompany.name}`);
      continue;
    }

    // Create default company
    const company = await prisma.company.create({
      data: {
        name: 'My Company',
        description: 'Default company',
        ownerId: user.id,
      },
    });

    console.log(`✅ Created default company for ${user.email}: ${company.name}`);

    // Assign all existing bookmarks/categories/goals to this company
    await prisma.bookmark.updateMany({
      where: { userId: user.id, companyId: null },
      data: { companyId: company.id },
    });

    await prisma.category.updateMany({
      where: { userId: user.id, companyId: null },
      data: { companyId: company.id },
    });

    await prisma.goal.updateMany({
      where: { userId: user.id, companyId: null },
      data: { companyId: company.id },
    });

    await prisma.goalFolder.updateMany({
      where: { userId: user.id, companyId: null },
      data: { companyId: company.id },
    });

    console.log(`   ↳ Assigned all existing data to ${company.name}`);
  }

  // Update main user to ELITE tier
  const mainUser = await prisma.user.findUnique({
    where: { email: 'khouston@thebasketballfactorynj.com' },
  });

  if (mainUser && mainUser.subscriptionTier !== 'ELITE') {
    await prisma.user.update({
      where: { id: mainUser.id },
      data: { subscriptionTier: 'ELITE' },
    });
    console.log('✅ Updated main user to ELITE tier');
  }

  console.log('🎉 Company seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
