import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Users, MessageCircle, Sparkles } from "lucide-react";

export default function Handoff() {
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    setLocation("/guest-ground");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden bg-black">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full space-y-10 text-center"
      >
        <div className="space-y-4">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex justify-center"
          >
            <div className="p-6 bg-amber-500/10 rounded-full ring-1 ring-amber-400/30">
              <Users className="w-12 h-12 text-amber-400" />
            </div>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white">Now, explain the magic</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Before you hand over the phone, tell them what this is about...
          </p>
        </div>

        <div className="space-y-4 text-left bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/20 rounded-lg shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-white font-medium">Say something like:</p>
              <p className="text-muted-foreground mt-2 italic">
                "I'd love to have a short conversation with you about what you want for 2026. 
                The phone will record your answers and create something meaningful from it."
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 pt-4 border-t border-white/10">
            <div className="p-2 bg-pink-500/20 rounded-lg shrink-0">
              <Sparkles className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-white font-medium">What they'll get:</p>
              <p className="text-muted-foreground mt-2">
                AI-powered insights about their intention, a memory poster, and ideas to keep the conversation going.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleContinue}
            className="w-full h-16 text-xl font-semibold bg-white text-black hover:bg-white/90 rounded-full shadow-xl"
            data-testid="button-handoff"
          >
            Hand Over the Phone <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
