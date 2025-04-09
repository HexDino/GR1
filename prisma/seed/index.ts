import { PrismaClient } from '@prisma/client';
import { seedDoctors } from './doctors';
import { seedUsers } from './users';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seeding...');
    
    // Seed users
    await seedUsers();
    
    // Seed doctors
    await seedDoctors();
    
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 