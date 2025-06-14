import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';
import { AppointmentStatus } from '@prisma/client';

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
    const statusFilter = searchParams.get('status');
    const dateFilter = searchParams.get('date'); // 'today', 'tomorrow', 'this_week', specific date
    const sortBy = searchParams.get('sortBy') || 'date'; // 'date', 'status', 'patient'
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // 'asc', 'desc'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const patientSearch = searchParams.get('patientSearch');
    
    console.log('[DOCTOR APPOINTMENTS API] Fetching appointments for doctor:', userId);
    console.log('[DOCTOR APPOINTMENTS API] Query params:', { 
      statusFilter, 
      dateFilter, 
      sortBy, 
      sortOrder, 
      limit, 
      offset,
      patientSearch
    });

    try {
      // Build where clause
      const whereClause: any = {
        doctorId: userId
      };

      // Add status filter
      if (statusFilter && statusFilter !== 'all') {
        whereClause.status = statusFilter.toUpperCase() as AppointmentStatus;
      }

      // Add patient search filter
      if (patientSearch) {
        whereClause.patient = {
          name: {
            contains: patientSearch,
            mode: 'insensitive'
          }
        };
      }

      // Add date filter
      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        whereClause.date = {
          gte: today,
          lt: tomorrow
        };
      } else if (dateFilter === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);
        
        whereClause.date = {
          gte: tomorrow,
          lt: dayAfter
        };
      } else if (dateFilter === 'this_week') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
        
        whereClause.date = {
          gte: today,
          lt: endOfWeek
        };
      } else if (dateFilter === 'upcoming') {
        const now = new Date();
        whereClause.date = {
          gte: now
        };
      } else if (dateFilter && dateFilter !== 'all') {
        // Handle specific date format
        const targetDate = new Date(dateFilter);
        if (!isNaN(targetDate.getTime())) {
          targetDate.setHours(0, 0, 0, 0);
          const nextDay = new Date(targetDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          whereClause.date = {
            gte: targetDate,
            lt: nextDay
          };
        }
      }

      // Build order by clause
      let orderBy: any = {};
      switch (sortBy) {
        case 'patient':
          orderBy = { patient: { name: sortOrder } };
          break;
        case 'status':
          orderBy = { status: sortOrder };
          break;
        case 'date':
        default:
          orderBy = [
            { date: sortOrder },
            { createdAt: 'asc' }
          ];
          break;
      }

      console.log('[DOCTOR APPOINTMENTS API] Query where clause:', whereClause);

      // Fetch appointments from database
      const [appointments, totalCount] = await Promise.all([
        prisma.appointment.findMany({
          where: whereClause,
          include: {
            patient: {
              select: {
                name: true,
                email: true,
                avatar: true,
                phone: true
              }
            },
            doctor: {
              select: {
                name: true
              }
            }
          },
          orderBy: orderBy,
          skip: offset,
          take: limit
        }),
        prisma.appointment.count({
          where: whereClause
        })
      ]);

      console.log('[DOCTOR APPOINTMENTS API] Found appointments:', appointments.length);

      // Format appointments for response
      const formattedAppointments = appointments.map(appointment => {
        // Extract time from date
        const appointmentTime = appointment.date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        // Vietnamese status mapping
        const statusMapping: Record<AppointmentStatus, string> = {
          PENDING: 'Chờ xác nhận',
          CONFIRMED: 'Đã xác nhận',
          COMPLETED: 'Hoàn thành',
          CANCELLED: 'Đã hủy',
          MISSED: 'Không đến'
        };

        return {
          id: appointment.id,
          time: appointmentTime,
          patient: {
            name: appointment.patient.name,
            email: appointment.patient.email,
            avatar: appointment.patient.avatar,
            phone: appointment.patient.phone
          },
          service: appointment.type || 'Khám tổng quát',
          symptoms: appointment.symptoms || 'Chưa có thông tin',
          status: appointment.status,
          statusText: statusMapping[appointment.status] || appointment.status,
          date: appointment.date.toISOString(),
          dateText: appointment.date.toLocaleDateString('vi-VN'),
          notes: appointment.notes,
          diagnosis: appointment.diagnosis,
          duration: 30, // Default duration
          priority: 'NORMAL', // Default priority
          createdAt: appointment.createdAt.toISOString(),
          updatedAt: appointment.updatedAt.toISOString()
        };
      });

      // Add pagination info
      const pagination = {
        total: totalCount,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: offset + limit < totalCount,
        hasPrev: offset > 0
      };

      return NextResponse.json({
        success: true,
        appointments: formattedAppointments,
        pagination,
        summary: {
          total: totalCount,
          pending: appointments.filter(a => a.status === 'PENDING').length,
          confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
          completed: appointments.filter(a => a.status === 'COMPLETED').length,
          cancelled: appointments.filter(a => a.status === 'CANCELLED').length
        }
      });

    } catch (dbError) {
      console.error('[DOCTOR APPOINTMENTS API] Database error:', dbError);
      
      // Return database error instead of using mock data
      return NextResponse.json(
        {
          success: false,
          message: 'Database error when fetching appointments',
          error: process.env.NODE_ENV !== 'production' ? String(dbError) : undefined,
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    
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
        message: 'Failed to fetch appointments',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 