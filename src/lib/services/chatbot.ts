import { prisma } from '@/lib/db/prisma'
import { NotificationType } from './notification'
import OpenAI from 'openai'

// Khởi tạo OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Định nghĩa các loại ý định người dùng có thể có
export enum UserIntentType {
  BOOK_APPOINTMENT = 'BOOK_APPOINTMENT',
  CHECK_APPOINTMENT = 'CHECK_APPOINTMENT',
  CANCEL_APPOINTMENT = 'CANCEL_APPOINTMENT',
  MEDICAL_QUESTION = 'MEDICAL_QUESTION',
  DOCTOR_INFO = 'DOCTOR_INFO',
  DEPARTMENT_INFO = 'DEPARTMENT_INFO',
  SYMPTOMS_CHECK = 'SYMPTOMS_CHECK',
  PRESCRIPTION_INFO = 'PRESCRIPTION_INFO',
  GENERAL_HELP = 'GENERAL_HELP',
  UNKNOWN = 'UNKNOWN'
}

// Interface cho tin nhắn chatbot
export interface ChatMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
}

// Interface cho phản hồi của chatbot
export interface ChatbotResponse {
  message: string;
  intent?: UserIntentType;
  suggestedActions?: string[];
  links?: { text: string; url: string }[];
  data?: any;
}

/**
 * Phân tích ý định của người dùng từ tin nhắn của họ
 * @param userMessage Tin nhắn của người dùng
 */
export function analyzeUserIntent(userMessage: string): UserIntentType {
  const message = userMessage.toLowerCase();

  // Sử dụng regex để nhận diện intent
  if (/đặt\s+(lịch|cuộc hẹn)|book|appointment/i.test(message)) {
    return UserIntentType.BOOK_APPOINTMENT;
  }
  
  if (/kiểm tra|xem|check|lịch|cuộc hẹn|hẹn\s+(của|tôi)/i.test(message) && 
      !/hủy|cancel/i.test(message)) {
    return UserIntentType.CHECK_APPOINTMENT;
  }
  
  if (/hủy|cancel|xóa|bỏ|lịch|cuộc hẹn/i.test(message)) {
    return UserIntentType.CANCEL_APPOINTMENT;
  }
  
  if (/thuốc|đơn thuốc|toa thuốc|prescription|medicine/i.test(message)) {
    return UserIntentType.PRESCRIPTION_INFO;
  }
  
  if (/bác sĩ|doctor|bác|bs/i.test(message) && 
      !/lịch|hẹn|schedule|appointment/i.test(message)) {
    return UserIntentType.DOCTOR_INFO;
  }
  
  if (/khoa|phòng|chuyên khoa|department|specialty/i.test(message)) {
    return UserIntentType.DEPARTMENT_INFO;
  }
  
  if (/triệu chứng|symptom|đau|ốm|bệnh|fever|cough|sốt|ho/i.test(message) && 
      !/bác sĩ|doctor|lịch|hẹn/i.test(message)) {
    return UserIntentType.SYMPTOMS_CHECK;
  }
  
  // Kiểm tra xem có phải câu hỏi y tế không
  if (/tại sao|vì sao|nguyên nhân|cách|phương pháp|điều trị|what|why|how|treat|cure|prevent/i.test(message)) {
    return UserIntentType.MEDICAL_QUESTION;
  }
  
  if (/giúp|help|hướng dẫn|guide|how to/i.test(message)) {
    return UserIntentType.GENERAL_HELP;
  }
  
  // Nếu không rõ ý định
  return UserIntentType.UNKNOWN;
}

/**
 * Xử lý câu hỏi y tế sử dụng OpenAI API
 * @param question Câu hỏi y tế của người dùng
 */
