require('dotenv').config();
const { getChatbotResponse } = require('./src/lib/services/chatbot.ts');

async function testEnhancedChatbot() {
  console.log('🤖 Testing Enhanced Chatbot with Real API Integration\n');
  
  // Test with a real user ID (you can replace this with an actual patient ID)
  const testUserId = 'cmbmen6f4001uksrwfevcxnsl'; // Admin user ID for testing
  
  const testMessages = [
    'Show me my appointments',
    'I have a headache and fever',
    'Find me a cardiologist',
    'What are my prescriptions?',
    'Show me my medical records',
    'What departments do you have?',
    'How can I book an appointment?',
    'What is diabetes?'
  ];
  
  for (const message of testMessages) {
    console.log(`👤 User: ${message}`);
    
    try {
      const response = await getChatbotResponse(message, testUserId, 'en');
      console.log(`🤖 Bot: ${response}`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('─'.repeat(80));
  }
  
  // Test without user ID (guest mode)
  console.log('\n🚶 Testing Guest Mode (no user ID):\n');
  
  const guestMessage = 'Show me available doctors';
  console.log(`👤 Guest: ${guestMessage}`);
  
  try {
    const response = await getChatbotResponse(guestMessage, undefined, 'en');
    console.log(`🤖 Bot: ${response}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testEnhancedChatbot().catch(console.error); 