import { PrismaClient, Gender } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPatients() {
  console.log('Seeding patients...');

  // Get users with PATIENT role
  const patientUsers = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    include: { patient: true }
  });

  if (patientUsers.length === 0) {
    console.log('ℹ️ No patient users found, skipping patients seeding...');
    return;
  }

  const patientsToCreate = [];

  for (const user of patientUsers) {
    // Skip if patient record already exists
    if (user.patient) continue;

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - Math.floor(Math.random() * 60 + 20)); // 20-80 years old

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const allergies = [
      'No known allergies',
      'Penicillin allergy',
      'Shellfish allergy',
      'Peanut allergy',
      'Dust mite allergy',
      'Pollen allergy',
      'Latex allergy',
      'Aspirin allergy'
    ];

    const patient = {
      userId: user.id,
      dateOfBirth: birthDate,
      gender: Math.random() < 0.5 ? Gender.MALE : Gender.FEMALE,
      bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
      allergies: allergies[Math.floor(Math.random() * allergies.length)]
    };

    patientsToCreate.push(patient);
  }

  if (patientsToCreate.length > 0) {
    await prisma.patient.createMany({
      data: patientsToCreate,
      skipDuplicates: true
    });
    console.log(`✅ Created ${patientsToCreate.length} patient records`);
  } else {
    console.log('ℹ️ All patient records already exist, skipping...');
  }

  // Also create profiles for patients if not exist
  const profilesToCreate = [];
  
  for (const user of patientUsers) {
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });

    if (existingProfile) continue;

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - Math.floor(Math.random() * 60 + 20));

    const profile = {
      userId: user.id,
      dateOfBirth: birthDate,
      gender: Math.random() < 0.5 ? Gender.MALE : Gender.FEMALE,
      address: `${Math.floor(Math.random() * 999) + 1} Main Street, Ho Chi Minh City, Vietnam`,
      height: Math.round((Math.random() * 50 + 150) * 100) / 100, // 150-200 cm
      weight: Math.round((Math.random() * 50 + 50) * 100) / 100,  // 50-100 kg
      bio: `Patient registered with MedCare healthcare system.`
    };

    profilesToCreate.push(profile);
  }

  if (profilesToCreate.length > 0) {
    await prisma.profile.createMany({
      data: profilesToCreate,
      skipDuplicates: true
    });
    console.log(`✅ Created ${profilesToCreate.length} patient profiles`);
  } else {
    console.log('ℹ️ All patient profiles already exist, skipping...');
  }
} 