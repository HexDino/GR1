import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    const { id } = params;

    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        prescriptionItems: {
          select: {
            id: true,
            prescriptionId: true,
            prescription: {
              select: {
                createdAt: true,
                patientId: true,
                patient: {
                  select: {
                    name: true
                  }
                },
                doctorId: true,
                doctor: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!medicine) {
      throw ApiError.notFound('Medicine not found');
    }

    return NextResponse.json({
      success: true,
      medicine
    });
    
  } catch (error) {
    console.error('Error fetching medicine details:', error);
    
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
        message: 'Failed to fetch medicine details',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    const { id } = params;
    const body = await req.json();
    const { name, genericName, dosageForm, strength, description } = body;

    // Validate required fields
    if (!name || !dosageForm) {
      throw ApiError.validationError('Missing required fields');
    }

    // Check if medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id }
    });

    if (!medicine) {
      throw ApiError.notFound('Medicine not found');
    }

    // Check if another medicine with the same name exists (excluding current one)
    if (name !== medicine.name) {
      const existingMedicine = await prisma.medicine.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          id: { not: id }
        }
      });

      if (existingMedicine) {
        throw ApiError.badRequest('Another medicine with this name already exists');
      }
    }

    // Update medicine
    const updatedMedicine = await prisma.medicine.update({
      where: { id },
      data: {
        name,
        genericName: genericName || null,
        dosageForm,
        strength: strength || null,
        description: description || null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Medicine updated successfully',
      medicine: updatedMedicine
    });
    
  } catch (error) {
    console.error('Error updating medicine:', error);
    
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
        message: 'Failed to update medicine',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    const { id } = params;

    // Check if medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        prescriptionItems: {
          select: { id: true }
        }
      }
    });

    if (!medicine) {
      throw ApiError.notFound('Medicine not found');
    }

    // Check if medicine is used in any prescriptions
    if (medicine.prescriptionItems.length > 0) {
      throw ApiError.badRequest('Cannot delete medicine that is used in prescriptions');
    }

    // Delete medicine
    await prisma.medicine.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting medicine:', error);
    
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
        message: 'Failed to delete medicine',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 