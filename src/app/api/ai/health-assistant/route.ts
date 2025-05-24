import { NextRequest, NextResponse } from 'next/server';

// Mock AI responses for different health topics
const healthResponses = {
  headache: [
    "For headaches, try these steps:\n\n• Rest in a quiet, dark room\n• Apply a cold or warm compress to your head or neck\n• Stay hydrated by drinking plenty of water\n• Consider over-the-counter pain relievers like acetaminophen or ibuprofen\n• Practice relaxation techniques\n\n**When to see a doctor:** If headaches are severe, frequent, or accompanied by fever, vision changes, or neck stiffness.",
    "Headaches can have various causes. Here are some common remedies:\n\n• Ensure you're getting enough sleep (7-9 hours)\n• Manage stress through meditation or deep breathing\n• Maintain regular meal times to avoid blood sugar drops\n• Limit screen time and take regular breaks\n• Check if certain foods trigger your headaches\n\n**Red flags:** Sudden severe headache, headache with fever, or changes in vision require immediate medical attention."
  ],
  sleep: [
    "Improving sleep quality involves several strategies:\n\n• **Sleep Schedule:** Go to bed and wake up at the same time daily\n• **Environment:** Keep your bedroom cool, dark, and quiet\n• **Pre-sleep Routine:** Avoid screens 1 hour before bed\n• **Diet:** Avoid caffeine after 2 PM and large meals before bedtime\n• **Exercise:** Regular physical activity, but not close to bedtime\n• **Relaxation:** Try meditation, reading, or gentle stretches\n\nConsistent habits usually show improvement within 2-3 weeks.",
    "Good sleep hygiene is essential for health:\n\n• **Temperature:** Keep bedroom between 60-67°F (15-19°C)\n• **Light:** Use blackout curtains or eye masks\n• **Sound:** Consider white noise or earplugs\n• **Comfort:** Invest in a good mattress and pillows\n• **Timing:** Avoid naps after 3 PM\n• **Substances:** Limit alcohol and avoid nicotine before bed\n\nIf problems persist after 4 weeks of good sleep hygiene, consult a healthcare provider."
  ],
  nutrition: [
    "Healthy eating guidelines:\n\n• **Balanced Plate:** Fill half with vegetables, quarter with lean protein, quarter with whole grains\n• **Hydration:** Drink 8-10 glasses of water daily\n• **Portions:** Use smaller plates and eat slowly\n• **Timing:** Eat regular meals and healthy snacks\n• **Variety:** Include colorful fruits and vegetables\n• **Limit:** Processed foods, added sugars, and excessive sodium\n\nConsider consulting a registered dietitian for personalized advice.",
    "Nutritious meal planning tips:\n\n• **Preparation:** Plan meals weekly and prep ingredients ahead\n• **Shopping:** Make a list and shop the perimeter of the store first\n• **Cooking:** Use healthy methods like grilling, steaming, or baking\n• **Snacks:** Keep nuts, fruits, and yogurt readily available\n• **Reading Labels:** Check for hidden sugars and sodium\n• **Moderation:** Allow occasional treats in small portions\n\nFocus on whole, minimally processed foods for optimal nutrition."
  ],
  exercise: [
    "Exercise recommendations for beginners:\n\n• **Start Slowly:** Begin with 10-15 minutes of activity daily\n• **Types:** Mix cardio (walking, swimming) with strength training\n• **Frequency:** Aim for 150 minutes of moderate activity weekly\n• **Progression:** Gradually increase duration and intensity\n• **Recovery:** Include rest days for muscle recovery\n• **Enjoyment:** Choose activities you find fun and sustainable\n\nConsult your doctor before starting any new exercise program, especially if you have health conditions.",
    "Creating an effective exercise routine:\n\n• **Cardio:** 3-5 times per week (walking, cycling, dancing)\n• **Strength:** 2-3 times per week (bodyweight or weights)\n• **Flexibility:** Daily stretching or yoga\n• **Balance:** Include activities that challenge stability\n• **Warm-up:** Always start with 5-10 minutes of light activity\n• **Cool-down:** End with stretching and gradual slowing\n\nListen to your body and adjust intensity based on how you feel."
  ],
  stress: [
    "Stress management techniques:\n\n• **Deep Breathing:** Practice 4-7-8 breathing (inhale 4, hold 7, exhale 8)\n• **Mindfulness:** Try 10-minute daily meditation\n• **Physical Activity:** Regular exercise reduces stress hormones\n• **Time Management:** Prioritize tasks and set realistic goals\n• **Social Support:** Talk to friends, family, or a counselor\n• **Hobbies:** Engage in activities you enjoy\n• **Sleep:** Maintain good sleep hygiene\n\nChronic stress can affect physical health, so don't hesitate to seek professional help.",
    "Building resilience against stress:\n\n• **Perspective:** Practice reframing negative thoughts\n• **Boundaries:** Learn to say no to excessive commitments\n• **Organization:** Keep your environment tidy and organized\n• **Nature:** Spend time outdoors when possible\n• **Gratitude:** Keep a daily gratitude journal\n• **Relaxation:** Try progressive muscle relaxation\n• **Professional Help:** Consider therapy for persistent stress\n\nRemember, some stress is normal, but it shouldn't overwhelm your daily life."
  ],
  doctor: [
    "You should see a doctor when:\n\n• **Symptoms persist** for more than a few days without improvement\n• **Severe pain** that interferes with daily activities\n• **Fever** above 101°F (38.3°C) that doesn't respond to treatment\n• **Breathing difficulties** or chest pain\n• **Sudden changes** in vision, speech, or coordination\n• **Persistent fatigue** that doesn't improve with rest\n• **Any symptoms** that worry you or seem unusual\n\n**Emergency situations:** Call 911 for chest pain, difficulty breathing, severe allergic reactions, or loss of consciousness.",
    "When to seek medical attention:\n\n• **Preventive Care:** Annual check-ups even when feeling well\n• **Chronic Conditions:** Regular monitoring of diabetes, hypertension, etc.\n• **New Symptoms:** Any unusual or concerning changes in your body\n• **Medication Issues:** Side effects or questions about prescriptions\n• **Mental Health:** Persistent sadness, anxiety, or mood changes\n• **Injuries:** Wounds that won't heal or suspected fractures\n• **Family History:** Screening based on genetic risk factors\n\nDon't delay seeking care when something doesn't feel right."
  ]
};

