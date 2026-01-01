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
            text: `Based on this conversation about someone's 2026 intention, provide meaningful insights:

Intention: "${intentionText}"

Conversation transcript:
${transcript}

Provide:
1. Key themes that emerged from the conversation
2. The core values or motivations expressed
3. An inspiring summary of their vision for 2026

Keep it concise, warm, and personal. Format with short paragraphs, no bullet points.`,
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
