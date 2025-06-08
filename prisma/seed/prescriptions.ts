import { PrismaClient, PrescriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPrescriptions() {
  console.log('Seeding prescriptions...');

  // Get completed appointments to create prescriptions for
  const completedAppointments = await prisma.appointment.findMany({
    where: { 
      status: 'COMPLETED',
      diagnosis: { not: null }
    },
    take: 30
  });

  // Get available medicines
  const medicines = await prisma.medicine.findMany();

  if (completedAppointments.length === 0 || medicines.length === 0) {
    console.log('ℹ️ No completed appointments or medicines found, skipping prescriptions seeding...');
    return;
  }

  const prescriptions = [];

  for (const appointment of completedAppointments) {
    // Skip if already has prescription
    const existingPrescription = await prisma.prescription.findFirst({
      where: { appointmentId: appointment.id }
    });

    if (existingPrescription) continue;

    // Create prescription
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + Math.floor(Math.random() * 60 + 30)); // 30-90 days

    const prescription = {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentId: appointment.id,
      diagnosis: appointment.diagnosis!,
      notes: `Follow prescribed medication schedule. Return for follow-up if symptoms persist or worsen.`,
      validUntil,
      status: Math.random() < 0.8 ? PrescriptionStatus.ACTIVE : 
              Math.random() < 0.5 ? PrescriptionStatus.COMPLETED : PrescriptionStatus.EXPIRED
    };

    prescriptions.push(prescription);
  }

  // Check if prescriptions already exist
  const existingCount = await prisma.prescription.count();
  
  if (existingCount === 0 && prescriptions.length > 0) {
    // Create prescriptions
    const createdPrescriptions = await prisma.prescription.createMany({
      data: prescriptions,
      skipDuplicates: true
    });

    // Now create prescription items for each prescription
    const allPrescriptions = await prisma.prescription.findMany({
      take: prescriptions.length
    });

    const prescriptionItems = [];

    for (const prescription of allPrescriptions) {
      // Each prescription has 1-4 medicines
      const numMedicines = Math.floor(Math.random() * 4) + 1;
      const selectedMedicines = medicines
        .sort(() => 0.5 - Math.random())
        .slice(0, numMedicines);

      for (const medicine of selectedMedicines) {
        const frequencies = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed'];
        const durations = ['3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '30 days'];
        const dosages = ['1 tablet', '2 tablets', '1 capsule', '2 capsules', '5ml', '10ml', '1 puff', '2 puffs'];

        const item = {
          prescriptionId: prescription.id,
          medicineId: medicine.id,
          dosage: dosages[Math.floor(Math.random() * dosages.length)],
          frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
          duration: durations[Math.floor(Math.random() * durations.length)],
          instructions: `Take ${dosages[Math.floor(Math.random() * dosages.length)]} ${frequencies[Math.floor(Math.random() * frequencies.length)].toLowerCase()} ${
            medicine.prescriptionRequired ? 'with food' : Math.random() < 0.5 ? 'with food' : 'on empty stomach'
          }. ${medicine.warnings ? 'Note: ' + medicine.warnings.split('.')[0] + '.' : ''}`,
          quantity: Math.floor(Math.random() * 90) + 10 // 10-100 units
        };

        prescriptionItems.push(item);
      }
    }

    // Create prescription items
    if (prescriptionItems.length > 0) {
      await prisma.prescriptionItem.createMany({
        data: prescriptionItems,
        skipDuplicates: true
      });
    }

    console.log(`✅ Created ${prescriptions.length} prescriptions with ${prescriptionItems.length} items`);
  } else {
    console.log(`ℹ️ Prescriptions already exist (${existingCount} found), skipping...`);
  }
} 