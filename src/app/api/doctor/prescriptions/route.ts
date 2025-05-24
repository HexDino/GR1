import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '@/lib/utils/apiError';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }

    if (userRole !== 'DOCTOR') {
      throw ApiError.forbidden('Only doctors can access this resource');
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const patientId = searchParams.get('patientId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const whereClause: any = {
      doctorId: userId,
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (patientId) {
      whereClause.patientId = patientId;
    }

    // Fetch prescriptions from database
    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
                         medicine: {
             select: {
               id: true,
               name: true,
               dosageForm: true,
               description: true,
             },
           },
            },
          },
          appointment: {
            select: {
              id: true,
              date: true,
              symptoms: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.prescription.count({
        where: whereClause,
      }),
    ]);

    // Transform data for frontend
    const transformedPrescriptions = prescriptions.map(prescription => ({
      id: prescription.id,
      patientName: prescription.patient.name,
      patientId: prescription.patientId,
      medications: prescription.items.map(item => ({
        name: item.medicine.name,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions || '',
      })),
      diagnosis: prescription.diagnosis,
      notes: prescription.notes || '',
      createdAt: prescription.createdAt.toISOString(),
      status: prescription.status,
      followUpDate: prescription.validUntil?.toISOString() || null,
    }));

    return NextResponse.json({
      success: true,
      prescriptions: transformedPrescriptions,
      total,
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < total,
      },
    });

  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch prescriptions',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }

    if (userRole !== 'DOCTOR') {
      throw ApiError.forbidden('Only doctors can create prescriptions');
    }

    const body = await request.json();
    const { patientId, diagnosis, notes, medications, followUpDate, appointmentId } = body;

    // Validate required fields
    if (!patientId || !diagnosis || !medications || medications.length === 0) {
      throw ApiError.validationError('Missing required fields: patientId, diagnosis, medications');
    }

    // Verify patient exists
    const patient = await prisma.user.findFirst({
      where: {
        id: patientId,
        role: 'PATIENT',
      },
    });

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    // Create prescription with items in a transaction
    const prescription = await prisma.$transaction(async (tx) => {
      // Create the prescription
      const newPrescription = await tx.prescription.create({
        data: {
          patientId,
          doctorId: userId,
          appointmentId: appointmentId || null,
          diagnosis,
          notes: notes || null,
          validUntil: followUpDate ? new Date(followUpDate) : null,
          status: 'ACTIVE',
        },
      });

      // Create prescription items
      for (const medication of medications) {
        // First, try to find existing medicine or create new one
        let medicine = await tx.medicine.findFirst({
          where: { name: medication.name },
        });

                 if (!medicine) {
           medicine = await tx.medicine.create({
             data: {
               name: medication.name,
               dosageForm: 'tablet', // Default dosage form
               strength: medication.dosage, // e.g., "500mg"
               description: `${medication.name} - ${medication.dosage}`,
             },
           });
         }

        // Create prescription item
        await tx.prescriptionItem.create({
          data: {
            prescriptionId: newPrescription.id,
            medicineId: medicine.id,
            dosage: medication.dosage,
            frequency: medication.frequency,
            duration: medication.duration,
            instructions: medication.instructions || null,
            quantity: medication.quantity || 1,
          },
        });
      }

      return newPrescription;
    });

    return NextResponse.json({
      success: true,
      message: 'Prescription created successfully',
      prescriptionId: prescription.id,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating prescription:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create prescription',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 