export async function processGPT4MedicalQuestion(question: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return "Xin lỗi, tôi không thể trả lời câu hỏi y tế phức tạp lúc này. Vui lòng liên hệ bác sĩ để được tư vấn.";
    }
    
    const medicalPrompt = `
    Bạn là một trợ lý y tế được đào tạo để cung cấp thông tin sức khỏe chung.
    Hãy trả lời câu hỏi sau một cách chính xác, ngắn gọn và dễ hiểu:
    
    ${question}
    
    Hãy nhớ:
    1. Chỉ cung cấp thông tin dựa trên bằng chứng khoa học.
    2. KHÔNG đưa ra chẩn đoán y tế.
    3. LUÔN khuyến nghị người dùng tham khảo ý kiến bác sĩ.
    4. Trả lời ngắn gọn, không quá 150 từ.
    5. Nếu không chắc chắn, hãy thẳng thắn về những hạn chế.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "Bạn là trợ lý y tế ảo trong hệ thống đặt lịch khám bệnh. Bạn cung cấp thông tin sức khỏe chung nhưng không chẩn đoán hay đưa ra tư vấn y tế thay thế cho bác sĩ."
        },
        {
          role: "user",
          content: medicalPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });
    
    const answer = response.choices[0]?.message?.content?.trim() || 
                "Xin lỗi, tôi không thể xử lý câu hỏi của bạn lúc này. Vui lòng thử lại sau.";
    
    // Luôn thêm tuyên bố miễn trừ trách nhiệm
    return answer + "\n\n(Lưu ý: Thông tin này chỉ mang tính chất tham khảo và không thay thế cho tư vấn y tế chuyên nghiệp)";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "Xin lỗi, tôi không thể trả lời câu hỏi y tế phức tạp lúc này. Vui lòng liên hệ bác sĩ để được tư vấn.";
  }
}

/**
 * Phân tích triệu chứng sử dụng OpenAI API
 * @param symptoms Mô tả triệu chứng của người dùng
 */
export async function analyzeSymptoms(symptoms: string): Promise<any> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        message: "Xin lỗi, tôi không thể phân tích triệu chứng lúc này. Vui lòng liên hệ bác sĩ để được tư vấn.",
        suggestions: []
      };
    }
    
    const symptomsPrompt = `
    Phân tích các triệu chứng sau và đưa ra gợi ý sơ bộ:
    
    ${symptoms}
    
    Hãy trả lời với định dạng JSON như sau:
    {
      "analysis": "Phân tích ngắn gọn các triệu chứng",
      "possibleConditions": ["Tình trạng có thể 1", "Tình trạng có thể 2"],
      "recommendations": ["Khuyến nghị 1", "Khuyến nghị 2"],
      "urgencyLevel": "THẤP/TRUNG BÌNH/CAO/KHẨN CẤP",
      "specialistType": "Loại bác sĩ chuyên khoa nên gặp"
    }
    
    KHÔNG đưa ra chẩn đoán y tế chính thức. Chỉ cung cấp thông tin tham khảo.
    Nếu triệu chứng nghiêm trọng, luôn khuyến nghị người dùng tìm kiếm sự trợ giúp y tế ngay lập tức.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "Bạn là trợ lý y tế ảo trong hệ thống đặt lịch khám bệnh. Bạn phân tích triệu chứng sơ bộ nhưng không chẩn đoán chính thức."
        },
        {
          role: "user",
          content: symptomsPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });
    
    const jsonResponse = response.choices[0]?.message?.content?.trim() || "{}";
    let result;
    
    try {
      result = JSON.parse(jsonResponse);
    } catch (error) {
      console.error("Error parsing JSON from OpenAI:", error);
      result = {
        analysis: "Không thể phân tích triệu chứng.",
        recommendations: ["Vui lòng tham khảo ý kiến bác sĩ."]
      };
    }
    
    // Thêm cảnh báo miễn trừ trách nhiệm
    return {
      ...result,
      disclaimer: "Phân tích này chỉ mang tính chất tham khảo và không thay thế cho tư vấn y tế chuyên nghiệp."
    };
  } catch (error) {
    console.error("Error analyzing symptoms with OpenAI:", error);
    return {
      message: "Xin lỗi, tôi không thể phân tích triệu chứng lúc này. Vui lòng liên hệ bác sĩ để được tư vấn.",
      suggestions: ["Đặt lịch khám với bác sĩ"]
    };
  }
}

/**
 * Trả lời dựa trên ý định của người dùng
 * @param intent Ý định của người dùng
 * @param userMessage Tin nhắn của người dùng
 * @param userId ID của người dùng nếu đã đăng nhập
 */
