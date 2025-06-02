import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';
import { z } from 'zod';

// Schema for report validation
const reportSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  details: z.string().optional(),
});

// POST /api/doctor/reviews/report - Report inappropriate review
export async function POST(request: NextRequest) {
  try {
    // Get the user ID from the headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'DOCTOR' && userRole !== 'ADMIN') {
      throw ApiError.forbidden('Only doctors and admins can report reviews');
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate report data
    const validationResult = reportSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      throw ApiError.badRequest(`Invalid report data: ${errorMessage}`);
    }
    
    const reportData = validationResult.data;
    
    // Check if review exists
    const review = await prisma.doctorReview.findUnique({
      where: { id: reportData.reviewId }
    });
    
    if (!review) {
      throw ApiError.notFound('Review not found');
    }
    
    // If doctor is reporting, check if the review is about them
    if (userRole === 'DOCTOR') {
      const doctor = await prisma.doctor.findFirst({
        where: { userId }
      });
      
      if (!doctor) {
        throw ApiError.notFound('Doctor profile not found');
      }
      
      if (review.doctorId !== doctor.id) {
        throw ApiError.forbidden('You can only report reviews about yourself');
      }
    }
    
    // Check if user already reported this review
    const existingReport = await prisma.reviewReport.findFirst({
      where: {
        reviewId: reportData.reviewId,
        reportedBy: userId
      }
    });
    
    if (existingReport) {
      throw ApiError.badRequest('You have already reported this review');
    }
    
    // Create report in database
    const report = await prisma.reviewReport.create({
      data: {
        reviewId: reportData.reviewId,
        reportedBy: userId,
        reason: reportData.reason,
        details: reportData.details || null,
        status: 'PENDING'
      }
    });
    
    // Notify admins
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    
    // Create notifications for admins
    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'GENERAL',
          title: 'Review Reported',
          message: `A review has been reported for inappropriate content. Reason: ${reportData.reason}`,
          isRead: false
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Review reported successfully. Our team will review it shortly.',
      reportId: report.id
    });
    
  } catch (error) {
    console.error('Error reporting review:', error);
    
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
        message: 'Failed to report review',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 