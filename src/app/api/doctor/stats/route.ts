import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    // Get the auth token from cookie
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify the token
    const payload = await verifyToken(token);
    
    // Get the doctor ID
    const userId = payload.userId;
    
    // SPECIAL CASE: For test doctor account
    if (userId === 'test-doctor-id') {
      console.log('[DOCTOR STATS API] Using test doctor account');
      
      // Return mock stats for test account
      return NextResponse.json({
        patientsCount: 1245,
        appointmentsCount: 78,
        rating: 4.8,
        reviewCount: 102,
        earnings: 12350,
        earningsIncrease: 8.1,
        totalAppointments: 156,
        todayAppointments: 8,
        upcomingAppointments: 24,
        completedAppointments: 132,
        charts: {
          weeklyAppointments: {
            data: [5, 12, 8, 15, 10, 6, 8],
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          monthlyRevenue: {
            data: [1200, 1800, 1500, 2200, 1800, 2500],
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
          },
          patientDemographics: {
            data: [25, 40, 15, 20],
            labels: ['0-18', '19-35', '36-55', '56+']
          }
        }
      });
    }
    
    // For real doctors, fetch the data from the database
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: true
      }
    });
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date at midnight
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Count patient appointments
    const patientCount = await prisma.patient.count();
    
    // Count appointments
    const totalAppointments = await prisma.appointment.count({
      where: {
        doctorId: doctor.id
      }
    });
    
    // Count upcoming appointments (scheduled for future dates)
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        date: {
          gt: new Date()
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });
    
    // Count today's appointments
    const todayAppointments = await prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    // Count completed appointments
    const completedAppointments = await prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        status: 'COMPLETED'
      }
    });
    
    // Get doctor's rating
    const rating = doctor.rating || 0;
    
    // Count total reviews
    const reviewCount = doctor.totalReviews || 0;
    
    // Calculate earnings (in a real application, this would be more complex)
    const completedAppointmentsWithFee = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: 'COMPLETED'
      },
      select: {
        date: true
      }
    });
    
    // Convert Decimal to number for calculation
    const consultationFee = doctor.consultationFee ? Number(doctor.consultationFee) : 0;
    const earnings = completedAppointmentsWithFee.length * consultationFee;
    
    // For simplicity, we'll use mock data for charts
    // In a real application, this would be calculated from actual data
    
    return NextResponse.json({
      patientsCount: patientCount,
      appointmentsCount: totalAppointments,
      rating,
      reviewCount,
      earnings,
      earningsIncrease: 5.2, // Mock data
      totalAppointments,
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      charts: {
        weeklyAppointments: {
          data: [5, 7, 10, 8, 12, 6, 8], // Mock data
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        monthlyRevenue: {
          data: [1000, 1500, 1200, 1800, 2000, 2200], // Mock data
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        patientDemographics: {
          data: [20, 35, 25, 20], // Mock data
          labels: ['0-18', '19-35', '36-55', '56+']
        }
      }
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor stats' },
      { status: 500 }
    );
  }
} 