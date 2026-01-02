export type VibeLevel = 'light' | 'middle' | 'deep';

export const QUESTIONS: Record<VibeLevel, string[]> = {
  light: [
    "What magic do you want more of in 2026?",
    "What's the weirdest thing that makes you feel alive?",
    "What gift can you give me right now that money can't buy?"
  ],
  middle: [
    "If 2026 was your masterpiece, what would it look like?",
    "What beautiful risk is calling your name this year?",
    "When we meet again on the playa, what will we remember about this moment?"
  ],
  deep: [
    "What sacred fire needs to burn for your intention to rise from the ashes?",
    "What are you finally ready to release into the desert wind?",
    "What truth do you need to hear that no one has been brave enough to tell you?"
  ]
};

export const getVibeLevel = (depth: number): VibeLevel => {
  if (depth <= 33) return 'light';
  if (depth <= 66) return 'middle';
  return 'deep';
};

export const getQuestions = (vibeDepth: number): string[] => {
  return QUESTIONS[getVibeLevel(vibeDepth)];
};
