import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ScheduleAction {
  type: 'ADD' | 'UPDATE' | 'DELETE';
  id?: string;
  day?: string;
  title?: string;
  time?: string;
  description?: string;
  categoryId?: string;
}

export interface GeminiChatResponse {
  reply: string;
  actions?: ScheduleAction[];
  modelUsed: string;
}

export async function handleScheduleChat(
  history: ChatMessage[],
  currentSchedule: unknown,
  categories: unknown,
  modelName: string = 'gemini-3.5-flash'
): Promise<GeminiChatResponse> {
  if (!ai) {
    return {
      reply:
        "I'm ready to help you plan your schedule! However, the GEMINI_API_KEY is not yet attached to the server environment. Once attached in the AI Studio Secrets panel, I can directly analyze and update your schedule for you.",
      modelUsed: modelName,
    };
  }

  const systemInstruction = `You are Routinely AI, an intelligent, empathetic student routine coach and schedule manager.
Your job is to help the student understand, plan, review, and modify their recurring weekly schedule (Monday through Saturday, and optional Sunday).

The user's current master schedule and categories are:
CURRENT_SCHEDULE:
${JSON.stringify(currentSchedule, null, 2)}

CATEGORIES:
${JSON.stringify(categories, null, 2)}

CAPABILITIES:
1. Explain the schedule in clear, encouraging, student-friendly language.
2. If the user asks what changes AI can make or says they don't understand how text editing works, explain clearly that they can simply type natural phrases like:
   - "Shift my morning wake up to 6:00 AM on all days"
   - "Add a 45-minute LeetCode session every Tuesday and Thursday at 6:30 PM"
   - "Remove college assignment from Saturday"
   - "Create a balanced revision routine for midterms"
   Explain that you will generate the exact changes and present an "Apply Changes" button to update their routine in 1 click!
3. When the user requests a change to their routine (adding, modifying, or deleting tasks), you MUST include a JSON block at the end of your response with the exact structured actions.
Format:
\`\`\`json
{
  "actions": [
    {
      "type": "ADD",
      "day": "tuesday",
      "title": "Practice LeetCode",
      "time": "18:30",
      "description": "Two pointers and binary search",
      "categoryId": "coding"
    },
    {
      "type": "UPDATE",
      "id": "m-1",
      "time": "06:00"
    },
    {
      "type": "DELETE",
      "id": "task_id_here",
      "title": "Task title to remove",
      "day": "saturday"
    }
  ]
}
\`\`\`
Ensure times are in 24-hour "HH:MM" format. Days are lowercase: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday".
Category IDs should match one of: "study", "coding", "college", "health", "personal", "revision", or custom categories in the list.

Always be polite, structured, and helpful. In your natural text, clearly list out the changes you are proposing so the student knows exactly what is happening before applying.`;

  // Format conversation contents for generateContent
  const contents = history.map((msg) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  // Models to attempt in order if high demand 503 or transient errors occur
  const candidateModels = [
    modelName,
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
  ].filter((m, idx, arr) => arr.indexOf(m) === idx); // Deduplicate

  let lastError: any = null;

  for (const candidate of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: candidate,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const fullText = response.text || '';

      // Extract any json block with actions
      let actions: ScheduleAction[] | undefined = undefined;
      let cleanReply = fullText;

      const jsonMatch = fullText.match(/```(?:json)?\s*(\{[\s\S]*?"actions"[\s\S]*?\})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (Array.isArray(parsed.actions)) {
            actions = parsed.actions;
            cleanReply = fullText.replace(jsonMatch[0], '').trim();
          }
        } catch (e) {
          console.error('Failed to parse actions JSON from Gemini response', e);
        }
      }

      return {
        reply: cleanReply,
        actions,
        modelUsed: candidate,
      };
    } catch (err: any) {
      console.warn(`Model ${candidate} failed with error:`, err?.message || err);
      lastError = err;
      // If it was a 503 (high demand) or 429 (rate limit), continue to next model in chain
      continue;
    }
  }

  // If all models failed, provide a user-friendly explanation rather than a raw dump
  const errorMessage = lastError?.message || 'High server demand';
  let friendlyReason = 'The Gemini AI service is currently experiencing a temporary spike in traffic.';
  if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('UNAVAILABLE')) {
    friendlyReason = 'The AI model is temporarily experiencing high server demand from Google Cloud. Please wait a moment and try again!';
  }

  return {
    reply: `⚠️ **Temporary Service Busy**\n\n${friendlyReason}\n\n*Tip: Try asking your request again in a few seconds, or switch the model in the top-right selector.*`,
    modelUsed: modelName,
  };
}
