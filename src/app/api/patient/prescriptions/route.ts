import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(req: NextRequest) {
  try {
    // Get the user ID from the headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'active', 'completed', 'cancelled'
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build where clause
    let whereClause: any = {
      patientId: userId
    };
    
    // Filter by status if provided
    if (status) {
      whereClause.status = status.toUpperCase();
    }
    
    // Fetch prescriptions with doctor and items information
    const prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: {
        doctor: {
          select: {
            name: true
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    
    // Format the response
    const formattedPrescriptions = prescriptions.map(prescription => {
      const mainMedication = prescription.items[0]?.medicine?.name || 'Prescription';
      const medicationsCount = prescription.items.length;
      
      return {
        id: prescription.id,
        doctorName: prescription.doctor?.name || 'Unknown Doctor',
        mainMedication: mainMedication,
        medicationsCount: medicationsCount,
        createdAt: prescription.createdAt.toISOString(),
        status: prescription.status,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        items: prescription.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions,
          medicine: {
            name: item.medicine?.name || 'Unknown Medicine',
            genericName: item.medicine?.genericName,
            strength: item.medicine?.strength,
            dosageForm: item.medicine?.dosageForm
          }
        }))
      };
    });
    
    return NextResponse.json({
      success: true,
      prescriptions: formattedPrescriptions,
      total: prescriptions.length
    });
    
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    
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
  }
} 