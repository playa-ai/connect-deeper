export type VibeQuadrant = 'playful-warm' | 'deep-intimate' | 'playful-curious' | 'deep-philosophical';

export const INTENTION_QUESTION = "What's your intention for 2026?";

// Questions for each quadrant
export const QUADRANT_QUESTIONS: Record<VibeQuadrant, string[]> = {
  'playful-warm': [
    "What makes you feel most alive?",
    "Who do you want to spend more time with this year?",
    "What's a simple joy you want more of?"
  ],
  'deep-intimate': [
    "What do you need to hear right now that you haven't heard enough?",
    "What are you ready to let go of?",
    "What would it feel like to fully trust yourself?"
  ],
  'playful-curious': [
    "What's something about you that would surprise me?",
    "What would you attempt if you couldn't fail?",
    "What skill or hobby are you curious to explore?"
  ],
  'deep-philosophical': [
    "What needs to change in your life for that intention to happen?",
    "What legacy do you want to leave behind?",
    "What truth have you been avoiding?"
  ]
};

export const QUADRANT_LABELS: Record<VibeQuadrant, { name: string; description: string }> = {
  'playful-warm': { name: 'Playful & Warm', description: 'Light-hearted and heartfelt' },
  'deep-intimate': { name: 'Deep & Intimate', description: 'Emotionally profound' },
  'playful-curious': { name: 'Playful & Curious', description: 'Fun and thought-provoking' },
  'deep-philosophical': { name: 'Deep & Philosophical', description: 'Intellectually deep' }
};

// Get quadrant based on 2D position (-100 to 100 for each axis)
export const getVibeQuadrant = (depth: number, heart: number): VibeQuadrant => {
  const isDeep = depth > 0;
  const isHeart = heart > 0;
  
  if (!isDeep && isHeart) return 'playful-warm';
  if (isDeep && isHeart) return 'deep-intimate';
  if (!isDeep && !isHeart) return 'playful-curious';
  return 'deep-philosophical';
};

export const getQuestions = (vibeDepth: number, vibeHeart: number = 0): string[] => {
  const quadrant = getVibeQuadrant(vibeDepth, vibeHeart);
  return [INTENTION_QUESTION, ...QUADRANT_QUESTIONS[quadrant]];
};

// Legacy support
export type VibeLevel = 'fun' | 'meaningful';
export const getVibeLevel = (depth: number): VibeLevel => {
  if (depth <= 50) return 'fun';
  return 'meaningful';
};
