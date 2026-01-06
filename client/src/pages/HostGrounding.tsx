import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Ear, Heart } from "lucide-react";

const groundingSteps = [
  {
    icon: Eye,
    title: "See them",
    instruction: "Look at who you're about to connect with. Notice something genuine about them.",
  },
  {
    icon: Ear,
    title: "Be present",
    instruction: "Take a breath. Let go of what happened before. This moment is fresh.",
  },
  {
    icon: Heart,
    title: "Open up",
    instruction: "Come with curiosity, not an agenda. Let the conversation surprise you.",
  },
];

export default function HostGrounding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < groundingSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setShowContinue(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleContinue = () => {
    setLocation("/handoff");
  };

  const handleSkip = () => {
    setLocation("/handoff");
  };

  const CurrentIcon = groundingSteps[currentStep].icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden bg-black">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full space-y-12 text-center"
      >
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Before you begin</p>
          <h1 className="text-3xl font-bold text-white">Get Present</h1>
          <p className="text-muted-foreground">You're about to help someone explore their 2026 goals</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {groundingSteps.map((_, index) => (
            <div 
              key={index}
              className={`h-1 w-12 rounded-full transition-all duration-500 ${
                index <= currentStep ? 'bg-primary' : 'bg-white/10'
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
              className="p-6 bg-primary/10 rounded-full ring-1 ring-primary/30"
            >
              <CurrentIcon className="w-12 h-12 text-primary" />
            </motion.div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              {groundingSteps[currentStep].title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {groundingSteps[currentStep].instruction}
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
                data-testid="button-continue-grounding"
              >
                I'm Ready <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </motion.div>
          ) : (
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-muted-foreground hover:text-white"
              data-testid="button-skip-grounding"
            >
              Skip
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
