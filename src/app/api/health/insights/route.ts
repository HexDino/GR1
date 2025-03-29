import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import { generateHealthInsights } from '@/lib/utils/healthAnalytics'
import { JWTPayload } from '@/lib/auth/types'

// Get health insights for the authenticated user
export async function GET(request: NextRequest) {
  const authResponse = await authenticateRequest(request);
  const responseData = await authResponse.json();
  
  if (responseData.error) {
    return NextResponse.json({ error: responseData.error }, { status: 401 });
  }
  
  const auth = responseData.payload as JWTPayload;

  try {
    const insights = await generateHealthInsights(auth.userId)
    
    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error generating health insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate health insights' },
      { status: 500 }
    )
  }
} 