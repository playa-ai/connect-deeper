import { useLocation } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { reset } = useConnection();

  const handleStart = () => {
    reset();
    setLocation("/ground");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 max-w-md w-full"
        >
            <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-full ring-1 ring-white/10 backdrop-blur-xl mb-4">
                <Sparkles className="w-5 h-5 text-accent mr-2" />
                <span className="text-sm font-medium text-white/80">The Connection App</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 pb-2">
                Connect<br/>Deeper.
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
                A simple way to have a meaningful conversation. One person asks, the other answers — you'll record a few questions together.
            </p>
            
            <div className="text-left space-y-3 text-muted-foreground text-sm bg-white/5 p-4 rounded-2xl">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">1.</span>
                <span>Set your intention for the conversation</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">2.</span>
                <span>Choose fun or meaningful questions</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">3.</span>
                <span>One person asks, the other answers — record it all</span>
              </div>
            </div>

            <div className="pt-8">
                <Button 
                    onClick={handleStart}
                    className="w-full h-16 text-xl font-semibold bg-white text-black hover:bg-white/90 hover:scale-[1.02] transition-all rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    data-testid="button-start-connection"
                >
                    Start Connection <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
            </div>
        </motion.div>
    </div>
  );
}
