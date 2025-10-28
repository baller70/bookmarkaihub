
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'user@example.com' }
  });
  
  if (!user) {
    console.log('❌ User not found!');
    return;
  }
  
  console.log('✅ User found:', user.email, '(ID:', user.id, ')');
  
  const bookmarksCount = await prisma.bookmark.count({
    where: { userId: user.id }
  });
  
  console.log(`\n📚 Total bookmarks for this user: ${bookmarksCount}`);
  
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    take: 10,
    select: {
      id: true,
      title: true,
      url: true,
    }
  });
  
  console.log(`\nFirst ${bookmarks.length} bookmarks:`);
  bookmarks.forEach((bm, idx) => {
    console.log(`  ${idx + 1}. ${bm.title}`);
  });
  
  const analytics = await prisma.analytics.findMany({
    where: { userId: user.id },
    take: 5,
    select: {
      id: true,
      totalBookmarks: true,
      totalCategories: true,
      date: true,
    }
  });
  
  console.log(`\n📊 Found ${analytics.length} analytics records (showing first 5):`);
  analytics.forEach((a) => {
    console.log(`  - ${a.date.toISOString().split('T')[0]}: ${a.totalBookmarks} bookmarks, ${a.totalCategories} categories`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
