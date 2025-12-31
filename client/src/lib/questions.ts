export type VibeLevel = 'light' | 'middle' | 'deep';

export const QUESTIONS: Record<VibeLevel, string[]> = {
  light: [
    "What do you need more of in 2026?",
    "What's something about you that would surprise me?",
    "What gift could you give me right now that costs nothing?"
  ],
  middle: [
    "What would make 2026 your best year yet?",
    "What's a risk you want to take this year?",
    "What do you hope we both remember from this conversation?"
  ],
  deep: [
    "What needs to change in your life for that intention to happen?",
    "What are you ready to let go of?",
    "What do you need to hear right now that you haven't heard enough?"
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
