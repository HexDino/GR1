import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

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
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name'; // 'name', 'lastVisit', 'appointmentCount'
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // 'asc', 'desc'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    console.log('[DOCTOR PATIENTS API] Fetching patients for doctor:', userId);

    try {
      // Build where clause for patients who have appointments with this doctor
      const whereClause: any = {
        appointments: {
          some: {
            doctorId: userId
          }
        }
      };

      // Add search filter
      if (search) {
        whereClause.OR = [
          {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            phone: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ];
      }

      // Build order by clause
      let orderBy: any = {};
      switch (sortBy) {
        case 'lastVisit':
          orderBy = { updatedAt: sortOrder };
          break;
        case 'name':
        default:
          orderBy = { name: sortOrder };
          break;
      }

      console.log('[DOCTOR PATIENTS API] Query where clause:', whereClause);

      // Fetch patients from database
      const [patients, totalCount] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          include: {
            appointments: {
              where: {
                doctorId: userId
              },
              orderBy: {
                date: 'desc'
              },
              take: 1, // Get latest appointment
              select: {
                date: true,
                status: true,
                diagnosis: true,
                symptoms: true
              }
            },
            _count: {
              select: {
                appointments: {
                  where: {
                    doctorId: userId
                  }
                }
              }
            }
          },
          orderBy: orderBy,
          skip: offset,
          take: limit
        }),
        prisma.user.count({
          where: whereClause
        })
      ]);

      console.log('[DOCTOR PATIENTS API] Found patients:', patients.length);

      // Format patients for response
      const formattedPatients = patients.map(patient => {
        const lastAppointment = patient.appointments[0];
        
        return {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          avatar: patient.avatar,
          lastVisit: lastAppointment ? lastAppointment.date.toISOString() : null,
          lastVisitText: lastAppointment ? lastAppointment.date.toLocaleDateString('en-US') : 'No visits',
          lastDiagnosis: lastAppointment?.diagnosis || 'No diagnosis',
          lastSymptoms: lastAppointment?.symptoms || 'No symptoms recorded',
          appointmentCount: patient._count.appointments,
          lastStatus: lastAppointment?.status || null,
          createdAt: patient.createdAt.toISOString(),
          updatedAt: patient.updatedAt.toISOString()
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
        patients: formattedPatients,
        pagination,
        summary: {
          total: totalCount,
          activePatients: formattedPatients.filter(p => p.lastVisit && new Date(p.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
          newPatients: formattedPatients.filter(p => p.appointmentCount === 1).length
        }
      });

    } catch (dbError) {
      console.error('[DOCTOR PATIENTS API] Database error:', dbError);
      
      // Return database error instead of using mock data
      return NextResponse.json(
        {
          success: false,
          message: 'Database error when fetching patients',
          error: process.env.NODE_ENV !== 'production' ? String(dbError) : undefined,
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    
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
        message: 'Failed to fetch patients',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 