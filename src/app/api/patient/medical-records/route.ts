import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'appointment', 'prescription', 'test_result', 'diagnosis'
    const search = searchParams.get('search');
    const dateRange = searchParams.get('dateRange'); // 'last_month', 'last_3_months', 'last_year'
    const limit = parseInt(searchParams.get('limit') || '100');

    // Calculate date filter
    let dateFilter: Date | undefined;
    if (dateRange) {
      const now = new Date();
      switch (dateRange) {
        case 'last_month':
          dateFilter = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'last_3_months':
          dateFilter = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case 'last_year':
          dateFilter = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
      }
    }

    const records: any[] = [];

    // Fetch appointments if type is 'all' or 'appointment'
    if (!type || type === 'all' || type === 'appointment') {
      const appointments = await prisma.appointment.findMany({
        where: {
          patientId: userId,
          ...(dateFilter && { date: { gte: dateFilter } })
        },
        include: {
          doctorRelation: {
            include: {
              user: {
                select: {
                  name: true
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
        orderBy: { date: 'desc' },
        take: type === 'appointment' ? limit : Math.floor(limit / 3)
      });

      for (const appointment of appointments) {
        const record = {
          id: `apt_${appointment.id}`,
          type: 'appointment' as const,
          title: `Appointment with Dr. ${appointment.doctorRelation?.user?.name || 'Unknown'}`,
          doctorName: appointment.doctorRelation?.user?.name || 'Unknown Doctor',
          doctorSpecialty: appointment.doctorRelation?.specialization || appointment.doctorRelation?.department?.name || 'General',
          date: appointment.date.toISOString(),
          content: `${appointment.symptoms ? `Symptoms: ${appointment.symptoms}. ` : ''}${appointment.diagnosis ? `Diagnosis: ${appointment.diagnosis}. ` : ''}${appointment.notes ? `Notes: ${appointment.notes}` : 'General consultation.'}`,
          status: appointment.status,
          tags: [appointment.type || 'In-person', appointment.status]
        };

        // Apply search filter
        if (!search || 
            record.title.toLowerCase().includes(search.toLowerCase()) ||
            record.doctorName.toLowerCase().includes(search.toLowerCase()) ||
            record.doctorSpecialty.toLowerCase().includes(search.toLowerCase()) ||
            record.content.toLowerCase().includes(search.toLowerCase())) {
          records.push(record);
        }
      }
    }

    // Fetch prescriptions if type is 'all' or 'prescription'
    if (!type || type === 'all' || type === 'prescription') {
      const prescriptions = await prisma.prescription.findMany({
        where: {
          patientId: userId,
          ...(dateFilter && { createdAt: { gte: dateFilter } })
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
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'prescription' ? limit : Math.floor(limit / 3)
      });

      for (const prescription of prescriptions) {
        const medications = prescription.items.map(item => item.medicine?.name || 'Unknown medication').join(', ');
        const record = {
          id: `prs_${prescription.id}`,
          type: 'prescription' as const,
          title: `Prescription from Dr. ${prescription.doctor?.name || 'Unknown'}`,
          doctorName: prescription.doctor?.name || 'Unknown Doctor',
          doctorSpecialty: 'General', // Prescription doesn't have specialty info
          date: prescription.createdAt.toISOString(),
          content: `${prescription.diagnosis ? `Diagnosis: ${prescription.diagnosis}. ` : ''}Medications: ${medications}. ${prescription.notes ? `Additional notes: ${prescription.notes}` : ''}`,
          status: prescription.status,
          tags: ['Prescription', prescription.status, ...(prescription.items.length > 0 ? [`${prescription.items.length} medications`] : [])]
        };

        // Apply search filter
        if (!search || 
            record.title.toLowerCase().includes(search.toLowerCase()) ||
            record.doctorName.toLowerCase().includes(search.toLowerCase()) ||
            record.content.toLowerCase().includes(search.toLowerCase()) ||
            medications.toLowerCase().includes(search.toLowerCase())) {
          records.push(record);
        }
      }
    }

    // Add mock test results and diagnoses for demonstration
    if (!type || type === 'all' || type === 'test_result') {
      // These would come from a TestResult table in a real application
      const mockTestResults = [
        {
          id: 'test_001',
          type: 'test_result' as const,
          title: 'Blood Test Results',
          doctorName: 'Sarah Johnson',
          doctorSpecialty: 'Internal Medicine',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          content: 'Complete blood count and lipid panel. All values within normal range. Cholesterol: 180 mg/dL, Blood sugar: 90 mg/dL.',
          status: 'COMPLETED',
          tags: ['Blood Test', 'Normal', 'Lab Results']
        },
        {
          id: 'test_002',
          type: 'test_result' as const,
          title: 'X-Ray Chest',
          doctorName: 'Michael Chen',
          doctorSpecialty: 'Radiology',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
          content: 'Chest X-ray shows clear lungs with no signs of infection or abnormalities. Heart size normal.',
          status: 'COMPLETED',
          tags: ['X-Ray', 'Clear', 'Imaging']
        }
      ];

      for (const testResult of mockTestResults) {
        if (!dateFilter || new Date(testResult.date) >= dateFilter) {
          if (!search || 
              testResult.title.toLowerCase().includes(search.toLowerCase()) ||
              testResult.doctorName.toLowerCase().includes(search.toLowerCase()) ||
              testResult.content.toLowerCase().includes(search.toLowerCase())) {
            records.push(testResult);
          }
        }
      }
    }

    if (!type || type === 'all' || type === 'diagnosis') {
      // These would come from a Diagnosis table in a real application
      const mockDiagnoses = [
        {
          id: 'diag_001',
          type: 'diagnosis' as const,
          title: 'Hypertension Management',
          doctorName: 'Sarah Johnson',
          doctorSpecialty: 'Internal Medicine',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          content: 'Diagnosed with stage 1 hypertension. Recommended lifestyle changes including reduced sodium intake and regular exercise. Follow-up in 3 months.',
          status: 'ACTIVE',
          tags: ['Chronic', 'Hypertension', 'Lifestyle']
        }
      ];

      for (const diagnosis of mockDiagnoses) {
        if (!dateFilter || new Date(diagnosis.date) >= dateFilter) {
          if (!search || 
              diagnosis.title.toLowerCase().includes(search.toLowerCase()) ||
              diagnosis.doctorName.toLowerCase().includes(search.toLowerCase()) ||
              diagnosis.content.toLowerCase().includes(search.toLowerCase())) {
            records.push(diagnosis);
          }
        }
      }
    }

    // Sort records by date (newest first) and limit
    const sortedRecords = records
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      records: sortedRecords,
      total: sortedRecords.length,
      hasMore: records.length > limit
    });
    
  } catch (error) {
    console.error('Error fetching patient medical records:', error);
    
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
        message: 'Failed to fetch medical records',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}