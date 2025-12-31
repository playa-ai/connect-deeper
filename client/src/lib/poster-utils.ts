export const generatePosterData = (vibeDepth: number, intention: string) => {
    // Determine vibe category
    const vibeLevel = vibeDepth <= 33 ? 'Grounding' : vibeDepth <= 66 ? 'Connecting' : 'Transcending';
    
    // Mock extracting insights from "audio"
    const insights = [
      vibeLevel,
      "Presence",
      "Authenticity",
      "Growth"
    ];
  
    // Determine color scheme based on vibe
    let colorScheme = "from-blue-500 to-purple-600";
    if (vibeDepth > 33 && vibeDepth <= 66) colorScheme = "from-pink-500 to-orange-500";
    if (vibeDepth > 66) colorScheme = "from-indigo-500 to-cyan-400";
  
    return {
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      intention,
      insights,
      vibeLevel,
      colorScheme,
      audioDuration: "3:42" // Mock duration text
    };
  };
  
  export type PosterData = ReturnType<typeof generatePosterData>;
