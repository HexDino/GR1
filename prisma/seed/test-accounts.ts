import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedTestAccounts() {
  console.log('Seeding test accounts...');

  // Mật khẩu chung cho tất cả tài khoản test
  const plainPassword = 'password123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 1. Tạo tài khoản PATIENT
  const existingPatient = await prisma.user.findUnique({
    where: { email: 'patient@test.com' }
  });

  if (!existingPatient) {
    const patientUser = await prisma.user.create({
      data: {
        email: 'patient@test.com',
        password: hashedPassword,
        name: 'Test Patient',
        role: UserRole.PATIENT,
        isActive: true,
        isEmailVerified: true,
        phone: '+84123456789',
      }
    });

    // Tạo hồ sơ bệnh nhân
    await prisma.patient.create({
      data: {
        userId: patientUser.id,
        gender: 'MALE',
        dateOfBirth: new Date('1990-01-01'),
        bloodType: 'A+',
        allergies: 'None',
      }
    });

    // Tạo profile
    await prisma.profile.create({
      data: {
        userId: patientUser.id,
        gender: 'MALE',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Patient Street, Test City',
      }
    });

    console.log('Test PATIENT account created:', patientUser.email);
  } else {
    console.log('Test PATIENT account already exists');
  }

  // 2. Tạo tài khoản DOCTOR
  const existingDoctor = await prisma.user.findUnique({
    where: { email: 'doctor@test.com' }
  });

  if (!existingDoctor) {
    const doctorUser = await prisma.user.create({
      data: {
        email: 'doctor@test.com',
        password: hashedPassword,
        name: 'Test Doctor',
        role: UserRole.DOCTOR,
        isActive: true,
        isEmailVerified: true,
        phone: '+84987654321',
      }
    });

    // Tạo hồ sơ bác sĩ
    await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        specialization: 'Cardiology',
        license: 'DOC-TEST-123',
        licenseExpiry: new Date('2030-12-31'),
        verificationStatus: 'VERIFIED',
        experience: 8,
        bio: 'Test doctor account for application testing',
        consultationFee: 75,
        isAvailable: true,
      }
    });

    console.log('Test DOCTOR account created:', doctorUser.email);
  } else {
    console.log('Test DOCTOR account already exists');
  }

  // 3. Tạo tài khoản ADMIN
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@test.com' }
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Test Admin',
        role: UserRole.ADMIN,
        isActive: true,
        isEmailVerified: true,
        phone: '+84111222333',
      }
    });

    // Tạo profile
    await prisma.profile.create({
      data: {
        userId: adminUser.id,
        gender: 'MALE',
        dateOfBirth: new Date('1985-01-01'),
        address: '456 Admin Street, Test City',
      }
    });

    console.log('Test ADMIN account created:', adminUser.email);
  } else {
    console.log('Test ADMIN account already exists');
  }

  console.log('Test accounts seeding completed.');
  console.log('----------------------------------');
  console.log('Test accounts credentials:');
  console.log('PATIENT: patient@test.com / password123');
  console.log('DOCTOR: doctor@test.com / password123');
  console.log('ADMIN: admin@test.com / password123');
  console.log('----------------------------------');
} 