export async function generateResponse(
  intent: UserIntentType,
  userMessage: string,
  userId?: string
): Promise<ChatbotResponse> {
  
  switch(intent) {
    case UserIntentType.BOOK_APPOINTMENT:
      return {
        message: "Tôi có thể giúp bạn đặt lịch khám bệnh. Bạn muốn khám khoa nào và vào thời gian nào?",
        intent,
        suggestedActions: [
          "Xem các khoa",
          "Xem bác sĩ khả dụng",
          "Đặt lịch khám Nội khoa"
        ],
        links: [
          { text: "Các khoa phòng", url: "/departments" },
          { text: "Các bác sĩ", url: "/doctors" }
        ]
      };
      
    case UserIntentType.CHECK_APPOINTMENT:
      if (userId && userId !== 'guest') {
        try {
          const appointments = await prisma.appointment.findMany({
            where: {
              patientId: userId,
              date: {
                gte: new Date()
              }
            },
            orderBy: {
              date: 'asc'
            },
            include: {
              doctor: {
                select: {
                  user: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            },
            take: 3
          });
          
          if (appointments.length > 0) {
            return {
              message: `Bạn có ${appointments.length} cuộc hẹn sắp tới.`,
              intent,
              data: appointments,
              links: [
                { text: "Xem tất cả lịch hẹn", url: "/appointments" }
              ]
            };
          } else {
            return {
              message: "Bạn không có cuộc hẹn nào sắp tới.",
              intent,
              suggestedActions: ["Đặt lịch khám ngay"]
            };
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
          return {
            message: "Xin lỗi, tôi không thể kiểm tra lịch hẹn của bạn lúc này. Vui lòng thử lại sau.",
            intent
          };
        }
      } else {
        return {
          message: "Bạn cần đăng nhập để xem lịch hẹn của mình.",
          intent,
          links: [
            { text: "Đăng nhập", url: "/login" }
          ]
        };
      }
      
    case UserIntentType.CANCEL_APPOINTMENT:
      return {
        message: "Để hủy lịch khám, vui lòng cho tôi biết thời gian của cuộc hẹn bạn muốn hủy, hoặc bạn có thể xem tất cả lịch hẹn và chọn hủy từ danh sách.",
        intent,
        links: [
          { text: "Xem tất cả lịch hẹn", url: "/appointments" }
        ]
      };
      
    case UserIntentType.SYMPTOMS_CHECK:
      // Sử dụng GPT-4 để phân tích triệu chứng
      try {
        const analysis = await analyzeSymptoms(userMessage);
        
        const urgencyMap: Record<string, string> = {
          "THẤP": "thấp",
          "TRUNG BÌNH": "trung bình",
          "CAO": "cao",
          "KHẨN CẤP": "khẩn cấp"
        };
        
        let message = analysis.analysis || "Tôi đã phân tích triệu chứng của bạn.";
        
        if (analysis.urgencyLevel) {
          const urgencyText = urgencyMap[analysis.urgencyLevel] || analysis.urgencyLevel.toLowerCase();
          message += `\n\nMức độ cần thiết để thăm khám: ${urgencyText}.`;
        }
        
        if (analysis.specialistType) {
          message += `\n\nBạn nên tham khảo ý kiến của bác sĩ ${analysis.specialistType}.`;
        }
        
        // Thêm khuyến cáo
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          message += "\n\nKhuyến nghị:\n" + analysis.recommendations.map((rec: string) => `- ${rec}`).join("\n");
        }
        
        // Thêm miễn trừ trách nhiệm
        message += "\n\n" + (analysis.disclaimer || "Lưu ý: Đây chỉ là thông tin tham khảo và không thay thế cho tư vấn y tế chuyên nghiệp.");
        
        return {
          message,
          intent,
          suggestedActions: [
            "Đặt lịch khám ngay",
            "Tìm bác sĩ chuyên khoa"
          ],
          links: [
            { text: "Đặt lịch khám", url: "/appointments/new" }
          ],
          data: {
            analysis: analysis
          }
        };
      } catch (error) {
        return {
          message: "Tôi có thể giúp bạn kiểm tra sơ bộ các triệu chứng. Tuy nhiên, đây chỉ là thông tin tham khảo và không thay thế cho tư vấn y tế chuyên nghiệp. Vui lòng mô tả chi tiết các triệu chứng của bạn.",
          intent,
          suggestedActions: [
            "Tôi bị sốt và ho",
            "Tôi bị đau đầu",
            "Tôi bị đau bụng"
          ]
        };
      }
      
    case UserIntentType.DOCTOR_INFO:
      return {
        message: "Bạn muốn tìm hiểu thông tin về bác sĩ nào hoặc chuyên khoa nào?",
        intent,
        links: [
          { text: "Xem tất cả bác sĩ", url: "/doctors" },
          { text: "Tìm theo chuyên khoa", url: "/departments" }
        ]
      };
      
    case UserIntentType.PRESCRIPTION_INFO:
      if (userId && userId !== 'guest') {
        return {
          message: "Bạn có thể xem tất cả đơn thuốc của mình trong phần Đơn thuốc.",
          intent,
          links: [
            { text: "Xem đơn thuốc", url: "/prescriptions" }
          ]
        };
      } else {
        return {
          message: "Bạn cần đăng nhập để xem thông tin đơn thuốc.",
          intent,
          links: [
            { text: "Đăng nhập", url: "/login" }
          ]
        };
      }
      
    case UserIntentType.MEDICAL_QUESTION:
      // Sử dụng GPT-4 để trả lời câu hỏi y tế
      try {
        const answer = await processGPT4MedicalQuestion(userMessage);
        return {
          message: answer,
          intent,
          suggestedActions: [
            "Đặt lịch tư vấn với bác sĩ",
            "Tìm hiểu thêm về sức khỏe"
          ]
        };
      } catch (error) {
        return {
          message: "Xin lỗi, tôi không thể trả lời câu hỏi y tế phức tạp lúc này. Vui lòng tham khảo ý kiến bác sĩ để được tư vấn chính xác.",
          intent,
          links: [
            { text: "Đặt lịch tư vấn", url: "/appointments/new" }
          ]
        };
      }
      
    case UserIntentType.GENERAL_HELP:
      return {
        message: "Tôi có thể giúp bạn với các vấn đề sau:",
        intent,
        suggestedActions: [
          "Đặt lịch khám",
          "Xem lịch khám",
          "Hủy lịch khám",
          "Tìm thông tin bác sĩ",
          "Kiểm tra triệu chứng",
          "Xem đơn thuốc",
          "Hỏi về vấn đề sức khỏe"
        ]
      };
      
    default:
      // Với các tin nhắn không rõ ý định, thử sử dụng GPT-4 để hiểu
      try {
        // Chỉ sử dụng GPT-4 khi tin nhắn dài hơn một ngưỡng nhất định
        if (userMessage.length > 15 && process.env.OPENAI_API_KEY) {
          const answer = await processGPT4MedicalQuestion(userMessage);
          return {
            message: answer,
            intent: UserIntentType.MEDICAL_QUESTION,
            suggestedActions: [
              "Đặt lịch khám",
              "Tìm hiểu thêm"
            ]
          };
        }
      } catch (error) {
        console.error("Error processing unknown intent with GPT-4:", error);
      }
      
      return {
        message: "Xin lỗi, tôi không hiểu yêu cầu của bạn. Bạn có thể nói rõ hơn hoặc chọn một trong các hỗ trợ tôi có thể cung cấp:",
        intent: UserIntentType.UNKNOWN,
        suggestedActions: [
          "Đặt lịch khám",
          "Xem lịch khám",
          "Tìm bác sĩ",
          "Kiểm tra triệu chứng",
          "Hỏi về vấn đề sức khỏe"
        ]
      };
  }
}

/**
 * Lưu trữ lịch sử chat của người dùng
 * @param userId ID của người dùng
 * @param message Tin nhắn chat
 * @param isFromUser Có phải từ người dùng không
 */
export async function saveChatMessage(
  sessionId: string,
  content: string,
  role: 'user' | 'system' | 'assistant'
) {
  try {
    await prisma.chatMessage.create({
      data: {
        sessionId,
        content,
        role,
      }
    });
    return true;
  } catch (error) {
    console.error("Error saving chat message:", error);
    return false;
  }
}

/**
 * Xử lý tin nhắn của người dùng
 * @param sessionId ID phiên chat
 * @param userMessage Tin nhắn của người dùng
 * @param userId ID của người dùng nếu đã đăng nhập
 */
export async function processUserMessage(
  sessionId: string,
  userMessage: string,
  userId?: string
): Promise<ChatbotResponse> {
  // Lưu tin nhắn của người dùng
  await saveChatMessage(sessionId, userMessage, 'user');
  
  // Phân tích ý định
  const intent = analyzeUserIntent(userMessage);
  
  // Tạo phản hồi
  const response = await generateResponse(intent, userMessage, userId);
  
  // Lưu phản hồi của hệ thống
  await saveChatMessage(sessionId, response.message, 'assistant');
  
  return response;
} 