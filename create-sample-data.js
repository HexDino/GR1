const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    console.log('🚀 Creating sample data...');
    
    // Get available patients and doctors
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' }
    });
    
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' }
    });
    
    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);
    
    // Create 20 appointments
    const appointments = [];
    for (let i = 0; i < 20; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      // Random date in the past 30 days or next 30 days
      const daysOffset = Math.floor(Math.random() * 60) - 30;
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + daysOffset);
      
      const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
      const types = ['IN_PERSON', 'VIRTUAL', 'HOME_VISIT'];
      const symptoms = [
        'Headache and dizziness',
        'Fever and cough',
        'Chest pain',
        'Abdominal pain',
        'Back pain',
        'Fatigue',
        'Skin problems',
        'Joint pain'
      ];
      
      appointments.push({
        patientId: patient.id,
        doctorId: doctor.id,
        date: appointmentDate,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        type: types[Math.floor(Math.random() * types.length)],
        symptoms: symptoms[Math.floor(Math.random() * symptoms.length)]
      });
    }
    
    console.log('Creating appointments...');
    
    // Create appointments one by one to avoid foreign key issues
    let created = 0;
    for (const appointment of appointments) {
      try {
        await prisma.appointment.create({
          data: appointment
        });
        created++;
      } catch (error) {
        console.log(`Failed to create appointment: ${error.message}`);
      }
    }
    
    console.log(`✅ Created ${created} appointments`);
    
    // Create some prescriptions for completed appointments
    const completedAppointments = await prisma.appointment.findMany({
      where: { status: 'COMPLETED' },
      take: 10
    });
    
    const medicines = await prisma.medicine.findMany({ take: 10 });
    
    if (completedAppointments.length > 0 && medicines.length > 0) {
      console.log('Creating prescriptions...');
      
      let prescriptionCount = 0;
      for (const appointment of completedAppointments) {
        try {
          const prescription = await prisma.prescription.create({
            data: {
              patientId: appointment.patientId,
              doctorId: appointment.doctorId,
              appointmentId: appointment.id,
              diagnosis: 'Sample diagnosis for medical condition',
              notes: 'Take medication as prescribed. Follow up in 2 weeks.',
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              status: 'ACTIVE'
            }
          });
          
          // Add 1-3 medicines to prescription
          const numMedicines = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < numMedicines; i++) {
            const medicine = medicines[Math.floor(Math.random() * medicines.length)];
            
            await prisma.prescriptionItem.create({
              data: {
                prescriptionId: prescription.id,
                medicineId: medicine.id,
                dosage: '1 tablet',
                frequency: 'Twice daily',
                duration: '7 days',
                instructions: 'Take with food',
                quantity: 14
              }
            });
          }
          
          prescriptionCount++;
        } catch (error) {
          console.log(`Failed to create prescription: ${error.message}`);
        }
      }
      
      console.log(`✅ Created ${prescriptionCount} prescriptions`);
    }
    
    // Create some health metrics for patients
    console.log('Creating health metrics...');
    let metricsCount = 0;
    
    for (const patient of patients.slice(0, 10)) {
      try {
        // Blood pressure
        await prisma.healthMetric.create({
          data: {
            userId: patient.id,
            type: 'BLOOD_PRESSURE',
            value: 120 + Math.floor(Math.random() * 20),
            notes: 'Regular checkup measurement'
          }
        });
        
        // Weight
        await prisma.healthMetric.create({
          data: {
            userId: patient.id,
            type: 'WEIGHT',
            value: 60 + Math.floor(Math.random() * 40),
            notes: 'Weekly weight check'
          }
        });
        
        metricsCount += 2;
      } catch (error) {
        console.log(`Failed to create health metrics: ${error.message}`);
      }
    }
    
    console.log(`✅ Created ${metricsCount} health metrics`);
    
    // Create some notifications
    console.log('Creating notifications...');
    let notificationCount = 0;
    
    for (const patient of patients.slice(0, 15)) {
      try {
        await prisma.notification.create({
          data: {
            userId: patient.id,
            type: 'GENERAL',
            title: 'Welcome to MedCare',
            message: 'Thank you for choosing our healthcare platform. Stay healthy!',
            isRead: Math.random() < 0.3
          }
        });
        
        notificationCount++;
      } catch (error) {
        console.log(`Failed to create notification: ${error.message}`);
      }
    }
    
    console.log(`✅ Created ${notificationCount} notifications`);
    
    console.log('\n🎉 Sample data creation completed!');
    
    // Show final stats
    const finalStats = {
      users: await prisma.user.count(),
      doctors: await prisma.doctor.count(),
      patients: await prisma.patient.count(),
      appointments: await prisma.appointment.count(),
      medicines: await prisma.medicine.count(),
      prescriptions: await prisma.prescription.count(),
      healthMetrics: await prisma.healthMetric.count(),
      notifications: await prisma.notification.count()
    };
    
    console.log('\n📊 Final Database Stats:');
    Object.entries(finalStats).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData(); 