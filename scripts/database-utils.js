const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Database check functions consolidated
async function checkDatabase() {
  try {
    console.log('🔍 Checking database...');
    
    const users = await prisma.user.findMany();
    console.log(`👥 Total users: ${users.length}`);
    console.log(`👨‍⚕️ Doctors: ${users.filter(u => u.role === 'DOCTOR').length}`);
    console.log(`🤒 Patients: ${users.filter(u => u.role === 'PATIENT').length}`);
    console.log(`👨‍💼 Admins: ${users.filter(u => u.role === 'ADMIN').length}`);
    
    const doctors = await prisma.doctor.findMany();
    console.log(`🩺 Doctor records: ${doctors.length}`);
    
    const patients = await prisma.patient.findMany();
    console.log(`📋 Patient records: ${patients.length}`);
    
    const appointments = await prisma.appointment.count();
    console.log(`📅 Appointments: ${appointments}`);
    
    const medicines = await prisma.medicine.count();
    console.log(`💊 Medicines: ${medicines}`);
    
    console.log('\n📧 Sample user emails:');
    users.slice(0, 5).forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function debugUsers() {
  try {
    console.log('🔍 Debugging user relationships...');
    
    // Check patients with their User relationship
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    console.log('\n🤒 Patients and their User records:');
    patients.forEach(patient => {
      console.log(`- Patient ID: ${patient.id} | User ID: ${patient.userId} | Email: ${patient.user.email}`);
    });
    
    // Check doctors with their User relationship
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    console.log('\n👨‍⚕️ Doctors and their User records:');
    doctors.forEach(doctor => {
      console.log(`- Doctor ID: ${doctor.id} | User ID: ${doctor.userId} | Email: ${doctor.user.email}`);
    });
    
    // Check for missing relationships
    const patientUsers = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      include: { patient: true }
    });
    
    const doctorUsers = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      include: { doctor: true }
    });
    
    console.log('\n⚠️  Missing relationships:');
    patientUsers.forEach(user => {
      if (!user.patient) {
        console.log(`- Missing Patient record for user: ${user.email}`);
      }
    });
    
    doctorUsers.forEach(user => {
      if (!user.doctor) {
        console.log(`- Missing Doctor record for user: ${user.email}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function finalDatabaseCheck() {
  try {
    console.log('🏁 Final database validation...');
    
    // Check all critical tables
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.prescription.count(),
      prisma.medicine.count()
    ]);
    
    console.log('\n📊 Database Summary:');
    console.log(`Users: ${counts[0]}`);
    console.log(`Doctors: ${counts[1]}`);
    console.log(`Patients: ${counts[2]}`);
    console.log(`Appointments: ${counts[3]}`);
    console.log(`Prescriptions: ${counts[4]}`);
    console.log(`Medicines: ${counts[5]}`);
    
    // Check data integrity
    const usersWithoutRoleRecords = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'DOCTOR', doctor: null },
          { role: 'PATIENT', patient: null }
        ]
      }
    });
    
    if (usersWithoutRoleRecords.length > 0) {
      console.log('\n⚠️  Data integrity issues:');
      usersWithoutRoleRecords.forEach(user => {
        console.log(`- ${user.email} (${user.role}) missing role record`);
      });
    } else {
      console.log('\n✅ Data integrity: OK');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main function to run selected checks
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'check':
        await checkDatabase();
        break;
      case 'debug':
        await debugUsers();
        break;
      case 'final':
        await finalDatabaseCheck();
        break;
      case 'all':
        await checkDatabase();
        console.log('\n' + '='.repeat(50) + '\n');
        await debugUsers();
        console.log('\n' + '='.repeat(50) + '\n');
        await finalDatabaseCheck();
        break;
      default:
        console.log('Usage: node scripts/database-utils.js [check|debug|final|all]');
        console.log('  check - Basic database check');
        console.log('  debug - Debug user relationships');
        console.log('  final - Final validation');
        console.log('  all   - Run all checks');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkDatabase,
  debugUsers,
  finalDatabaseCheck
}; 