import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import { processUserMessage } from '@/lib/services/chatbot'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { JWTPayload } from '@/lib/auth/types'

// Định nghĩa schema cho request body
const chatRequestSchema = z.object({
  message: z.string().min(1, "Tin nhắn không được để trống"),
  sessionId: z.string().optional()
});

export async function POST(request: NextRequest) {
  // Xác thực không bắt buộc
  let userId: string | undefined;
  const authResult = await authenticateRequest(request, false);
  if (!('error' in authResult)) {
    const auth = authResult as JWTPayload;
    if (auth.userId !== 'guest') {
      userId = auth.userId;
    }
  }

  try {
    const body = await request.json();
    const result = chatRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: result.error.errors },
        { status: 400 }
      );
    }
    
    const { message, sessionId: existingSessionId } = result.data;
    
    // Tạo session ID mới nếu chưa có
    const sessionId = existingSessionId || randomUUID();
    
    // Xử lý tin nhắn
    const response = await processUserMessage(sessionId, message, userId);
    
    return NextResponse.json({
      response,
      sessionId
    });
  } catch (error) {
    console.error("Error processing chat message:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xử lý tin nhắn" },
      { status: 500 }
    );
  }
} 