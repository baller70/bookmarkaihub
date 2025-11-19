const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        backgroundColor: true
      }
    });
    console.log('Current category colors:');
    categories.forEach(cat => {
      console.log(`\n${cat.name}:`);
      console.log(`  color (outline): ${cat.color || 'NULL'}`);
      console.log(`  backgroundColor (square): ${cat.backgroundColor || 'NULL'}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
