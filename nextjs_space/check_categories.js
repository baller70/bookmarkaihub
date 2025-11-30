const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: 'khouston@thebasketballfactorynj.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User ID:', user.id);
    
    // Get user's companies
    const companies = await prisma.company.findMany({
      where: { ownerId: user.id }
    });
    
    console.log('\nCompanies:', companies.length);
    companies.forEach(c => console.log(`  - ${c.name} (ID: ${c.id})`));
    
    // Get ALL categories for this user
    const allCategories = await prisma.category.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { bookmarks: true }
        }
      }
    });
    
    console.log('\n=== ALL CATEGORIES ===');
    console.log('Total categories:', allCategories.length);
    allCategories.forEach(cat => {
      console.log(`  - ${cat.name} (Company: ${cat.companyId || 'NULL'}, Bookmarks: ${cat._count.bookmarks})`);
    });
    
    // Get categories WITH company ID
    const categoriesWithCompany = allCategories.filter(c => c.companyId);
    console.log('\n=== CATEGORIES WITH COMPANY ===');
    console.log('Total:', categoriesWithCompany.length);
    categoriesWithCompany.forEach(cat => {
      console.log(`  - ${cat.name} (Company: ${cat.companyId}, Bookmarks: ${cat._count.bookmarks})`);
    });
    
    // Get categories WITHOUT company ID
    const categoriesWithoutCompany = allCategories.filter(c => !c.companyId);
    console.log('\n=== CATEGORIES WITHOUT COMPANY (ORPHANED) ===');
    console.log('Total:', categoriesWithoutCompany.length);
    categoriesWithoutCompany.forEach(cat => {
      console.log(`  - ${cat.name} (Bookmarks: ${cat._count.bookmarks})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
