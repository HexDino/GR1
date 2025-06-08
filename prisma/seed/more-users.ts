import { PrismaClient, UserRole, Gender, VerificationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedMoreUsers() {
  console.log('Seeding additional users...');

  // Add more patients
  const additionalPatients = [
    {
      name: 'Nguyen Van An',
      email: 'nvaan@email.com',
      phone: '0901234567',
      role: UserRole.PATIENT
    },
    {
      name: 'Tran Thi Binh',
      email: 'ttbinh@email.com', 
      phone: '0901234568',
      role: UserRole.PATIENT
    },
    {
      name: 'Le Van Cuong',
      email: 'lvcuong@email.com',
      phone: '0901234569',
      role: UserRole.PATIENT
    },
    {
      name: 'Pham Thi Dung',
      email: 'ptdung@email.com',
      phone: '0901234570',
      role: UserRole.PATIENT
    },
    {
      name: 'Hoang Van Duc',
      email: 'hvduc@email.com',
      phone: '0901234571',
      role: UserRole.PATIENT
    },
    {
      name: 'Vo Thi Hoa',
      email: 'vthoa@email.com',
      phone: '0901234572',
      role: UserRole.PATIENT
    },
    {
      name: 'Dang Van Khang',
      email: 'dvkhang@email.com',
      phone: '0901234573',
      role: UserRole.PATIENT
    },
    {
      name: 'Bui Thi Lan',
      email: 'btlan@email.com',
      phone: '0901234574',
      role: UserRole.PATIENT
    },
    {
      name: 'Ngo Van Minh',
      email: 'nvminh@email.com',
      phone: '0901234575',
      role: UserRole.PATIENT
    },
    {
      name: 'Trinh Thi Nga',
      email: 'ttnga@email.com',
      phone: '0901234576',
      role: UserRole.PATIENT
    },
    {
      name: 'Do Van Phong',
      email: 'dvphong@email.com',
      phone: '0901234577',
      role: UserRole.PATIENT
    },
    {
      name: 'Luu Thi Quynh',
      email: 'ltquynh@email.com',
      phone: '0901234578',
      role: UserRole.PATIENT
    },
    {
      name: 'Mai Van Son',
      email: 'mvson@email.com',
      phone: '0901234579',
      role: UserRole.PATIENT
    },
    {
      name: 'Dinh Thi Thao',
      email: 'dtthao@email.com',
      phone: '0901234580',
      role: UserRole.PATIENT
    },
    {
      name: 'Vu Van Tuan',
      email: 'vvtuan@email.com',
      phone: '0901234581',
      role: UserRole.PATIENT
    }
  ];

  const passwordHash = await bcrypt.hash('password123', 10);

  for (const userData of additionalPatients) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`User ${userData.email} already exists`);
        continue;
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: passwordHash
        }
      });

      // Create patient record
      await prisma.patient.create({
        data: {
          userId: user.id,
          dateOfBirth: new Date(1980 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: Math.random() < 0.5 ? Gender.MALE : Gender.FEMALE,
          bloodType: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)],
          allergies: ['No known allergies', 'Penicillin allergy', 'Peanut allergy'][Math.floor(Math.random() * 3)]
        }
      });

      // Create profile
      await prisma.profile.create({
        data: {
          userId: user.id,
          dateOfBirth: new Date(1980 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: Math.random() < 0.5 ? Gender.MALE : Gender.FEMALE,
          address: `${Math.floor(Math.random() * 999) + 1} ${['Nguyen Trai', 'Le Lai', 'Vo Thi Sau', 'Tran Hung Dao'][Math.floor(Math.random() * 4)]} Street, District ${Math.floor(Math.random() * 12) + 1}, Ho Chi Minh City`,
          height: Math.round((Math.random() * 50 + 150) * 100) / 100,
          weight: Math.round((Math.random() * 50 + 50) * 100) / 100
        }
      });

      console.log(`✅ Created patient: ${userData.name}`);
    } catch (error: any) {
      console.error(`❌ Error creating patient ${userData.name}:`, error.message);
    }
  }

  // Also create a few more doctors
  const additionalDoctors = [
    {
      name: 'Dr. Nguyen Minh Duc',
      email: 'dr.duc2@medcare.com',
      phone: '0987654330',
      specialization: 'Emergency Medicine',
      experience: 8
    },
    {
      name: 'Dr. Tran Thi Yen',
      email: 'dr.yen@medcare.com',
      phone: '0987654331',
      specialization: 'Pediatrics',
      experience: 6
    },
    {
      name: 'Dr. Le Van Binh',
      email: 'dr.binh@medcare.com',
      phone: '0987654332',
      specialization: 'Obstetrics',
      experience: 12
    }
  ];

  for (const doctorData of additionalDoctors) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: doctorData.email }
      });

      if (existingUser) {
        console.log(`Doctor ${doctorData.email} already exists`);
        continue;
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          name: doctorData.name,
          email: doctorData.email,
          phone: doctorData.phone,
          password: passwordHash,
          role: UserRole.DOCTOR
        }
      });

      // Create doctor record
      await prisma.doctor.create({
        data: {
          userId: user.id,
          specialization: doctorData.specialization,
          license: `DOC${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
          licenseExpiry: new Date(2026, 11, 31),
          verificationStatus: VerificationStatus.VERIFIED,
          experience: doctorData.experience,
          bio: `Experienced ${doctorData.specialization} specialist with ${doctorData.experience} years of practice.`,
          consultationFee: Math.floor(Math.random() * 200000) + 300000, // 300k-500k VND
          isAvailable: true,
          imageUrl: `/doctors/doctor${Math.floor(Math.random() * 8) + 1}-removebg-preview.png`
        }
      });

      console.log(`✅ Created doctor: ${doctorData.name}`);
    } catch (error: any) {
      console.error(`❌ Error creating doctor ${doctorData.name}:`, error.message);
    }
  }
} 