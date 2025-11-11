
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearColors() {
  try {
    // First, let's see what we have
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, color: true, backgroundColor: true }
    });
    
    console.log('Current categories:', JSON.stringify(categories, null, 2));
    
    // Now clear all colors (set to null)
    const result = await prisma.category.updateMany({
      data: {
        color: null,
        backgroundColor: null
      }
    });
    
    console.log(`\nCleared colors from ${result.count} categories`);
    
    // Verify
    const updated = await prisma.category.findMany({
      select: { id: true, name: true, color: true, backgroundColor: true }
    });
    
    console.log('\nUpdated categories:', JSON.stringify(updated, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearColors();
