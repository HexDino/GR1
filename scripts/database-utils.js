const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Các hàm kiểm tra cơ sở dữ liệu được gộp chung
async function checkDatabase() {
  try {
    console.log('🔍 Đang kiểm tra cơ sở dữ liệu...');
    
    const users = await prisma.user.findMany();
    console.log(`👥 Tổng số người dùng: ${users.length}`);
    console.log(`👨‍⚕️ Bác sĩ: ${users.filter(u => u.role === 'DOCTOR').length}`);
    console.log(`🤒 Bệnh nhân: ${users.filter(u => u.role === 'PATIENT').length}`);
    console.log(`👨‍💼 Quản trị viên: ${users.filter(u => u.role === 'ADMIN').length}`);
    
    const doctors = await prisma.doctor.findMany();
    console.log(`🩺 Hồ sơ bác sĩ: ${doctors.length}`);
    
    const patients = await prisma.patient.findMany();
    console.log(`📋 Hồ sơ bệnh nhân: ${patients.length}`);
    
    const appointments = await prisma.appointment.count();
    console.log(`📅 Lịch hẹn: ${appointments}`);
    
    const medicines = await prisma.medicine.count();
    console.log(`💊 Thuốc: ${medicines}`);
    
    console.log('\n📧 Email người dùng mẫu:');
    users.slice(0, 5).forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function debugUsers() {
  try {
    console.log('🔍 Đang debug mối quan hệ người dùng...');
    
    // Kiểm tra bệnh nhân với mối quan hệ User của họ
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
    
    console.log('\n🤒 Bệnh nhân và hồ sơ User của họ:');
    patients.forEach(patient => {
      console.log(`- ID Bệnh nhân: ${patient.id} | ID User: ${patient.userId} | Email: ${patient.user.email}`);
    });
    
    // Kiểm tra bác sĩ với mối quan hệ User của họ
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
    
    console.log('\n👨‍⚕️ Bác sĩ và hồ sơ User của họ:');
    doctors.forEach(doctor => {
      console.log(`- ID Bác sĩ: ${doctor.id} | ID User: ${doctor.userId} | Email: ${doctor.user.email}`);
    });
    
    // Kiểm tra các mối quan hệ bị thiếu
    const patientUsers = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      include: { patient: true }
    });
    
    const doctorUsers = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      include: { doctor: true }
    });
    
    console.log('\n⚠️  Mối quan hệ bị thiếu:');
    patientUsers.forEach(user => {
      if (!user.patient) {
        console.log(`- Thiếu hồ sơ Bệnh nhân cho user: ${user.email}`);
      }
    });
    
    doctorUsers.forEach(user => {
      if (!user.doctor) {
        console.log(`- Thiếu hồ sơ Bác sĩ cho user: ${user.email}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function finalDatabaseCheck() {
  try {
    console.log('🏁 Kiểm tra cơ sở dữ liệu cuối cùng...');
    
    // Kiểm tra tất cả các bảng quan trọng
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.prescription.count(),
      prisma.medicine.count()
    ]);
    
    console.log('\n📊 Tóm tắt cơ sở dữ liệu:');
    console.log(`Người dùng: ${counts[0]}`);
    console.log(`Bác sĩ: ${counts[1]}`);
    console.log(`Bệnh nhân: ${counts[2]}`);
    console.log(`Lịch hẹn: ${counts[3]}`);
    console.log(`Đơn thuốc: ${counts[4]}`);
    console.log(`Thuốc: ${counts[5]}`);
    
    // Kiểm tra tính toàn vẹn dữ liệu
    const usersWithoutRoleRecords = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'DOCTOR', doctor: null },
          { role: 'PATIENT', patient: null }
        ]
      }
    });
    
    if (usersWithoutRoleRecords.length > 0) {
      console.log('\n⚠️  Vấn đề về tính toàn vẹn dữ liệu:');
      usersWithoutRoleRecords.forEach(user => {
        console.log(`- ${user.email} (${user.role}) thiếu hồ sơ vai trò`);
      });
    } else {
      console.log('\n✅ Tính toàn vẹn dữ liệu: OK');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Hàm chính để chạy các kiểm tra đã chọn
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
        console.log('Cách sử dụng: node scripts/database-utils.js [check|debug|final|all]');
        console.log('  check - Kiểm tra cơ sở dữ liệu cơ bản');
        console.log('  debug - Debug mối quan hệ người dùng');
        console.log('  final - Kiểm tra cuối cùng');
        console.log('  all   - Chạy tất cả kiểm tra');
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