import { NextRequest, NextResponse } from 'next/server';

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    title: 'Appointment Reminder',
    message: 'You have an appointment with Dr. Smith tomorrow at 2:00 PM. Please arrive 15 minutes early.',
    type: 'appointment',
    severity: 'high',
    read: false,
    actionRequired: true,
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    scheduledFor: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(), // tomorrow
    metadata: {
      appointmentId: 'apt_123',
      doctorName: 'Dr. Smith'
    }
  },
  {
    id: '2',
    title: 'Medication Reminder',
    message: 'Time to take your evening medication: Lisinopril 10mg',
    type: 'medication',
    severity: 'medium',
    read: false,
    actionRequired: true,
    date: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    metadata: {
      medicationId: 'med_456'
    }
  },
  {
    id: '3',
    title: 'Health Goal Achievement',
    message: 'Congratulations! You\'ve completed 75% of your weekly exercise goal. Keep up the great work!',
    type: 'goal',
    severity: 'low',
    read: true,
    actionRequired: false,
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    metadata: {
      goalId: 'goal_789'
    }
  },
  {
    id: '4',
    title: 'Test Results Available',
    message: 'Your blood test results from last week are now available. Please review them in your medical records.',
    type: 'test_result',
    severity: 'medium',
    read: false,
    actionRequired: true,
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: '5',
    title: 'Prescription Refill Needed',
    message: 'Your prescription for Metformin is running low (3 days remaining). Please contact your pharmacy for a refill.',
    type: 'prescription',
    severity: 'high',
    read: false,
    actionRequired: true,
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    metadata: {
      prescriptionId: 'presc_101'
    }
  },
  {
    id: '6',
    title: 'Health Tip of the Day',
    message: 'Did you know? Drinking water first thing in the morning can help boost your metabolism and improve digestion.',
    type: 'health_reminder',
    severity: 'low',
    read: true,
    actionRequired: false,
    date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
  },
  {
    id: '7',
    title: 'Monthly Health Check',
    message: 'It\'s time for your monthly blood pressure and weight check. Please record your measurements.',
    type: 'health_reminder',
    severity: 'medium',
    read: false,
    actionRequired: true,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '8',
    title: 'System Update',
    message: 'We\'ve updated our patient portal with new features. Check out the improved health dashboard!',
    type: 'system',
    severity: 'low',
    read: true,
    actionRequired: false,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: '9',
    title: 'Weight Goal Milestone',
    message: 'Amazing progress! You\'ve lost 2kg towards your goal of 5kg. You\'re 40% of the way there!',
    type: 'goal',
    severity: 'low',
    read: true,
    actionRequired: false,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    metadata: {
      goalId: 'goal_789'
    }
  },
  {
    id: '10',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Johnson on Friday at 10:00 AM has been confirmed.',
    type: 'appointment',
    severity: 'low',
    read: true,
    actionRequired: false,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    metadata: {
      appointmentId: 'apt_456',
      doctorName: 'Dr. Johnson'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'all';
    const type = searchParams.get('type') || 'all';
    const search = searchParams.get('search') || '';

    let filteredNotifications = mockNotifications;

    // Filter by tab
    switch (tab) {
      case 'unread':
        filteredNotifications = filteredNotifications.filter(n => !n.read);
        break;
      case 'reminders':
        filteredNotifications = filteredNotifications.filter(n => n.actionRequired);
        break;
      // 'all' shows everything
    }

    // Filter by type
    if (type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredNotifications = filteredNotifications.filter(n => 
        n.title.toLowerCase().includes(searchLower) || 
        n.message.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    filteredNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
} 