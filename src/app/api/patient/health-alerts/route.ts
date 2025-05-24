import { NextRequest, NextResponse } from 'next/server';

// Mock health alerts data
const mockHealthAlerts = [
  {
    id: '1',
    type: 'medication',
    title: 'Medication Reminder',
    message: 'Time to take your blood pressure medication (Lisinopril 10mg)',
    severity: 'medium',
    date: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    read: false
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'You have a follow-up appointment with Dr. Smith tomorrow at 2:00 PM',
    severity: 'high',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false
  },
  {
    id: '3',
    type: 'goal',
    title: 'Goal Progress Update',
    message: 'Great job! You\'ve completed 75% of your weekly exercise goal',
    severity: 'low',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    read: true
  },
  {
    id: '4',
    type: 'checkup',
    title: 'Health Check Reminder',
    message: 'It\'s time for your monthly blood pressure check. Please record your readings.',
    severity: 'medium',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    read: false
  },
  {
    id: '5',
    type: 'medication',
    title: 'Prescription Refill',
    message: 'Your prescription for Metformin is running low. Contact your pharmacy for a refill.',
    severity: 'high',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    read: false
  },
  {
    id: '6',
    type: 'goal',
    title: 'Weight Goal Achievement',
    message: 'Congratulations! You\'ve reached your first weight loss milestone of 2kg',
    severity: 'low',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true
  },
  {
    id: '7',
    type: 'appointment',
    title: 'Lab Results Available',
    message: 'Your recent blood test results are now available. Please review them in your medical records.',
    severity: 'medium',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    read: true
  }
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      alerts: mockHealthAlerts
    });
  } catch (error) {
    console.error('Error fetching health alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health alerts' },
      { status: 500 }
    );
  }
} 