import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking users in database...');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    }
  });
  
  console.log(`Found ${users.length} users:`);
  users.forEach(user => {
    console.log(`- ${user.email} (${user.name || 'No name'})`);
  });
  
  // Check bookmarks count for each user
  for (const user of users) {
    const bookmarksCount = await prisma.bookmark.count({
      where: { userId: user.id }
    });
    console.log(`  User ${user.email} has ${bookmarksCount} bookmarks`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
