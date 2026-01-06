import { useState } from "react";
import { useLocation } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, Sparkles, Heart } from "lucide-react";
import { getVibeLevel } from "@/lib/questions";
import { createConnection } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function ConsentVibe() {
  const [, setLocation] = useLocation();
  const { updateData } = useConnection();
  const [vibe, setVibe] = useState(50);
  const [isSaving, setIsSaving] = useState(false);

  const vibeLevel = getVibeLevel(vibe);
  
  const handleConnect = async () => {
    setIsSaving(true);
    try {
      const connection = await createConnection({
        hostId: "host-" + Date.now(),
        intentionText: "",
        vibeDepth: vibe,
        guestConsented: true,
      });

      updateData({
        connectionId: connection.id,
        vibeDepth: vibe,
        guestConsented: true,
      });
      
      setLocation("/recording");
    } catch (error) {
      console.error("Error creating connection:", error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDecline = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full space-y-10"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Let's begin</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            You'll answer a few questions about your 2026 intentions. Your words stay private unless you choose to share them.
          </p>
        </div>

        <div className="space-y-6 bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm shadow-xl">
          <div className="flex justify-between items-center">
            <motion.div 
              className={`flex flex-col items-center gap-2 transition-all duration-300 ${vibeLevel === 'fun' ? 'scale-110' : 'opacity-50'}`}
            >
              <div className={`p-3 rounded-2xl ${vibeLevel === 'fun' ? 'bg-yellow-500/20 ring-2 ring-yellow-400' : 'bg-white/5'}`}>
                <Sparkles className={`w-6 h-6 ${vibeLevel === 'fun' ? 'text-yellow-400' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-sm font-bold tracking-wide ${vibeLevel === 'fun' ? 'text-yellow-400' : 'text-muted-foreground'}`}>FUN</span>
            </motion.div>
            
            <motion.div 
              className={`flex flex-col items-center gap-2 transition-all duration-300 ${vibeLevel === 'meaningful' ? 'scale-110' : 'opacity-50'}`}
            >
              <div className={`p-3 rounded-2xl ${vibeLevel === 'meaningful' ? 'bg-pink-500/20 ring-2 ring-pink-400' : 'bg-white/5'}`}>
                <Heart className={`w-6 h-6 ${vibeLevel === 'meaningful' ? 'text-pink-400' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-sm font-bold tracking-wide ${vibeLevel === 'meaningful' ? 'text-pink-400' : 'text-muted-foreground'}`}>MEANINGFUL</span>
            </motion.div>
          </div>
          
          <Slider
            value={[vibe]}
            onValueChange={(val) => setVibe(val[0])}
            max={100}
            step={1}
            className="py-4"
          />

          <AnimatePresence mode="wait">
            <motion.div 
              key={vibeLevel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center space-y-2"
            >
              <span className={`inline-block px-5 py-2 rounded-full font-semibold text-sm ${
                vibeLevel === 'fun' 
                  ? 'bg-yellow-500/20 text-yellow-300' 
                  : 'bg-pink-500/20 text-pink-300'
              }`}>
                {vibeLevel === 'fun' ? 'Light & playful questions' : 'Deep & reflective questions'}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            onClick={handleConnect}
            disabled={isSaving}
            className="w-full h-16 text-xl font-semibold bg-white text-black hover:bg-white/90 rounded-full shadow-xl shadow-white/5"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-3 w-6 h-6 animate-spin" /> Saving...
              </>
            ) : (
              <>
                Let's Connect <Mic className="ml-3 w-6 h-6" />
              </>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleDecline}
            disabled={isSaving}
            className="w-full text-muted-foreground hover:text-white"
          >
            Not this time
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
