import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

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
                Burn<br/>Together.
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
                A stranger is just a gift you haven't unwrapped yet. Ready to exchange some cosmic intentions?
            </p>

            <div className="pt-8">
                <Button 
                    onClick={() => setLocation("/capture")}
                    className="w-full h-16 text-xl font-semibold bg-white text-black hover:bg-white/90 hover:scale-[1.02] transition-all rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                    Let's Play <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
            </div>
        </motion.div>
    </div>
  );
}
