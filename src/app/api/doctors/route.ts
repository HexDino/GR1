import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const available = searchParams.get('available');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('[DOCTORS API] Fetching doctors list');

    // Mock doctors data
    const doctors = [
      {
        id: 'test-doctor-id',
        name: 'Dr. Smith',
        specialization: 'Cardiology',
        avatar: null,
        rating: 4.8,
        totalReviews: 45,
        consultationFee: 150,
        isAvailable: true
      },
      {
        id: 'doctor-2',
        name: 'Dr. Johnson',
        specialization: 'Neurology',
        avatar: null,
        rating: 4.6,
        totalReviews: 32,
        consultationFee: 200,
        isAvailable: true
      },
      {
        id: 'doctor-3',
        name: 'Dr. Williams',
        specialization: 'Dermatology',
        avatar: null,
        rating: 4.9,
        totalReviews: 67,
        consultationFee: 120,
        isAvailable: true
      },
      {
        id: 'doctor-4',
        name: 'Dr. Brown',
        specialization: 'Pediatrics',
        avatar: null,
        rating: 4.7,
        totalReviews: 89,
        consultationFee: 100,
        isAvailable: false
      }
    ];

    // Filter by availability if requested
    let filteredDoctors = doctors;
    if (available === 'true') {
      filteredDoctors = doctors.filter(doc => doc.isAvailable);
    }

    // Apply limit
    const result = filteredDoctors.slice(0, limit);

    return NextResponse.json({
      success: true,
      doctors: result,
      total: result.length
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    
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
        message: 'Failed to fetch doctors',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 