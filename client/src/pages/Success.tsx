import { useState } from "react";
import { useLocation } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Star, Share2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Success() {
  const [, setLocation] = useLocation();
  const { updateData, reset } = useConnection();
  const [nps, setNps] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleDone = () => {
    updateData({
      npsScore: nps,
      feedbackText: feedback,
    });
    // In a real app, we would upload everything here
    toast({
      title: "Connection Saved",
      description: "We've captured your intention and connection.",
    });
    
    // Simulate data save delay
    setTimeout(() => {
        reset();
        setLocation("/");
    }, 500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Connection App',
        text: 'I just had a meaningful conversation using Connection.',
        url: window.location.origin,
      }).catch(console.error);
    } else {
        navigator.clipboard.writeText(window.location.origin);
        toast({
            title: "Link Copied",
            description: "Share the link with a friend!",
        });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto relative bg-background">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full space-y-10"
      >
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-tr from-primary to-accent rounded-full mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.3)]"
          >
            <span className="text-4xl">✨</span>
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Saved</h1>
            <p className="text-muted-foreground max-w-xs mx-auto">
              We'll send you a reminder of your intention on January 1st.
            </p>
          </div>
        </div>

        <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5">
          <div className="space-y-3">
             <label className="text-sm font-medium text-white/80 block text-center">
               How was this experience?
             </label>
             <div className="flex justify-between items-center px-2">
                <span className="text-2xl grayscale opacity-50">😐</span>
                <div className="flex gap-1 overflow-x-auto py-2 px-2 mask-linear">
                   {[0,1,2,3,4,5,6,7,8,9,10].map((num) => (
                       <button
                         key={num}
                         onClick={() => setNps(num)}
                         className={`w-9 h-12 rounded-lg font-bold text-sm transition-all flex items-center justify-center flex-shrink-0 ${
                             nps === num 
                             ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" 
                             : "bg-white/5 text-muted-foreground hover:bg-white/10"
                         }`}
                       >
                           {num}
                       </button>
                   ))}
                </div>
                <span className="text-2xl">🤩</span>
             </div>
          </div>

          <Textarea 
            placeholder="What would make it better? (Optional)" 
            className="bg-black/20 border-white/10 min-h-[80px] rounded-xl text-sm"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <div className="space-y-4">
            <Button 
                onClick={handleDone}
                className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-white/90 rounded-full"
            >
                Done
            </Button>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
            </div>

            <Button 
                variant="outline"
                onClick={handleShare}
                className="w-full h-14 text-lg border-white/10 hover:bg-white/5 hover:text-white rounded-full bg-transparent text-muted-foreground"
            >
                <Share2 className="mr-2 w-5 h-5" /> Share with a friend
            </Button>
        </div>
      </motion.div>
    </div>
  );
}
