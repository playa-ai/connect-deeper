import { useState } from "react";
import { useLocation } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Mic, X } from "lucide-react";
import { getVibeLevel } from "@/lib/questions";

export default function ConsentVibe() {
  const [, setLocation] = useLocation();
  const { updateData, data } = useConnection();
  const [vibe, setVibe] = useState(50);

  const vibeLevel = getVibeLevel(vibe);
  
  const handleConnect = () => {
    updateData({
      vibeDepth: vibe,
      guestConsented: true,
    });
    setLocation("/recording");
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
          <h1 className="text-4xl font-bold text-white">Ready to go deeper?</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We'll record a 3-minute conversation. Your words stay private unless you choose to share them.
          </p>
        </div>

        <div className="space-y-8 bg-white/5 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
          <div className="flex justify-between items-center text-sm font-medium tracking-widest uppercase text-muted-foreground">
            <span className={vibeLevel === 'light' ? 'text-primary' : ''}>Light</span>
            <span className={vibeLevel === 'middle' ? 'text-primary' : ''}>Middle</span>
            <span className={vibeLevel === 'deep' ? 'text-primary' : ''}>Deep</span>
          </div>
          
          <Slider
            value={[vibe]}
            onValueChange={(val) => setVibe(val[0])}
            max={100}
            step={1}
            className="py-4"
          />

          <div className="text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-white font-medium text-sm">
              Current Vibe: {vibeLevel.charAt(0).toUpperCase() + vibeLevel.slice(1)}
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            onClick={handleConnect}
            className="w-full h-16 text-xl font-semibold bg-white text-black hover:bg-white/90 rounded-full shadow-xl shadow-white/5"
          >
            Let's Connect <Mic className="ml-3 w-6 h-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleDecline}
            className="w-full text-muted-foreground hover:text-white"
          >
            Not this time
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
