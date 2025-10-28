
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking test user...');
  const testUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    }
  });
  
  if (!testUser) {
    console.log('❌ Test user not found in database!');
    console.log('\nAll users in database:');
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    console.log(allUsers);
  } else {
    console.log('✅ Test user found:', testUser);
    
    const bookmarksCount = await prisma.bookmark.count({
      where: { userId: testUser.id }
    });
    console.log(`   Bookmarks: ${bookmarksCount}`);
    
    const analyticsCount = await prisma.analytics.count({
      where: { userId: testUser.id }
    });
    console.log(`   Analytics records: ${analyticsCount}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
