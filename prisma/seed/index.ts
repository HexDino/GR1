import { PrismaClient } from '@prisma/client';
import { seedDoctors } from './doctors';
import { seedUsers } from './users';
import { seedTestAccounts } from './test-accounts';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seeding...');
    
    // Seed users
    await seedUsers();
    
    // Seed doctors
    await seedDoctors();
    
    // Seed test accounts
    await seedTestAccounts();
    
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 