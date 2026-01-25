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
  intentionSummary: string;
  insights: string;
  posterPrompt: string;
  oracleKeyword: string;
  oracleHeadline: string;
  oracleTagline: string;
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
            text: `Transcribe this audio conversation. The first question asked was "What's your intention for this season of life?" followed by: ${questionsAsked.slice(1).join(", ")}. Provide a clean transcription of what was said, capturing the speaker's answers to each question.`,
          },
        ],
      },
    ],
  });

  const transcript = transcriptionResponse.text || "";

  const intentionResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `From this conversation transcript, extract and summarize the person's intention in ONE clear sentence. The first question asked was "What's your intention for this season of life?"

Transcript:
${transcript}

RULES:
- Write exactly ONE sentence (max 20 words)
- Start with "I want to..." or "My intention is to..."
- Use plain text only - NO markdown, NO asterisks
- Capture the essence of what they said they want
- If unclear, write: "To discover what matters most"`,
          },
        ],
      },
    ],
  });

  const intentionSummary = intentionResponse.text?.trim() || "To discover what matters most";

  const insightsResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze this person's conversation about their intentions and provide structured insights.

Their stated intention: "${intentionSummary}"

Full conversation:
${transcript}

Provide insights in this exact format:
**[Compelling 3-5 word headline]**

• [Key insight about their core motivation - one sentence]
• [What makes their intention meaningful - one sentence]
• [Encouragement or path forward - one sentence]

RULES:
- Use markdown: bold headline with **, bullets with •
- Each bullet is ONE concise sentence
- Be warm, specific, and encouraging
- Focus on what makes THEIR intention unique`,
          },
        ],
      },
    ],
  });

  const insights = insightsResponse.text || "";

  // Analyze the emotional vibe of the conversation for poster colors
  const vibeResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze the emotional vibe of this conversation and intention.

Intention: "${intentionSummary}"
Conversation: ${transcript}

Respond with ONLY ONE of these vibes (just the word, nothing else):
- playful (fun, light, adventurous, creative)
- bold (ambitious, driven, powerful, determined)
- serene (peaceful, grounded, mindful, reflective)
- passionate (loving, connected, heartfelt, caring)
- curious (exploratory, learning, growing, discovering)`,
          },
        ],
      },
    ],
  });

  const vibe = vibeResponse.text?.toLowerCase().trim() || "serene";
  
  // Map vibes to color palettes for oracle cards
  const colorPalettes: Record<string, string> = {
    playful: "Vibrant citrus palette: bright orange, sunny yellow, coral pink, with energetic and joyful splashes",
    bold: "Power palette: deep crimson, gold, black and electric blue, with dynamic dramatic contrasts",
    serene: "Calm palette: soft lavender, sage green, misty blue, cream, with gentle gradients and peaceful flow",
    passionate: "Warm heart palette: rich burgundy, rose gold, soft blush, warm amber, with intimate flowing textures",
    curious: "Discovery palette: teal, golden amber, cosmic purple, starlight white, with exploratory celestial elements",
  };
  
  const colorPalette = colorPalettes[vibe] || colorPalettes.serene;

  // Extract a key evocative word from the conversation for the oracle card
  const keywordResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Extract ONE powerful, evocative word from this conversation that captures its essence. This word will be featured prominently on an oracle card.

Intention: "${intentionSummary}"
Conversation: ${transcript}

RULES:
- Choose ONE single word (not a phrase)
- The word should be evocative, emotional, or action-oriented
- Examples: BLOOM, FLOW, IGNITE, TRUST, CREATE, RADIATE, SOAR, BREATHE, SHINE, EVOLVE
- Make it feel like an oracle card keyword
- Return ONLY the word in UPPERCASE, nothing else`,
          },
        ],
      },
    ],
  });

  const oracleKeyword = keywordResponse.text?.trim().toUpperCase() || "INTENTION";

  // Generate oracle card headline and tagline
  const headlineResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Create an oracle card headline and tagline based on this intention and conversation.

Intention: "${intentionSummary}"
Key word: ${oracleKeyword}
Insights: ${insights}

Provide in this exact format (two lines only):
[2-3 WORD HEADLINE IN CAPS]
[5-7 word tagline in lowercase]

Examples:
LIBERATED CREATION
authentic brilliance unleashed

SACRED MOMENTUM  
where purpose meets inspired action

WILD BECOMING
embrace the fullness of now

Return ONLY the two lines, nothing else.`,
          },
        ],
      },
    ],
  });

  const headlineText = headlineResponse.text?.trim() || "INNER WISDOM\nyour truth illuminated";
  const headlineLines = headlineText.split('\n').map(l => l.trim());
  const oracleHeadline = headlineLines[0]?.toUpperCase() || "INNER WISDOM";
  const oracleTagline = headlineLines[1]?.toLowerCase() || "your truth illuminated";

  const posterResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Create an artistic image prompt for a mystical ORACLE CARD poster based on this intention:

Key word to feature: "${oracleKeyword}" (must appear artistically integrated into the design, repeated in different sizes/opacities)
Headline: "${oracleHeadline}"
Tagline: "${oracleTagline}"
Intention: "${intentionSummary}"
Emotional vibe: ${vibe}

Create a prompt for an ORACLE CARD style poster with these requirements:
- ASPECT RATIO: 9:16 PORTRAIT orientation (tall, vertical oracle card)
- The word "${oracleKeyword}" should appear ARTISTICALLY INTEGRATED into the imagery - repeated in different sizes, layered, flowing through the design
- At the BOTTOM: bold headline "${oracleHeadline}" with smaller tagline "${oracleTagline}" below it
- ${colorPalette}
- Mystical, cosmic, spiritual art style - like a beautiful oracle/tarot card
- Abstract flowing imagery: energy bursts, cosmic swirls, flowing ribbons, crystal shards, sacred geometry
- FULL BLEED: artwork fills edge-to-edge, no borders or frames
- Typography is elegant, mystical, integrated into the art

IMPORTANT: Begin prompt with "9:16 portrait oracle card, typography integrated, "

Return ONLY the image generation prompt. Keep under 120 words.`,
          },
        ],
      },
    ],
  });

  const posterPrompt = posterResponse.text || "";

  return {
    transcript,
    intentionSummary,
    insights,
    posterPrompt,
    oracleKeyword,
    oracleHeadline,
    oracleTagline,
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
            text: `Based on this conversation about someone's intention, generate follow-up suggestions to continue the connection RIGHT NOW while you're still together.

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
