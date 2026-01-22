import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Compass, MessageCircle, Sparkles } from "lucide-react";

export default function Explain() {
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    setLocation("/consent");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8 max-w-md w-full"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Here's what you're about to do
        </h1>

        <div className="space-y-4 text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/10"
          >
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Pick a vibe</p>
              <p className="text-sm text-muted-foreground">Playful or meaningful — you decide the tone</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/10"
          >
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Answer a few prompts</p>
              <p className="text-sm text-muted-foreground">Share what's on your mind for 2026</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/10"
          >
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Get an insight + next step</p>
              <p className="text-sm text-muted-foreground">AI creates a memory you can keep</p>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-4 space-y-3"
        >
          <Button 
            onClick={handleContinue}
            className="w-full h-16 text-xl font-semibold bg-white text-black hover:bg-white/90 hover:scale-[1.02] transition-all rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            data-testid="button-got-it"
          >
            Got it — let's begin <ArrowRight className="ml-2 w-6 h-6" />
          </Button>

          <p className="text-xs text-muted-foreground">
            Private by default. Nothing shared without permission.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
