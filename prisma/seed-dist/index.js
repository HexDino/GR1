"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const doctors_1 = require("./doctors");
const users_1 = require("./users");
const test_accounts_1 = require("./test-accounts");
const medicines_1 = require("./medicines");
const appointments_1 = require("./appointments");
const prescriptions_1 = require("./prescriptions");
const reviews_1 = require("./reviews");
const health_data_1 = require("./health-data");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        console.log('Starting database seeding...');
        // Seed basic data first
        console.log('\n📋 Seeding base data...');
        await (0, users_1.seedUsers)();
        await (0, doctors_1.seedDoctors)();
        await (0, test_accounts_1.seedTestAccounts)();
        // Seed medicines
        console.log('\n💊 Seeding medicines...');
        await (0, medicines_1.seedMedicines)();
        // Seed appointments (depends on users)
        console.log('\n📅 Seeding appointments...');
        await (0, appointments_1.seedAppointments)();
        // Seed prescriptions (depends on appointments and medicines)
        console.log('\n📝 Seeding prescriptions...');
        await (0, prescriptions_1.seedPrescriptions)();
        // Seed reviews (depends on appointments)
        console.log('\n⭐ Seeding reviews...');
        await (0, reviews_1.seedDoctorReviews)();
        // Seed health data (depends on users and appointments)
        console.log('\n💪 Seeding health data...');
        await (0, health_data_1.seedHealthData)();
        console.log('\n🎉 Database seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during database seeding:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
