import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log('Seeding users...');

  // Check if users already exist to avoid duplicates
  const existingDoctorUser = await prisma.user.findUnique({
    where: { email: 'admindoctor@example.com' }
  });

  const existingPatientUser = await prisma.user.findUnique({
    where: { email: 'adminpatient@example.com' }
  });

  // Create doctor user if it doesn't exist
  if (!existingDoctorUser) {
    // Hash the password '0'
    const hashedDoctorPassword = await bcrypt.hash('0', 10);
    
    // Create the doctor user
    const doctorUser = await prisma.user.create({
      data: {
        email: 'admindoctor@example.com',
        password: hashedDoctorPassword,
        name: 'Admin Doctor',
        role: UserRole.DOCTOR,
        isActive: true,
        isEmailVerified: true,
        phone: '+84123456789',
      }
    });

    // Create the corresponding doctor profile
    await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        specialization: 'General Medicine',
        license: 'DOC12345',
        licenseExpiry: new Date('2030-12-31'),
        verificationStatus: 'VERIFIED',
        experience: 10,
        bio: 'Experienced doctor with 10 years of practice.',
        consultationFee: 50,
        isAvailable: true,
      }
    });

    console.log('Doctor user created:', doctorUser.email);
  } else {
    console.log('Doctor user already exists');
  }

  // Create patient user if it doesn't exist
  if (!existingPatientUser) {
    // Hash the password '0'
    const hashedPatientPassword = await bcrypt.hash('0', 10);
    
    // Create the patient user
    const patientUser = await prisma.user.create({
      data: {
        email: 'adminpatient@example.com',
        password: hashedPatientPassword,
        name: 'Admin Patient',
        role: UserRole.PATIENT,
        isActive: true,
        isEmailVerified: true,
        phone: '+84987654321',
      }
    });

    // Create the corresponding patient profile
    await prisma.patient.create({
      data: {
        userId: patientUser.id,
        gender: 'MALE',
        dateOfBirth: new Date('1990-01-01'),
        bloodType: 'O+',
        allergies: 'None',
      }
    });

    // Create basic profile
    await prisma.profile.create({
      data: {
        userId: patientUser.id,
        gender: 'MALE',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Health Street, Medical City',
      }
    });

    console.log('Patient user created:', patientUser.email);
  } else {
    console.log('Patient user already exists');
  }

  console.log('Users seeding completed.');
} 