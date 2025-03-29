import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import { 
  sendAppointmentReminders,
  sendReviewReminders,
  updateMissedAppointments
} from '@/lib/services/appointment'
import { JWTPayload } from '@/lib/auth/types'

// Run scheduled tasks
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  // Only admin users can trigger scheduled tasks
  if (auth.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  try {
    const { task } = await request.json()
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task parameter is required' },
        { status: 400 }
      )
    }
    
    let result
    
    switch (task) {
      case 'SEND_APPOINTMENT_REMINDERS':
        result = await sendAppointmentReminders()
        break
      case 'SEND_REVIEW_REMINDERS':
        result = await sendReviewReminders()
        break
      case 'UPDATE_MISSED_APPOINTMENTS':
        result = await updateMissedAppointments()
        break
      default:
        return NextResponse.json(
          { error: 'Invalid task specified' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      task,
      result,
    })
  } catch (error) {
    console.error('Error running scheduled task:', error)
    return NextResponse.json(
      { error: 'Failed to run scheduled task' },
      { status: 500 }
    )
  }
} 