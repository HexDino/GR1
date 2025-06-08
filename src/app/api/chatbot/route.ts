import { NextRequest, NextResponse } from 'next/server';
import { getChatbotResponse } from '@/lib/services/chatbot';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Lấy ID người dùng từ header nếu đã đăng nhập
    const userId = request.headers.get('x-user-id');
    
    // Chỉ định ngôn ngữ là tiếng Anh
    const language = 'en';
    
    // Gọi service để xử lý tin nhắn và trả về phản hồi
    const response = await getChatbotResponse(message, userId || undefined, language);
    
    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 