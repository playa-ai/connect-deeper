import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Waves, Shield, Zap, Gift } from "lucide-react";

const guestSteps = [
  {
    icon: Waves,
    title: "Breathe",
    instruction: "Take a slow breath in... and out. You're safe here.",
  },
  {
    icon: Shield,
    title: "No pressure",
    instruction: "There are no wrong answers. Share only what feels right.",
  },
  {
    icon: Zap,
    title: "Be real",
    instruction: "The magic happens when you're authentic. Your truth matters.",
  },
];

export default function GuestGrounding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < guestSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setShowContinue(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleContinue = () => {
    setLocation("/consent");
  };

  const handleSkip = () => {
    setLocation("/consent");
  };

  const CurrentIcon = guestSteps[currentStep].icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden bg-black">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full space-y-10 text-center"
      >
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-4 rounded-2xl border border-white/10"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-pink-400" />
            <p className="text-xs text-pink-400 uppercase tracking-wider font-semibold">What you'll get</p>
          </div>
          <p className="text-white/80 text-sm">
            Insights about your 2026 intention, a personalized memory poster, and ideas to keep growing.
          </p>
        </motion.div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Your moment</p>
          <h1 className="text-3xl font-bold text-white">Get Present</h1>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {guestSteps.map((_, index) => (
            <div 
              key={index}
              className={`h-1 w-12 rounded-full transition-all duration-500 ${
                index <= currentStep ? 'bg-blue-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-6 bg-blue-500/10 rounded-full ring-1 ring-blue-400/30"
            >
              <CurrentIcon className="w-12 h-12 text-blue-400" />
            </motion.div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              {guestSteps[currentStep].title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {guestSteps[currentStep].instruction}
            </p>
          </div>
        </motion.div>

        <div className="pt-8 space-y-3">
          {showContinue ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button 
                onClick={handleContinue}
                className="w-full h-16 text-xl font-semibold bg-white text-black hover:bg-white/90 rounded-full shadow-xl"
                data-testid="button-continue-guest-grounding"
              >
                I'm Ready <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </motion.div>
          ) : (
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-muted-foreground hover:text-white"
              data-testid="button-skip-guest-grounding"
            >
              Skip
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
