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
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    // Get today's date at midnight for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get one week from now for upcoming appointments
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);

    // Fetch upcoming appointments (next 3)
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        patientId: userId,
        date: {
          gte: today
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      include: {
        doctorRelation: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            },
            department: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { date: 'asc' },
      take: 3
    });

    // Fetch recent prescriptions (last 3)
    const recentPrescriptions = await prisma.prescription.findMany({
      where: {
        patientId: userId
      },
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
                name: true
              }
            }
          },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    // Count stats
    const totalAppointments = await prisma.appointment.count({
      where: { patientId: userId }
    });

    const totalPrescriptions = await prisma.prescription.count({
      where: { patientId: userId }
    });

    const activePrescriptions = await prisma.prescription.count({
      where: {
        patientId: userId,
        status: 'ACTIVE'
      }
    });

    // Count unread notifications  
    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    });

    // Get average doctor rating from reviews
    const avgRating = await prisma.doctorReview.aggregate({
      where: {
        userId
      },
      _avg: {
        rating: true
      }
    });

    // Get recent health metrics from database
    const healthMetrics = await prisma.healthMetric.findMany({
      where: {
        userId: userId
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    // Transform health metrics to match frontend format
    const formattedHealthMetrics = healthMetrics.map(metric => ({
      id: metric.id,
      type: metric.type.toLowerCase().replace('_', '_'),
      value: metric.value.toString(),
      date: metric.createdAt.toISOString(),
      status: 'normal' as const // Default status
    }));

    // Get health alerts from notifications (urgent ones)
    const healthAlerts = await prisma.notification.findMany({
      where: {
        userId: userId,
        isRead: false,
        type: {
          in: ['PRESCRIPTION_REMINDER', 'APPOINTMENT_REMINDER', 'HEALTH_REPORT']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    // Transform alerts to match frontend format
    const formattedHealthAlerts = healthAlerts.map(alert => ({
      id: alert.id,
      type: alert.type.toLowerCase().includes('prescription') ? 'medication' : 
            alert.type.toLowerCase().includes('appointment') ? 'appointment' : 'checkup',
      title: alert.title,
      message: alert.message,
      severity: 'medium' as const,
      date: alert.createdAt.toISOString(),
      read: alert.isRead
    }));

    // Format upcoming appointments
    const formattedUpcoming = upcomingAppointments.map(appointment => {
      const appointmentDate = new Date(appointment.date);
      const timeString = appointmentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      
      return {
        id: appointment.id,
        doctorName: appointment.doctorRelation?.user?.name || 'Unknown Doctor',
        doctorSpecialty: appointment.doctorRelation?.specialization || appointment.doctorRelation?.department?.name || 'General',
        doctorAvatar: appointment.doctorRelation?.user?.avatar,
        date: appointment.date.toISOString(),
        time: timeString,
        status: appointment.status,
        type: appointment.type || 'In-person',
        formattedDate: appointmentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        formattedTime: timeString
      };
    });

    // Format recent prescriptions
    const formattedPrescriptions = recentPrescriptions.map(prescription => ({
      id: prescription.id,
      doctorName: prescription.doctor?.name || 'Unknown Doctor',
      diagnosis: prescription.diagnosis,
      medications: prescription.items.map(item => item.medicine?.name || 'Unknown').slice(0, 2),
      medicationCount: prescription.items.length,
      status: prescription.status,
      createdAt: prescription.createdAt.toISOString(),
      formattedDate: prescription.createdAt.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));

    return NextResponse.json({
      success: true,
      dashboardStats: {
        upcomingAppointments: formattedUpcoming.length,
        totalAppointments,
        totalPrescriptions,
        activePrescriptions,
        averageRating: avgRating._avg?.rating || 0,
        unreadNotifications
      },
      upcomingAppointments: formattedUpcoming,
      recentPrescriptions: formattedPrescriptions,
      healthAlerts: formattedHealthAlerts,
      healthMetrics: formattedHealthMetrics,
      quickStats: {
        nextAppointment: formattedUpcoming.length > 0 ? formattedUpcoming[0] : null,
        activeMedications: activePrescriptions,
        lastVisit: totalAppointments > 0 ? 'Last week' : 'No visits yet', // Placeholder
        healthScore: 0 // Will be calculated by separate API
      },
      healthTips: [] // No health tips in current schema
    });
    
  } catch (error) {
    console.error('Error fetching patient dashboard:', error);
    
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
        message: 'Failed to fetch dashboard data',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 