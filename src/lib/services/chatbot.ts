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
 * Analyze user intent from their message
 * @param userMessage User's message
 */
export function analyzeUserIntent(userMessage: string): UserIntentType {
  const message = userMessage.toLowerCase();

  // Use regex to recognize intent
  if (/book|appointment|schedule|arrange|make.*appointment/i.test(message)) {
    return UserIntentType.BOOK_APPOINTMENT;
  }
  
  if (/check|view|see|my.*appointment|appointment.*status/i.test(message) && 
      !/cancel|delete/i.test(message)) {
    return UserIntentType.CHECK_APPOINTMENT;
  }
  
  if (/cancel|delete|remove|appointment/i.test(message)) {
    return UserIntentType.CANCEL_APPOINTMENT;
  }
  
  if (/prescription|medicine|medication|drug/i.test(message)) {
    return UserIntentType.PRESCRIPTION_INFO;
  }
  
  if (/doctor|physician|dr\./i.test(message) && 
      !/appointment|schedule/i.test(message)) {
    return UserIntentType.DOCTOR_INFO;
  }
  
  if (/department|specialty|ward|unit/i.test(message)) {
    return UserIntentType.DEPARTMENT_INFO;
  }
  
  if (/symptom|pain|sick|illness|fever|cough|headache/i.test(message) && 
      !/doctor|appointment/i.test(message)) {
    return UserIntentType.SYMPTOMS_CHECK;
  }
  
  // Check if it's a medical question
  if (/what|why|how|cause|treatment|cure|prevent|diagnose/i.test(message)) {
    return UserIntentType.MEDICAL_QUESTION;
  }
  
  if (/help|guide|assist|how.*to/i.test(message)) {
    return UserIntentType.GENERAL_HELP;
  }
  
  // If intent is unclear
  return UserIntentType.UNKNOWN;
}

/**
 * Xử lý câu hỏi y tế sử dụng OpenAI API
 * @param question Câu hỏi y tế của người dùng
 */
