import { prisma } from '@/lib/db/prisma'
import { NotificationType } from './notification'
import OpenAI from 'openai'

// Khởi tạo OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Định nghĩa các loại ý định người dùng có thể có (simplified)
export enum UserIntentType {
  APPOINTMENT_RELATED = 'APPOINTMENT_RELATED',
  MEDICAL_QUESTION = 'MEDICAL_QUESTION',
  DOCTOR_INFO = 'DOCTOR_INFO',
  SYMPTOMS_CHECK = 'SYMPTOMS_CHECK',
  SYSTEM_INFO = 'SYSTEM_INFO',
  GENERAL_CONVERSATION = 'GENERAL_CONVERSATION'
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
 * Helper functions to fetch real data from the system
 */

// Fallback response when OpenAI is not available
function getFallbackResponse(userMessage: string, intent: UserIntentType, userData?: any, systemData?: any): string {
  const message = userMessage.toLowerCase();

  // Vietnamese responses
  if (/tôi|bị|đau|ốm|cảm thấy|triệu chứng/i.test(message)) {
    return "Tôi hiểu bạn đang gặp vấn đề sức khỏe. Tôi khuyên bạn nên đặt lịch hẹn với bác sĩ để được tư vấn chính xác. Bạn có thể đặt lịch hẹn tại đây: /appointments/new";
  }
  
  if (/đặt|lịch|hẹn|khám/i.test(message)) {
    return "Tôi có thể giúp bạn đặt lịch hẹn. Vui lòng truy cập trang đặt lịch hẹn để chọn bác sĩ và thời gian phù hợp.";
  }
  
  // English responses
  if (/symptom|pain|sick|hurt|feel/i.test(message)) {
    return "I understand you're experiencing health concerns. I recommend booking an appointment with a doctor for proper consultation. You can book an appointment here: /appointments/new";
  }
  
  if (/appointment|book|schedule/i.test(message)) {
    return "I can help you book an appointment. Please visit our appointment booking page to select a doctor and suitable time.";
  }
  
  if (/doctor|physician|specialist/i.test(message)) {
    let response = "We have various specialists available. ";
    if (systemData?.doctors && systemData.doctors.length > 0) {
      response += `Here are some of our doctors:\n`;
      systemData.doctors.slice(0, 3).forEach((doctor: any, index: number) => {
        response += `${index + 1}. Dr. ${doctor.name} - ${doctor.doctor?.specialization || 'General'}\n`;
      });
    }
    response += "\nYou can view all doctors at: /doctors";
    return response;
  }
  
  if (/prescription|medicine|medication/i.test(message)) {
    if (userData?.prescriptions && userData.prescriptions.length > 0) {
      return "I can see you have prescription history. For detailed prescription information, please visit: /dashboard/patient/prescriptions";
    }
    return "For prescription information, please consult with your doctor or visit: /dashboard/patient/prescriptions";
  }
  
  // Default friendly response
  return "Hello! I'm here to help you with your healthcare needs. I can assist you with:\n• Booking appointments\n• Finding doctors\n• General health information\n• Navigating our services\n\nHow can I help you today?";
}

// Fetch user's comprehensive data for AI context
async function getUserComprehensiveData(userId: string) {
  try {
    const [appointments, prescriptions, medicalRecords, user] = await Promise.all([
      // Recent appointments
      prisma.appointment.findMany({
        where: { patientId: userId },
        include: {
          doctor: {
            include: {
              doctor: {
                select: {
                  specialization: true
                }
              }
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 5
      }),
      
      // Recent prescriptions
      prisma.prescription.findMany({
        where: { patientId: userId },
        include: {
          appointment: {
            include: {
              doctor: {
                select: {
                  name: true
                }
              }
            }
          },
          items: {
            include: {
              medicine: {
                select: {
                  name: true,
                  dosageForm: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      }),
      
      // Medical records (completed appointments with diagnosis)
      prisma.appointment.findMany({
        where: { 
          patientId: userId,
          status: 'COMPLETED',
          OR: [
            { diagnosis: { not: null } },
            { symptoms: { not: null } },
            { notes: { not: null } }
          ]
        },
        include: {
          doctor: {
            select: {
              name: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 3
      }),
      
      // User profile
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          role: true
        }
      })
    ]);

    return {
      user,
      appointments,
      prescriptions,
      medicalRecords,
      upcomingAppointments: appointments.filter(apt => 
        new Date(apt.date) > new Date() && (apt.status === 'PENDING' || apt.status === 'CONFIRMED')
      )
    };
  } catch (error) {
    console.error('Error fetching user comprehensive data:', error);
    return null;
  }
}

// Fetch system information for AI context
async function getSystemData() {
  try {
    const [doctors, specializations] = await Promise.all([
      // Available doctors
      prisma.user.findMany({
        where: {
          role: 'DOCTOR'
        },
        include: {
          doctor: {
            select: {
              specialization: true,
              consultationFee: true,
              rating: true,
              experience: true,
              isAvailable: true
            }
          }
        },
        take: 10
      }),
      
      // Available specializations
      prisma.doctor.groupBy({
        by: ['specialization'],
        _count: {
          specialization: true
        },
        orderBy: {
          _count: {
            specialization: 'desc'
          }
        }
      })
    ]);

    return {
      doctors,
      specializations
    };
  } catch (error) {
    console.error('Error fetching system data:', error);
    return { doctors: [], specializations: [] };
  }
}

/**
 * Simplified intent analysis - less rigid categorization
 */
export function analyzeUserIntent(userMessage: string): UserIntentType {
  const message = userMessage.toLowerCase();

  // Check for appointment-related keywords
  if (/appointment|schedule|book|cancel|lịch|hẹn|đặt|hủy/i.test(message)) {
    return UserIntentType.APPOINTMENT_RELATED;
  }
  
  // Check for symptom or health condition keywords
  if (/symptom|pain|sick|illness|fever|cough|headache|hurt|feel|triệu chứng|đau|ốm|bệnh|sốt|ho/i.test(message)) {
    return UserIntentType.SYMPTOMS_CHECK;
  }
  
  // Check for doctor-related queries
  if (/doctor|physician|specialist|dr\.|bác sĩ|bs|chuyên khoa/i.test(message)) {
    return UserIntentType.DOCTOR_INFO;
  }
  
  // Check for system/service information
  if (/department|service|hospital|clinic|prescription|record|khoa|dịch vụ|bệnh viện|đơn thuốc|hồ sơ/i.test(message)) {
    return UserIntentType.SYSTEM_INFO;
  }
  
  // Check if it's a medical question
  if (/what|why|how|cause|treatment|cure|prevent|diagnose|explain|tại sao|làm sao|nguyên nhân|điều trị|chữa|giải thích/i.test(message)) {
    return UserIntentType.MEDICAL_QUESTION;
  }
  
  // Default to general conversation
  return UserIntentType.GENERAL_CONVERSATION;
}

/**
 * Enhanced GPT-4 processing with comprehensive system context
 */
export async function processGPT4WithContext(
  userMessage: string, 
  intent: UserIntentType, 
  userData?: any, 
  systemData?: any
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log("[DEBUG] OpenAI API key not available, using fallback response");
      return getFallbackResponse(userMessage, intent, userData, systemData);
    }

    // Build comprehensive context
    let systemContext = `You are an intelligent medical assistant for a healthcare appointment system called MedCare. You should provide helpful, accurate, and personalized responses.

IMPORTANT GUIDELINES:
1. Always be helpful and empathetic
2. For medical questions, provide general information but always recommend consulting a healthcare professional
3. Use the provided user and system data to give personalized responses
4. Keep responses conversational and natural
5. Suggest relevant actions when appropriate
6. Do not diagnose medical conditions
7. If you don't have enough information, ask clarifying questions

`;

    // Add user context if available
    if (userData && userData.user) {
      systemContext += `\nUSER PROFILE:
- Name: ${userData.user.name}
- Role: ${userData.user.role}
`;

      if (userData.appointments && userData.appointments.length > 0) {
        systemContext += `\nRECENT APPOINTMENTS:
`;
        userData.appointments.slice(0, 3).forEach((apt: any, index: number) => {
          systemContext += `${index + 1}. ${new Date(apt.date).toLocaleDateString()} - Dr. ${apt.doctor?.name} (${apt.status})`;
          if (apt.diagnosis) systemContext += ` - Diagnosis: ${apt.diagnosis}`;
          systemContext += `\n`;
        });
      }

      if (userData.prescriptions && userData.prescriptions.length > 0) {
        systemContext += `\nRECENT PRESCRIPTIONS:
`;
        userData.prescriptions.forEach((prescription: any, index: number) => {
          systemContext += `${index + 1}. ${new Date(prescription.createdAt).toLocaleDateString()} - Dr. ${prescription.appointment?.doctor?.name}`;
          if (prescription.items && prescription.items.length > 0) {
            const medicines = prescription.items.map((item: any) => item.medicine.name).join(', ');
            systemContext += ` - Medicines: ${medicines}`;
          }
          systemContext += `\n`;
        });
      }

      if (userData.medicalRecords && userData.medicalRecords.length > 0) {
        systemContext += `\nMEDICAL HISTORY:
`;
        userData.medicalRecords.forEach((record: any, index: number) => {
          systemContext += `${index + 1}. ${new Date(record.date).toLocaleDateString()} - Dr. ${record.doctor?.name}`;
          if (record.diagnosis) systemContext += ` - ${record.diagnosis}`;
          systemContext += `\n`;
        });
      }
    }

    // Add system context
    if (systemData) {
      if (systemData.doctors && systemData.doctors.length > 0) {
        systemContext += `\nAVAILABLE DOCTORS:
`;
        systemData.doctors.slice(0, 5).forEach((doctor: any, index: number) => {
          systemContext += `${index + 1}. Dr. ${doctor.name} - ${doctor.doctor?.specialization || 'General'}`;
          if (doctor.doctor?.rating) systemContext += ` (Rating: ${doctor.doctor.rating}/5)`;
          systemContext += `\n`;
        });
      }

      if (systemData.specializations && systemData.specializations.length > 0) {
        systemContext += `\nAVAILABLE SPECIALIZATIONS:
`;
        systemData.specializations.slice(0, 5).forEach((spec: any, index: number) => {
          systemContext += `${index + 1}. ${spec.specialization} (${spec._count.specialization} doctors)\n`;
        });
      }
    }

    systemContext += `\nPlease respond to the user's message in a natural, helpful way. If relevant, suggest specific actions they can take or provide links to appropriate pages.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemContext
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
    });
    
    const answer = response.choices[0]?.message?.content?.trim() || 
                "I apologize, but I'm having trouble processing your request right now. Could you please try rephrasing your question?";
    
    return answer;
  } catch (error) {
    console.error("Error processing with GPT-4:", error);
    console.log("[DEBUG] OpenAI failed, using fallback response");
    return getFallbackResponse(userMessage, intent, userData, systemData);
  }
}

/**
 * Main response generation - now primarily AI-driven with smart fallbacks
 */
export async function generateResponse(
  intent: UserIntentType,
  userMessage: string,
  userId?: string
): Promise<ChatbotResponse> {
  
  // Fetch comprehensive data for AI context
  let userData = null;
  if (userId && userId !== 'guest') {
    userData = await getUserComprehensiveData(userId);
  }
  
  const systemData = await getSystemData();
  
  // For most intents, use AI with full context
  if (intent !== UserIntentType.GENERAL_CONVERSATION || userMessage.length > 10) {
    try {
      const aiResponse = await processGPT4WithContext(userMessage, intent, userData, systemData);
      
      // Determine appropriate links based on intent and content
      let links: { text: string; url: string }[] = [];
      let suggestedActions: string[] = [];
      
      switch (intent) {
        case UserIntentType.APPOINTMENT_RELATED:
          links = [
            { text: "Book Appointment", url: "/appointments/new" },
            { text: "View My Appointments", url: "/dashboard/patient/appointments" }
          ];
          suggestedActions = ["Book new appointment", "Check appointment status", "Cancel appointment"];
          break;
          
        case UserIntentType.DOCTOR_INFO:
          links = [
            { text: "Find Doctors", url: "/doctors" },
            { text: "Browse Specialties", url: "/departments" }
          ];
          suggestedActions = ["View doctor profiles", "Check availability", "Read reviews"];
          break;
          
        case UserIntentType.SYMPTOMS_CHECK:
          links = [
            { text: "Book Urgent Appointment", url: "/appointments/new" }
          ];
          suggestedActions = ["Book consultation", "Find specialist", "Emergency contact"];
          break;
          
        case UserIntentType.SYSTEM_INFO:
          if (userId && userId !== 'guest') {
            links = [
              { text: "My Dashboard", url: "/dashboard/patient" },
              { text: "Medical Records", url: "/dashboard/patient/medical-records" },
              { text: "Prescriptions", url: "/dashboard/patient/prescriptions" }
            ];
          } else {
            links = [
              { text: "Login", url: "/login" },
              { text: "Register", url: "/register" }
            ];
          }
          break;
          
        case UserIntentType.MEDICAL_QUESTION:
          links = [
            { text: "Consult a Doctor", url: "/appointments/new" }
          ];
          suggestedActions = ["Book consultation", "Learn more", "Get second opinion"];
          break;
      }
      
      return {
        message: aiResponse,
        intent,
        suggestedActions,
        links,
        data: { userData, systemData }
      };
      
    } catch (error) {
      console.error("Error in AI response generation:", error);
      // Fallback to simple response
    }
  }
  
  // Simple fallback responses for when AI is not available
  const fallbackResponses = {
    [UserIntentType.APPOINTMENT_RELATED]: "I can help you with appointments. Would you like to book a new appointment, check existing ones, or make changes?",
    [UserIntentType.DOCTOR_INFO]: "I can help you find information about our doctors and their specialties. What specific information are you looking for?",
    [UserIntentType.SYMPTOMS_CHECK]: "I understand you may be experiencing some symptoms. While I can provide general guidance, I strongly recommend consulting with a healthcare professional for proper evaluation.",
    [UserIntentType.SYSTEM_INFO]: "I can help you navigate our healthcare system. What specific information would you like to know?",
    [UserIntentType.MEDICAL_QUESTION]: "I'd be happy to help with general health information, but please remember that this doesn't replace professional medical advice.",
    [UserIntentType.GENERAL_CONVERSATION]: "Hello! I'm here to help you with your healthcare needs. How can I assist you today?"
  };
        
        return {
    message: fallbackResponses[intent] || "I'm here to help you with your healthcare needs. Could you please tell me more about what you're looking for?",
          intent,
          suggestedActions: [
      "Book appointment",
      "Find doctor",
      "Ask health question",
      "View my records"
          ],
          links: [
      { text: "Book Appointment", url: "/appointments/new" },
      { text: "Find Doctors", url: "/doctors" }
    ]
  };
}

/**
 * Lưu trữ lịch sử chat của người dùng
 */
export async function saveChatMessage(
  sessionId: string,
  content: string,
  role: 'user' | 'assistant'
) {
  try {
    // Temporarily disabled to fix foreign key constraint issue
    // Need to create Chat record first before saving ChatMessage
    console.log(`[DEBUG] Chat message would be saved: ${role}: ${content.substring(0, 50)}...`);
    return true;
    
    // TODO: Re-enable after fixing Chat creation
    // await prisma.chatMessage.create({
    //   data: {
    //     chatId: sessionId,
    //     content,
    //     role: role === 'user' ? 'USER' : 'ASSISTANT'
    //   }
    // });
    // return true;
  } catch (error) {
    console.error("Error saving chat message:", error);
    return false;
  }
}

/**
 * Xử lý tin nhắn của người dùng - now AI-first approach
 */
export async function processUserMessage(
  sessionId: string,
  userMessage: string,
  userId?: string
): Promise<ChatbotResponse> {
  // Lưu tin nhắn của người dùng
  await saveChatMessage(sessionId, userMessage, 'user');
  
  // Phân tích ý định (simplified)
  const intent = analyzeUserIntent(userMessage);
  
  // Tạo phản hồi AI-driven với dữ liệu thực
  const response = await generateResponse(intent, userMessage, userId);
  
  // Lưu phản hồi của hệ thống
  await saveChatMessage(sessionId, response.message, 'assistant');
  
  return response;
}

/**
 * Main entry point - now with enhanced AI capabilities
 */
export async function getChatbotResponse(message: string, userId?: string, language: string = 'en'): Promise<string> {
  try {
    // Tạo một sessionId tạm thời nếu không có userId
    const sessionId = userId || `temp-${Date.now()}`;
    
    // Xử lý tin nhắn với AI-enhanced approach
    const response = await processUserMessage(sessionId, message, userId);
    
    // Return the AI-generated response directly
    return response.message;
  } catch (error) {
    console.error("Error in getChatbotResponse:", error);
    return "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to contact our support team if you need immediate assistance.";
  }
} 