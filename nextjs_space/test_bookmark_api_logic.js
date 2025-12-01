require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGetActiveCompanyId(userId) {
  // Simulate what getActiveCompanyId does
  // No cookie in this test, so it should get first company
  const firstCompany = await prisma.company.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: 'asc' },
  });
  
  return firstCompany?.id || null;
}

async function main() {
  try {
    const userId = 'cmig31j360000vqyx7xwcfl8f';
    
    console.log('=== TESTING COMPANY LOGIC ===');
    const activeCompanyId = await testGetActiveCompanyId(userId);
    console.log('Active Company ID:', activeCompanyId);
    
    console.log('\n=== TESTING BOOKMARK QUERY ===');
    
    // Test 1: With company filter (mimics current API logic)
    const bookmarksWithFilter = await prisma.bookmark.findMany({
      where: {
        userId: userId,
        ...(activeCompanyId && { companyId: activeCompanyId }),
      },
      select: {
        id: true,
        title: true,
        companyId: true,
      },
      take: 5
    });
    
    console.log(`Bookmarks with company filter (first 5): ${bookmarksWithFilter.length}`);
    bookmarksWithFilter.forEach(b => {
      console.log(`  - ${b.title} (companyId: ${b.companyId})`);
    });
    
    // Test 2: Without company filter
    const bookmarksWithoutFilter = await prisma.bookmark.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        companyId: true,
      },
      take: 5
    });
    
    console.log(`\nBookmarks without company filter (first 5): ${bookmarksWithoutFilter.length}`);
    bookmarksWithoutFilter.forEach(b => {
      console.log(`  - ${b.title} (companyId: ${b.companyId})`);
    });
    
    // Count total
    const totalCount = await prisma.bookmark.count({
      where: {
        userId: userId,
        ...(activeCompanyId && { companyId: activeCompanyId }),
      },
    });
    
    console.log(`\nTotal bookmarks with filter: ${totalCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
