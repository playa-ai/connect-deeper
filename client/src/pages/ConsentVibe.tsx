import { useState } from "react";
import { useLocation } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mic, Loader2, Sparkles } from "lucide-react";
import VibePicker2D from "@/components/VibePicker2D";
import { createConnection } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function ConsentVibe() {
  const [, setLocation] = useLocation();
  const { updateData } = useConnection();
  const [vibeDepth, setVibeDepth] = useState(0);
  const [vibeHeart, setVibeHeart] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleVibeChange = (depth: number, heart: number) => {
    setVibeDepth(depth);
    setVibeHeart(heart);
  };
  
  const handleConnect = async () => {
    setIsSaving(true);
    try {
      const connection = await createConnection({
        hostId: "host-" + Date.now(),
        intentionText: "",
        vibeDepth: vibeDepth,
        vibeHeart: vibeHeart,
        guestConsented: true,
      });

      updateData({
        connectionId: connection.id,
        vibeDepth: vibeDepth,
        vibeHeart: vibeHeart,
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
        className="w-full space-y-8"
      >
        <motion.a 
          href="https://playa-ai.org" 
          target="_blank" 
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group"
        >
          <Sparkles className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
          <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
            A connection experiment by <span className="text-primary font-semibold">Playa AI</span>
          </span>
        </motion.a>

        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-white">Choose your vibe</h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Tap anywhere on the grid to set the conversation tone.
          </p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm shadow-xl">
          <VibePicker2D 
            onValueChange={handleVibeChange}
            initialDepth={vibeDepth}
            initialHeart={vibeHeart}
          />
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleConnect}
            disabled={isSaving}
            className="w-full h-16 text-xl font-semibold bg-white text-black hover:bg-white/90 rounded-full shadow-xl shadow-white/5"
            data-testid="button-connect"
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
          
          <p className="text-xs text-muted-foreground">
            Private by default. Nothing shared without permission.
          </p>

          <Button 
            variant="ghost" 
            onClick={handleDecline}
            disabled={isSaving}
            className="w-full text-muted-foreground hover:text-white"
            data-testid="button-decline"
          >
            Not this time
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
