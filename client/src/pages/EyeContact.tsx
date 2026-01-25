import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Eye, ArrowRight } from "lucide-react";

export default function EyeContact() {
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    setLocation("/recording");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden bg-black">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full space-y-10 text-center"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="p-8 bg-white/5 rounded-full ring-1 ring-white/10"
            >
              <Eye className="w-16 h-16 text-white/80" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold text-white leading-tight">
            Put the phone down
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            Look into each other's eyes for a moment before you begin.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-8"
        >
          <Button 
            onClick={handleContinue}
            className="w-full h-16 text-xl font-semibold bg-white text-black hover:bg-white/90 rounded-full shadow-xl shadow-white/5"
            data-testid="button-ready"
          >
            We're ready <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
