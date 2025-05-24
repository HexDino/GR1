import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    const { id: prescriptionId } = await params;

    // Fetch prescription with detailed information
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        patientId: userId
      },
      include: {
        doctor: {
          select: {
            name: true,
            avatar: true
          }
        },
        items: {
          include: {
            medicine: {
              select: {
                name: true,
                genericName: true,
                strength: true,
                dosageForm: true
              }
            }
          }
        },
        appointment: {
          select: {
            id: true
          }
        }
      }
    });

    if (!prescription) {
      throw ApiError.notFound('Prescription not found');
    }

    // Format the response
    const formattedPrescription = {
      id: prescription.id,
      doctorName: prescription.doctor?.name || 'Unknown Doctor',
      doctorSpecialty: 'General', // This info is not available in prescription relation
      doctorAvatar: prescription.doctor?.avatar,
      diagnosis: prescription.diagnosis,
      notes: prescription.notes,
      medications: prescription.items.map((item: any) => ({
        id: item.id,
        name: item.medicine?.name || 'Unknown Medicine',
        genericName: item.medicine?.genericName,
        strength: item.medicine?.strength,
        dosageForm: item.medicine?.dosageForm,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
        quantity: item.quantity
      })),
      createdAt: prescription.createdAt.toISOString(),
      status: prescription.status,
      formattedDate: prescription.createdAt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      appointmentId: prescription.appointment?.id
    };

    return NextResponse.json(formattedPrescription);
    
  } catch (error) {
    console.error('Error fetching prescription details:', error);
    
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
        message: 'Failed to fetch prescription details',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 