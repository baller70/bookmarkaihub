const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testBookmarksAPI() {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: 'khouston@thebasketballfactorynj.com' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('User ID:', user.id);
    
    // Get company
    const company = await prisma.company.findFirst({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'asc' }
    });
    
    if (!company) {
      console.log('❌ No company found');
      return;
    }
    
    console.log('✅ Company found:', company.name);
    console.log('Company ID:', company.id);
    
    // Get bookmarks (simulating the API query)
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
        companyId: company.id
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n📊 QUERY RESULT:');
    console.log(`Found ${bookmarks.length} bookmarks`);
    
    if (bookmarks.length > 0) {
      console.log('\n📝 First 3 bookmarks:');
      bookmarks.slice(0, 3).forEach((bm, idx) => {
        console.log(`${idx + 1}. ${bm.title} - ${bm.url}`);
      });
    }
    
    // Now test WITHOUT company filter (what happens if cookie is missing)
    const allBookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id
      }
    });
    
    console.log('\n🔍 WITHOUT company filter:');
    console.log(`Found ${allBookmarks.length} bookmarks`);
    
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBookmarksAPI();
