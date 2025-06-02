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
    
    // Only allow ADMIN users to access this endpoint
    if (userRole !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    // Get query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const sortField = url.searchParams.get('sort') || 'name';
    const sortDirection = url.searchParams.get('direction') || 'asc';
    const search = url.searchParams.get('search') || '';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build the filter conditions
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Define sort order
    const orderBy: any = {};
    orderBy[sortField] = sortDirection;

    // Use transaction to get medicines and count in a single database operation
    const [medicines, totalMedicines] = await prisma.$transaction([
      prisma.medicine.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.medicine.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      medicines,
      pagination: {
        page,
        limit,
        totalMedicines,
        totalPages: Math.ceil(totalMedicines / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching medicines:', error);
    
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
        message: 'Failed to fetch medicines',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the user ID from the headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    // Only allow ADMIN users to access this endpoint
    if (userRole !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    // Parse request body
    const body = await req.json();
    const { name, genericName, dosageForm, strength, description } = body;

    // Validate required fields
    if (!name || !dosageForm) {
      throw ApiError.validationError('Missing required fields');
    }

    // Check if medicine with same name already exists
    const existingMedicine = await prisma.medicine.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existingMedicine) {
      throw ApiError.badRequest('Medicine with this name already exists');
    }

    // Create new medicine
    const medicine = await prisma.medicine.create({
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
      message: 'Medicine created successfully',
      medicine
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating medicine:', error);
    
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
        message: 'Failed to create medicine',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 