const generalResponses = [
  "I understand you're looking for health information. While I can provide general guidance, it's important to remember that I'm not a substitute for professional medical advice. For specific health concerns, please consult with your healthcare provider.\n\nIs there a particular health topic you'd like to learn more about? I can help with general information about nutrition, exercise, sleep, stress management, and when to seek medical care.",
  "Thank you for your health question. I'm here to provide general health information and guidance, but please remember that this doesn't replace professional medical advice.\n\nFor the most accurate and personalized health recommendations, especially for specific symptoms or conditions, it's always best to consult with your doctor or healthcare provider.\n\nWhat specific health topic would you like to discuss today?",
  "I'm happy to help with general health information! However, please keep in mind that my responses are for educational purposes only and shouldn't replace professional medical advice.\n\nIf you're experiencing concerning symptoms or have specific health conditions, please consult with your healthcare provider for proper evaluation and treatment.\n\nWhat health topic can I help you learn about today?"
];

function getAIResponse(message: string): { message: string; type: string } {
  const messageLower = message.toLowerCase();
  
  // Check for specific health topics
  if (messageLower.includes('headache') || messageLower.includes('head pain')) {
    return {
      message: healthResponses.headache[Math.floor(Math.random() * healthResponses.headache.length)],
      type: 'suggestion'
    };
  }
  
  if (messageLower.includes('sleep') || messageLower.includes('insomnia') || messageLower.includes('tired')) {
    return {
      message: healthResponses.sleep[Math.floor(Math.random() * healthResponses.sleep.length)],
      type: 'suggestion'
    };
  }
  
  if (messageLower.includes('nutrition') || messageLower.includes('diet') || messageLower.includes('food') || messageLower.includes('meal')) {
    return {
      message: healthResponses.nutrition[Math.floor(Math.random() * healthResponses.nutrition.length)],
      type: 'suggestion'
    };
  }
  
  if (messageLower.includes('exercise') || messageLower.includes('workout') || messageLower.includes('fitness') || messageLower.includes('physical activity')) {
    return {
      message: healthResponses.exercise[Math.floor(Math.random() * healthResponses.exercise.length)],
      type: 'suggestion'
    };
  }
  
  if (messageLower.includes('stress') || messageLower.includes('anxiety') || messageLower.includes('worried') || messageLower.includes('overwhelmed')) {
    return {
      message: healthResponses.stress[Math.floor(Math.random() * healthResponses.stress.length)],
      type: 'suggestion'
    };
  }
  
  if (messageLower.includes('doctor') || messageLower.includes('when to see') || messageLower.includes('medical help') || messageLower.includes('emergency')) {
    return {
      message: healthResponses.doctor[Math.floor(Math.random() * healthResponses.doctor.length)],
      type: 'warning'
    };
  }
  
  // Emergency keywords
  if (messageLower.includes('emergency') || messageLower.includes('911') || messageLower.includes('chest pain') || 
      messageLower.includes('can\'t breathe') || messageLower.includes('severe pain')) {
    return {
      message: "🚨 **This sounds like a medical emergency!** 🚨\n\nIf you're experiencing:\n• Chest pain or pressure\n• Difficulty breathing\n• Severe pain\n• Loss of consciousness\n• Signs of stroke\n\n**Please call 911 immediately or go to your nearest emergency room.**\n\nDo not delay seeking emergency medical care. Your safety is the top priority.",
      type: 'warning'
    };
  }
  
  // Default response
  return {
    message: generalResponses[Math.floor(Math.random() * generalResponses.length)],
    type: 'text'
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversation, healthContext } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Get AI response based on message content
    const response = getAIResponse(message);

    return NextResponse.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Error processing AI request:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or contact your healthcare provider if this is urgent.",
        type: 'warning'
      },
      { status: 500 }
    );
  }
} 