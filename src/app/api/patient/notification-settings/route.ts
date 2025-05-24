import { NextRequest, NextResponse } from 'next/server';

// Mock notification settings
let mockNotificationSettings = {
  appointmentReminders: true,
  medicationReminders: true,
  healthTips: true,
  testResults: true,
  goalUpdates: true,
  systemUpdates: true,
  emailNotifications: true,
  smsNotifications: false,
  reminderAdvance: 24 // hours before appointment
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      settings: mockNotificationSettings
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Update settings with provided values
    mockNotificationSettings = {
      ...mockNotificationSettings,
      ...body
    };

    return NextResponse.json({
      success: true,
      settings: mockNotificationSettings,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
} 