export async function processGPT4MedicalQuestion(question: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return "Sorry, I cannot answer complex medical questions at this time. Please consult a doctor for accurate advice.";
    }
    
    const medicalPrompt = `
    You are a medical assistant trained to provide health information.
    Please answer the following question in a concise and understandable way:
    
    ${question}
    
    Remember:
    1. Provide information based on scientific evidence.
    2. DO NOT provide a medical diagnosis.
    3. ALWAYS advise users to consult a doctor.
    4. Keep answers concise, no more than 150 words.
    5. If unsure, be honest about limitations.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a virtual medical assistant in the appointment system. You provide general health information but do not diagnose or give alternative medical advice to doctors."
        },
        {
          role: "user",
          content: medicalPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });
    
    const answer = response.choices[0]?.message?.content?.trim() || 
                "Sorry, I cannot process your question at this time. Please try again later.";
    
    // Luôn thêm tuyên bố miễn trừ trách nhiệm
    return answer + "\n\n(Note: This information is for informational purposes only and does not replace professional medical advice)";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "Sorry, I cannot answer complex medical questions at this time. Please consult a doctor for accurate advice.";
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
        message: "Sorry, I cannot analyze symptoms at this time. Please consult a doctor for accurate advice.",
        suggestions: []
      };
    }
    
    const symptomsPrompt = `
    Analyze the following symptoms and provide preliminary suggestions:
    
    ${symptoms}
    
    Please respond in JSON format as follows:
    {
      "analysis": "Short analysis of symptoms",
      "possibleConditions": ["Possible condition 1", "Possible condition 2"],
      "recommendations": ["Recommendation 1", "Recommendation 2"],
      "urgencyLevel": "LOW/MEDIUM/HIGH/EMERGENCY",
      "specialistType": "Type of specialist to consult"
    }
    
    DO NOT provide a medical diagnosis. Provide only informational suggestions.
    If symptoms are serious, always advise users to seek immediate medical help.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a virtual medical assistant in the appointment system. You analyze preliminary symptoms but do not diagnose."
        },
        {
          role: "user",
          content: symptomsPrompt
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });
    
    const jsonResponse = response.choices[0]?.message?.content?.trim() || "{}";
    let result;
    
    try {
      result = JSON.parse(jsonResponse);
    } catch (error) {
      console.error("Error parsing JSON from OpenAI:", error);
      result = {
        analysis: "Cannot analyze symptoms.",
        recommendations: ["Please consult a doctor."]
      };
    }
    
    // Thêm cảnh báo miễn trừ trách nhiệm
    return {
      ...result,
      disclaimer: "Note: This is for informational purposes only and does not replace professional medical advice."
    };
  } catch (error) {
    console.error("Error analyzing symptoms with OpenAI:", error);
    return {
      message: "Sorry, I cannot analyze symptoms at this time. Please consult a doctor for accurate advice.",
      suggestions: ["Book an appointment"]
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
        message: "I can help you book an appointment. What hospital or when would you like to visit?",
        intent,
        suggestedActions: [
          "View hospitals",
          "View doctor availability",
          "Book Internal Medicine appointment"
        ],
        links: [
          { text: "Hospitals", url: "/departments" },
          { text: "Doctors", url: "/doctors" }
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
              doctor: true
            },
            take: 5
          });
          
          if (appointments.length > 0) {
            return {
              message: `You have ${appointments.length} upcoming appointments.`,
              intent,
              data: appointments,
              links: [
                { text: "View all appointments", url: "/appointments" }
              ]
            };
          } else {
            return {
              message: "You have no upcoming appointments.",
              intent,
              suggestedActions: ["Book appointment now"]
            };
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
          return {
            message: "Sorry, I cannot check your appointments at this time. Please try again later.",
            intent
          };
        }
      } else {
        return {
          message: "You need to log in to view your appointments.",
          intent,
          links: [
            { text: "Login", url: "/login" }
          ]
        };
      }
      
    case UserIntentType.CANCEL_APPOINTMENT:
      return {
        message: "To cancel your appointment, please let me know the time of the appointment you want to cancel, or you can view all appointments and choose to cancel from the list.",
        intent,
        links: [
          { text: "View all appointments", url: "/appointments" }
        ]
      };
      
    case UserIntentType.SYMPTOMS_CHECK:
      // Use GPT-4 to analyze symptoms
      try {
        const analysis = await analyzeSymptoms(userMessage);
        
        const urgencyMap: Record<string, string> = {
          "LOW": "low",
          "MEDIUM": "medium", 
          "HIGH": "high",
          "EMERGENCY": "emergency"
        };
        
        let message = analysis.analysis || "I have analyzed your symptoms.";
        
        if (analysis.urgencyLevel) {
          const urgencyText = urgencyMap[analysis.urgencyLevel] || analysis.urgencyLevel.toLowerCase();
          message += `\n\nUrgency level for medical consultation: ${urgencyText}.`;
        }
        
        if (analysis.specialistType) {
          message += `\n\nYou should consult with a ${analysis.specialistType} specialist.`;
        }
        
        // Add recommendations
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          message += "\n\nRecommendations:\n" + analysis.recommendations.map((rec: string) => `- ${rec}`).join("\n");
        }
        
        // Add disclaimer
        message += "\n\n" + (analysis.disclaimer || "Note: This is for informational purposes only and does not replace professional medical advice.");
        
        return {
          message,
          intent,
          suggestedActions: [
            "Book appointment now",
            "Find specialist doctor"
          ],
          links: [
            { text: "Book appointment", url: "/appointments/new" }
          ],
          data: {
            analysis: analysis
          }
        };
      } catch (error) {
        return {
          message: "I can help you check your symptoms preliminarily. However, this is for reference only and does not replace professional medical advice. Please describe your symptoms in detail.",
          intent,
          suggestedActions: [
            "I have fever and cough",
            "I have headache",
            "I have stomach pain"
          ]
        };
      }
      
    case UserIntentType.DOCTOR_INFO:
      return {
        message: "Which doctor or specialty would you like to learn about?",
        intent,
        links: [
          { text: "View all doctors", url: "/doctors" },
          { text: "Find by specialty", url: "/departments" }
        ]
      };
      
    case UserIntentType.PRESCRIPTION_INFO:
      if (userId && userId !== 'guest') {
        return {
          message: "You can view all your prescriptions in the Prescriptions section.",
          intent,
          links: [
            { text: "View prescriptions", url: "/prescriptions" }
          ]
        };
      } else {
        return {
          message: "You need to log in to view prescription information.",
          intent,
          links: [
            { text: "Login", url: "/login" }
          ]
        };
      }
      
    case UserIntentType.MEDICAL_QUESTION:
      // Use GPT-4 to answer medical questions
      try {
        const answer = await processGPT4MedicalQuestion(userMessage);
        return {
          message: answer,
          intent,
          suggestedActions: [
            "Book consultation with doctor",
            "Learn more about health"
          ]
        };
      } catch (error) {
        return {
          message: "Sorry, I cannot answer complex medical questions at this time. Please consult a doctor for accurate advice.",
          intent,
          links: [
            { text: "Book consultation", url: "/appointments/new" }
          ]
        };
      }
      
    case UserIntentType.GENERAL_HELP:
      return {
        message: "I can help you with the following:",
        intent,
        suggestedActions: [
          "Book appointment",
          "View appointments",
          "Cancel appointment",
          "Find doctor information",
          "Check symptoms",
          "View prescriptions",
          "Ask health questions"
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
              "Book appointment",
              "Learn more"
            ]
          };
        }
      } catch (error) {
        console.error("Error processing unknown intent with GPT-4:", error);
      }
      
      return {
        message: "Sorry, I don't understand your request. You can choose one of the following options I can provide:",
        intent: UserIntentType.UNKNOWN,
        suggestedActions: [
          "Book appointment",
          "View appointments",
          "Find doctor",
          "Check symptoms",
          "Ask health questions"
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
  role: 'user' | 'assistant'
) {
  try {
    await prisma.chatMessage.create({
      data: {
        chatId: sessionId,
        content,
        role: role === 'user' ? 'USER' : 'ASSISTANT'
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