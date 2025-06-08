'use client';

import { useState } from 'react';

export default function ChatbotDemo() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add bot response
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sampleQuestions = [
    "Tôi bị đau đầu mấy ngày nay, làm sao?",
    "What causes high blood pressure?",
    "I want to book an appointment but don't know which doctor",
    "Can you help me understand my prescription?",
    "I'm worried about my health symptoms",
    "Làm sao để tôi đặt lịch khám bệnh?",
    "What's the difference between a cardiologist and neurologist?",
    "I need help with my medical records"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Enhanced Free-Form Medical Chatbot Demo
          </h1>
          <p className="text-gray-600 mb-4">
            Test the new AI-powered chatbot that can understand natural conversations in both English and Vietnamese
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">✨ New Features:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 🧠 AI-powered natural language understanding</li>
              <li>• 🌏 Seamless Vietnamese + English support</li>
              <li>• 💡 Context-aware responses with real system data</li>
              <li>• 🎯 Intelligent suggestions and helpful actions</li>
              <li>• 💬 More human-like, empathetic conversations</li>
            </ul>
          </div>
        </div>

        {/* Sample Questions */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">🎯 Try these sample questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                                 className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
               >
                 &ldquo;{question}&rdquo;
               </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">💬</div>
                <p>Start a conversation! Ask me anything about healthcare.</p>
                <p className="text-sm mt-1">Try asking in Vietnamese or English - I understand both!</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl px-4 py-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about healthcare... (Vietnamese or English)"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-6 bg-gray-900 text-white rounded-lg p-6">
          <h3 className="font-semibold mb-3">🔧 Technical Implementation:</h3>
          <div className="text-sm space-y-2">
            <p>• <strong>AI Processing:</strong> GPT-4 with comprehensive system context</p>
            <p>• <strong>Data Integration:</strong> Real-time user appointments, prescriptions, medical records</p>
            <p>• <strong>Intent Recognition:</strong> Simplified but effective categorization</p>
            <p>• <strong>Fallback System:</strong> Graceful degradation when AI is unavailable</p>
            <p>• <strong>Personalization:</strong> Context-aware responses based on user history</p>
          </div>
        </div>
      </div>
    </div>
  );
} 