import { PrismaClient, AppointmentStatus, AppointmentType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedAppointments() {
  console.log('Seeding appointments...');

  // Get users to create appointments
  const patients = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    take: 15
  });

  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR' },
    take: 12
  });

  console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);

  if (patients.length === 0 || doctors.length === 0) {
    console.log('ℹ️ No patients or doctors found, skipping appointments seeding...');
    return;
  }

  const symptoms = [
    'Headache and dizziness',
    'Chest pain and shortness of breath',
    'Fever and cough',
    'Abdominal pain',
    'Back pain',
    'Skin rash and itching',
    'Joint pain and stiffness',
    'Difficulty sleeping',
    'Persistent fatigue',
    'Nausea and vomiting',
    'Vision problems',
    'Hearing loss',
    'Anxiety and stress',
    'High blood pressure',
    'Diabetes management',
    'Weight loss concerns',
    'Allergic reactions',
    'Digestive issues',
    'Respiratory problems',
    'Heart palpitations'
  ];

  const diagnoses = [
    'Hypertension',
    'Type 2 Diabetes',
    'Migraine',
    'Pneumonia',
    'Gastritis',
    'Arthritis',
    'Dermatitis',
    'Anxiety disorder',
    'Asthma',
    'Allergic rhinitis',
    'Lower back pain',
    'Viral infection',
    'Acid reflux',
    'Insomnia',
    'Sinusitis',
    'Bronchitis',
    'Eczema',
    'Depression',
    'Coronary artery disease',
    'Osteoporosis'
  ];

  const appointments = [];
  
  // Create appointments for the past 3 months
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
  
  for (let i = 0; i < 50; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    
    // Random date between 3 months ago and 1 month from now
    const appointmentDate = new Date(
      threeMonthsAgo.getTime() + Math.random() * (120 * 24 * 60 * 60 * 1000)
    );
    
    // Determine status based on date
    let status: AppointmentStatus;
    const isInPast = appointmentDate < now;
    
    if (isInPast) {
      const rand = Math.random();
      if (rand < 0.7) status = AppointmentStatus.COMPLETED;
      else if (rand < 0.85) status = AppointmentStatus.CANCELLED;
      else status = AppointmentStatus.MISSED;
    } else {
      const rand = Math.random();
      if (rand < 0.8) status = AppointmentStatus.CONFIRMED;
      else if (rand < 0.9) status = AppointmentStatus.PENDING;
      else status = AppointmentStatus.CANCELLED;
    }
    
    const appointmentType: AppointmentType = Math.random() < 0.8 ? 
      AppointmentType.IN_PERSON : 
      Math.random() < 0.5 ? AppointmentType.VIRTUAL : AppointmentType.HOME_VISIT;
    
    const appointment = {
      patientId: patient.id,
      doctorId: doctor.id,
      date: appointmentDate,
      status,
      type: appointmentType,
      symptoms: symptoms[Math.floor(Math.random() * symptoms.length)],
      diagnosis: status === AppointmentStatus.COMPLETED ? diagnoses[Math.floor(Math.random() * diagnoses.length)] : null,
      notes: status === AppointmentStatus.COMPLETED ? `Patient responded well to treatment. Follow-up recommended in ${Math.floor(Math.random() * 4 + 1)} weeks.` : null,
      followUpDate: status === AppointmentStatus.COMPLETED && Math.random() < 0.3 ? 
        new Date(appointmentDate.getTime() + (Math.floor(Math.random() * 28 + 7) * 24 * 60 * 60 * 1000)) : null,
      cancelReason: status === AppointmentStatus.CANCELLED ? 
        ['Patient request', 'Doctor unavailable', 'Emergency', 'Rescheduled'][Math.floor(Math.random() * 4)] : null
    };
    
    appointments.push(appointment);
  }

  // Check if appointments already exist
  const existingCount = await prisma.appointment.count();
  
  if (existingCount === 0) {
    await prisma.appointment.createMany({
      data: appointments,
      skipDuplicates: true
    });
    console.log(`✅ Created ${appointments.length} appointments`);
  } else {
    console.log(`ℹ️ Appointments already exist (${existingCount} found), skipping...`);
  }
} 