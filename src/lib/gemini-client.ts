// Gemini API Client for chat functionality

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface MedicationAction {
  medicationName: string;
  action: "took" | "missed" | "refill" | "update";
  amount?: number;
  note?: string;
}

export class GeminiClient {
  private apiKey: string;
  private apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(
    message: string,
    medications: Array<{ name: string; dosage: string; frequency: number; currentCount: number }>
  ): Promise<{ response: string; action?: MedicationAction }> {
    try {
      // Build context for Gemini
      const medicationContext = medications
        .map(
          (med, idx) =>
            `${idx + 1}. ${med.name} (${med.dosage}) - Takes ${med.frequency}x daily, Has ${med.currentCount} pills left`
        )
        .join("\n");

      const systemPrompt = `You are a medication inventory parser. Analyze the user's message and return ONLY a JSON action.

Current Medications:
${medicationContext}

Your ONLY job: Parse the user's message and return a JSON action.

Rules:
- "I took [medication]" → {"medicationName": "Lisinopril", "action": "took", "amount": 1}
- "I took 2 [medication]" → {"medicationName": "Aspirin", "action": "took", "amount": 2}
- "I missed [medication]" → {"medicationName": "Metformin", "action": "missed"}
- "I have X pills of [medication]" → {"medicationName": "Aspirin", "action": "update", "amount": X}
- "I refilled [medication]" → {"medicationName": "Atorvastatin", "action": "refill"}

IMPORTANT:
- Use EXACT medication names from the list above
- Return ONLY valid JSON, nothing else
- No explanation, no text, ONLY JSON

Examples:
User: "I took my Lisinopril"
Response: {"medicationName": "Lisinopril", "action": "took", "amount": 1}

User: "I took 2 Aspirin"
Response: {"medicationName": "Aspirin", "action": "took", "amount": 2}

User: "I missed Metformin"
Response: {"medicationName": "Metformin", "action": "missed"}

User: "I have 45 Aspirin pills"
Response: {"medicationName": "Aspirin", "action": "update", "amount": 45}`;

      const fullPrompt = `${systemPrompt}

User message: ${message}

Return ONLY JSON:`;

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Full API Response:", JSON.stringify(data, null, 2)); // Debug: see full response structure
      
      // Handle different response structures
      let generatedText = "";
      
      if (data.candidates && data.candidates[0]) {
        const candidate = data.candidates[0];
        console.log("Candidate:", candidate);
        console.log("Content:", candidate.content);
        
        // Check if content has parts
        if (candidate.content?.parts && candidate.content.parts.length > 0) {
          generatedText = candidate.content.parts[0]?.text || "";
        } else if (candidate.content?.text) {
          generatedText = candidate.content.text;
        } else if (candidate.text) {
          generatedText = candidate.text;
        }
        
        // Check finish reason
        if (candidate.finishReason === "MAX_TOKENS") {
          console.warn("Response was truncated due to MAX_TOKENS");
        }
      } else if (data.content && data.content.parts) {
        generatedText = data.content.parts[0]?.text || "";
      } else if (data.text) {
        generatedText = data.text;
      }
      
      if (!generatedText) {
        console.error("Could not extract text from API response. Full response:", data);
        generatedText = "I'm having trouble understanding. Could you rephrase that?";
      }

      console.log("AI Response:", generatedText); // Debug log
      
      // Parse action from response (AI should return pure JSON now)
      const action = this.parseAction(generatedText);
      
      if (action) {
        console.log("Parsed Action:", action); // Debug log
      } else {
        console.warn("No action found in AI response"); // Debug log
      }

      // No display text needed - we'll generate it in the frontend
      return {
        response: "", // Empty response, frontend will handle messaging
        action,
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }

  private parseAction(text: string): MedicationAction | undefined {
    try {
      // Clean the text - remove markdown code blocks if present
      let cleanText = text.trim();
      
      // Remove markdown JSON code blocks
      cleanText = cleanText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      
      // Try to find JSON object in the text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];
        
        // Handle smart quotes that AI might use
        jsonStr = jsonStr.replace(/[""]/g, '"').replace(/['']/g, "'");
        
        const actionData = JSON.parse(jsonStr);
        console.log("Successfully parsed action:", actionData);
        return actionData as MedicationAction;
      }
      
      console.warn("No JSON object found in text:", text.substring(0, 200));
    } catch (e) {
      console.error("Failed to parse action JSON:", text, e);
    }
    return undefined;
  }
}

// Singleton instance
let geminiClient: GeminiClient | null = null;

export const initializeGemini = (apiKey: string) => {
  geminiClient = new GeminiClient(apiKey);
};

export const getGeminiClient = (): GeminiClient => {
  if (!geminiClient) {
    throw new Error("Gemini client not initialized. Please set your API key first.");
  }
  return geminiClient;
};

