const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAppointments() {
  try {
    console.log('Testing appointments seed...');
    
    // Check patients and doctors
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' }
    });
    
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' }
    });
    
    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);
    
    if (patients.length === 0 || doctors.length === 0) {
      console.log('Not enough users to create appointments');
      return;
    }
    
    // Try creating a single appointment
    const patient = patients[0];
    const doctor = doctors[0];
    
    console.log(`Testing with patient: ${patient.email} and doctor: ${doctor.email}`);
    
    const testAppointment = {
      patientId: patient.id,
      doctorId: doctor.id,
      date: new Date(),
      status: 'PENDING',
      type: 'IN_PERSON',
      symptoms: 'Test symptoms'
    };
    
    console.log('Creating test appointment...');
    
    const result = await prisma.appointment.create({
      data: testAppointment
    });
    
    console.log('✅ Successfully created appointment:', result.id);
    
    // Clean up
    await prisma.appointment.delete({
      where: { id: result.id }
    });
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    if (error.meta) {
      console.error('Meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAppointments(); 