import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

export interface AnalysisResult {
  transcript: string;
  insights: string;
  posterPrompt: string;
}

export async function analyzeAudio(
  audioBase64: string,
  intentionText: string,
  questionsAsked: string[]
): Promise<AnalysisResult> {
  const base64Data = audioBase64.includes(",") 
    ? audioBase64.split(",")[1] 
    : audioBase64;

  const mimeType = audioBase64.startsWith("data:audio/webm")
    ? "audio/webm"
    : audioBase64.startsWith("data:audio/mp4")
    ? "audio/mp4"
    : "audio/webm";

  const transcriptionResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: `Transcribe this audio conversation. The conversation is about someone's intention for 2026: "${intentionText}". They were asked these questions: ${questionsAsked.join(", ")}. Provide a clean transcription of what was said.`,
          },
        ],
      },
    ],
  });

  const transcript = transcriptionResponse.text || "";

  const insightsResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Write a brief, uplifting summary of this person's 2026 intention.

Intention: "${intentionText}"

Conversation context:
${transcript}

RULES:
- Write ONLY 2-3 short sentences (max 50 words total)
- Use plain text only - NO markdown, NO asterisks, NO bold formatting
- Be warm and encouraging
- Focus on their core motivation and vision
- Start directly with the insight, no intro phrases`,
          },
        ],
      },
    ],
  });

  const insights = insightsResponse.text || "";

  const posterResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Create an artistic image prompt for a beautiful poster based on this intention and conversation:

Intention: "${intentionText}"
Key insights: ${insights}

Create a prompt for generating an inspiring, abstract artistic poster that captures the emotional essence and themes. The style should be:
- Modern and elegant
- Deep purple and coral color palette
- Abstract or metaphorical imagery
- Inspirational and uplifting mood

Return ONLY the image generation prompt, nothing else. Keep it under 100 words.`,
          },
        ],
      },
    ],
  });

  const posterPrompt = posterResponse.text || "";

  return {
    transcript,
    insights,
    posterPrompt,
  };
}

export interface FollowUpResult {
  deeperQuestions: string[];
  topicsToExplore: string[];
  actionItems: string[];
}

export async function generateFollowUp(
  intentionText: string,
  transcript: string,
  insights: string
): Promise<FollowUpResult> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Based on this conversation about someone's 2026 intention, generate follow-up suggestions to continue the connection RIGHT NOW while you're still together.

Intention: "${intentionText}"

Conversation transcript:
${transcript}

Insights: ${insights}

Generate exactly:
1. THREE deeper questions to ask each other right now (open-ended, personal, builds on what was shared)
2. THREE topics to explore together in the moment (activities, shared interests mentioned, experiences)
3. THREE immediate action items to do before parting ways (exchange info, make plans, commitments)

Format your response EXACTLY like this (use this exact format with the headers):
DEEPER_QUESTIONS:
- [question 1]
- [question 2]
- [question 3]

TOPICS_TO_EXPLORE:
- [topic 1]
- [topic 2]
- [topic 3]

ACTION_ITEMS:
- [action 1]
- [action 2]
- [action 3]

Be warm, specific to their conversation, and encourage immediate action while they're still together.`,
          },
        ],
      },
    ],
  });

  const text = response.text || "";
  
  const parseSection = (header: string): string[] => {
    const regex = new RegExp(`${header}:\\s*\\n([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`, 'i');
    const match = text.match(regex);
    if (!match) return [];
    return match[1]
      .split('\n')
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 3);
  };

  return {
    deeperQuestions: parseSection('DEEPER_QUESTIONS'),
    topicsToExplore: parseSection('TOPICS_TO_EXPLORE'),
    actionItems: parseSection('ACTION_ITEMS'),
  };
}

export async function generatePosterImage(prompt: string): Promise<string> {
  const { Modality } = await import("@google/genai");
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  const candidate = response.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find(
    (part: { inlineData?: { data?: string; mimeType?: string } }) => part.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("No image data in response");
  }

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  return `data:${mimeType};base64,${imagePart.inlineData.data}`;
}
