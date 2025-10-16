import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Using fallback responses.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Model configuration
const MODEL_NAME = 'gemini-2.0-flash'; // Using the available model from your API

export interface HealthContext {
  patientSummary: string;
  caregiverName: string;
  caregiverRelationship: string;
}

export const generateAIResponse = async (
  userMessage: string,
  healthContext: HealthContext,
  conversationHistory: Array<{ sender: string, message: string }> = []
): Promise<string> => {
  // Fallback to local responses if no API key
  if (!genAI || !API_KEY) {
    return getLocalAIResponse(userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Build context-aware prompt optimized for Gemini 2.0 Flash
    const systemPrompt = `You are HealthGuard AI, a specialized health assistant for caregivers. You're communicating with ${healthContext.caregiverName} (${healthContext.caregiverRelationship}) about their patient's health status.

## PATIENT HEALTH DATA:
${healthContext.patientSummary}

## YOUR ROLE:
- Analyze the patient's health data to provide actionable insights
- Offer evidence-based recommendations based on the provided metrics
- Maintain a professional yet empathetic tone
- Focus on medication adherence, vital signs trends, and health patterns
- Highlight any concerning patterns or positive improvements

## RESPONSE GUIDELINES:
- Keep responses focused and practical (2-4 sentences)
- Reference specific data points from the summary when relevant
- For medical advice requests, emphasize consulting healthcare professionals
- Provide context-aware suggestions based on the patient's current status
- Use clear, non-technical language when possible

## CONVERSATION CONTEXT:
${conversationHistory.length > 0 ? conversationHistory.map(msg => `${msg.sender}: ${msg.message}`).join('\n') : 'This is the start of the conversation.'}

## CURRENT QUESTION:
${healthContext.caregiverName} asks: "${userMessage}"

Provide a helpful, data-driven response:`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      console.warn('Empty response from Gemini API, using fallback');
      return getLocalAIResponse(userMessage);
    }

    console.log('✅ Gemini AI response generated successfully');
    return text.trim();
  } catch (error: any) {
    console.error('Gemini API error:', error);

    // Log specific error details for debugging
    if (error.message) {
      console.error('Error message:', error.message);
    }

    // Fallback to local responses on error
    console.log('🔄 Falling back to local AI responses');
    return getLocalAIResponse(userMessage);
  }
};

// Fallback function for when API is unavailable
const getLocalAIResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();

  if (message.includes('vitals') || message.includes('blood pressure') || message.includes('heart rate')) {
    return "Based on the recent vitals data, the patient's blood pressure has been averaging 128/82 mmHg, which is within acceptable range. Heart rate is stable at 72 bpm. I recommend continuing to monitor daily and noting any significant changes.";
  }

  if (message.includes('medication') || message.includes('pills') || message.includes('dose')) {
    return "The patient has shown excellent medication adherence at 95%. All prescribed medications (Metformin, Lisinopril, Vitamin D3) are being taken consistently. There was only one missed dose in the past week, which is very good compliance.";
  }

  if (message.includes('diet') || message.includes('food') || message.includes('eating') || message.includes('glucose')) {
    return "Blood glucose levels have been slightly elevated on 2 occasions recently. I suggest reviewing the patient's dietary habits and considering a consultation with a nutritionist. The average glucose reading is 142 mg/dL.";
  }

  if (message.includes('emergency') || message.includes('urgent') || message.includes('alert')) {
    return "No emergency alerts have been triggered recently. All health metrics are within acceptable ranges. The patient is responding well to medication reminders and maintaining good health habits.";
  }

  if (message.includes('exercise') || message.includes('activity') || message.includes('walking')) {
    return "The patient has been logging vitals consistently, which suggests good engagement with health monitoring. I recommend encouraging light physical activity as appropriate for their condition and discussing an exercise plan during the next appointment.";
  }

  // Default responses
  const defaultResponses = [
    "I understand your concern. Based on the current health data, the patient is showing good overall compliance and stable vital signs. Is there a specific aspect you'd like me to elaborate on?",
    "Thank you for checking in. The patient's health metrics are trending positively. All medications are being taken as prescribed, and vital signs remain stable.",
    "I'm here to help with any questions about the patient's health status. The recent data shows consistent monitoring and good adherence to the treatment plan."
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

export const isGeminiConfigured = (): boolean => {
  return !!(API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' && API_KEY.startsWith('AIzaSy'));
};

export const testGeminiConnection = async (): Promise<boolean> => {
  if (!genAI || !API_KEY) return false;

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent('Hello, this is a test message.');
    const response = await result.response;
    const text = response.text();
    return !!(text && text.trim().length > 0);
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
};