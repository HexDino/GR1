import { PrismaClient } from '@prisma/client';
import { seedDoctors } from './doctors';
import { seedUsers } from './users';
import { seedTestAccounts } from './test-accounts';
import { seedMedicines } from './medicines';
import { seedMoreUsers } from './more-users';
import { seedPatients } from './patients';
import { seedAppointments } from './appointments';
import { seedPrescriptions } from './prescriptions';
import { seedDoctorReviews } from './reviews';
import { seedHealthData } from './health-data';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seeding...');
    
    // Seed basic data first
    console.log('\n📋 Seeding base data...');
    await seedUsers();
    await seedDoctors();
    await seedTestAccounts();
    
    // Seed additional users
    console.log('\n👥 Seeding additional users...');
    await seedMoreUsers();
    
    // Seed patient records
    console.log('\n📋 Seeding patient records...');
    await seedPatients();
    
    // Seed medicines
    console.log('\n💊 Seeding medicines...');
    await seedMedicines();
    
    // Seed appointments (depends on users)
    console.log('\n📅 Seeding appointments...');
    await seedAppointments();
    
    // Seed prescriptions (depends on appointments and medicines)
    console.log('\n📝 Seeding prescriptions...');
    await seedPrescriptions();
    
    // Seed reviews (depends on appointments)
    console.log('\n⭐ Seeding reviews...');
    await seedDoctorReviews();
    
    // Seed health data (depends on users and appointments)
    console.log('\n💪 Seeding health data...');
    await seedHealthData();
    
    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 