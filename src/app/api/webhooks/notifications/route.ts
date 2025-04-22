import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    // Get the webhook secret from headers for verification
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = process.env.NOTIFICATION_WEBHOOK_SECRET;
    
    // Verify the webhook secret
    if (!webhookSecret || webhookSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    if (!body || !body.type || !body.userId || !body.title || !body.message) {
      console.error('Invalid webhook payload', body);
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    
    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        userId: body.userId,
        type: body.type,
        title: body.title,
        message: body.message,
        isRead: false
      }
    });
    
    console.log(`Created notification id: ${notification.id}`);
    
    // Return success
    return NextResponse.json({ success: true, notificationId: notification.id });
  } catch (error) {
    console.error('Error processing notification webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle verification requests
export async function GET(req: NextRequest) {
  try {
    // Get the verification token from query parameters
    const searchParams = req.nextUrl.searchParams;
    const verifyToken = searchParams.get('verify_token');
    const challenge = searchParams.get('challenge');
    
    // Verify the token
    if (!verifyToken || verifyToken !== process.env.NOTIFICATION_WEBHOOK_VERIFY_TOKEN) {
      console.error('Invalid verification token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Return the challenge
    if (challenge) {
      return NextResponse.json({ challenge });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 