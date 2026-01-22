import { useState } from "react";
import { useLocation } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const INTENTION_CHIPS = [
  "Growth",
  "Love", 
  "Health",
  "Career",
  "Adventure",
  "Peace"
];

export default function Hook() {
  const [, setLocation] = useLocation();
  const { reset } = useConnection();
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  const handleStart = () => {
    reset();
    setLocation("/explain");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8 max-w-md w-full"
      >
        <motion.a 
          href="https://playa-ai.org" 
          target="_blank" 
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group"
        >
          <Sparkles className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
          <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
            A connection experiment by <span className="text-primary font-semibold">Playa AI</span>
          </span>
        </motion.a>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
          What matters most<br/>right now?
        </h1>

        <p className="text-lg text-muted-foreground">
          Pick one that resonates:
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {INTENTION_CHIPS.map((chip) => (
            <motion.button
              key={chip}
              onClick={() => setSelectedChip(chip)}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-3 rounded-full text-base font-medium transition-all ${
                selectedChip === chip
                  ? "bg-white text-black shadow-lg shadow-white/20"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              }`}
              data-testid={`chip-${chip.toLowerCase()}`}
            >
              {chip}
            </motion.button>
          ))}
        </div>

        <div className="pt-6 space-y-3">
          <Button 
            onClick={handleStart}
            disabled={!selectedChip}
            className="w-full h-16 text-lg font-semibold bg-white text-black hover:bg-white/90 hover:scale-[1.02] transition-all rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            data-testid="button-experiment"
          >
            Want to try a 60-second experiment? <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <p className="text-xs text-muted-foreground">
            Private by default. Nothing shared without permission.
          </p>

          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="text-muted-foreground hover:text-white"
            data-testid="button-not-now"
          >
            Not now
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
