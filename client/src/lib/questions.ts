export type VibeLevel = 'fun' | 'meaningful';

export const INTENTION_QUESTION = "What's your intention for 2026?";

export const QUESTIONS: Record<VibeLevel, string[]> = {
  fun: [
    "What do you need more of in 2026?",
    "What's something about you that would surprise me?",
    "What gift could you give me right now that costs nothing?"
  ],
  meaningful: [
    "What needs to change in your life for that intention to happen?",
    "What are you ready to let go of?",
    "What do you need to hear right now that you haven't heard enough?"
  ]
};

export const getVibeLevel = (depth: number): VibeLevel => {
  if (depth <= 50) return 'fun';
  return 'meaningful';
};

export const getQuestions = (vibeDepth: number): string[] => {
  return [INTENTION_QUESTION, ...QUESTIONS[getVibeLevel(vibeDepth)]];
};
