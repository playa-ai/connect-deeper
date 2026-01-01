import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Share2, Download, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generatePosterData, type PosterData } from "@/lib/poster-utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export default function Results() {
  const [, setLocation] = useLocation();
  const { data, updateData, reset } = useConnection();
  const [processingState, setProcessingState] = useState<'analyzing' | 'generating' | 'complete'>('analyzing');
  const [posterData, setPosterData] = useState<PosterData | null>(null);
  
  // Feedback State
  const [nps, setNps] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  // Email form
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // Simulate AI Processing
  useEffect(() => {
    // Step 1: Analyzing Audio
    const timer1 = setTimeout(() => {
      setProcessingState('generating');
    }, 2000);

    // Step 2: Generating Poster
    const timer2 = setTimeout(() => {
      setPosterData(generatePosterData(data.vibeDepth, data.intentionText));
      setProcessingState('complete');
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [data.vibeDepth, data.intentionText]);

  const handleEmailSubmit = (values: z.infer<typeof emailSchema>) => {
    updateData({ guestEmail: values.email });
    toast({
      title: "Poster Sent!",
      description: `We've emailed your connection poster to ${values.email}`,
    });
  };

  const handleDone = () => {
    updateData({
        npsScore: nps,
        feedbackText: feedback,
    });
    
    // Simulate save
    toast({
        title: "Session Saved",
        description: "Thank you for connecting.",
    });

    setTimeout(() => {
      reset();
      setLocation("/");
    }, 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My 2026 Connection',
        text: `My intention for 2026: ${data.intentionText}`,
        url: window.location.origin,
      }).catch(console.error);
    } else {
      toast({ title: "Copied to clipboard" });
    }
  };

  if (processingState !== 'complete' || !posterData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 bg-background relative overflow-hidden">
        {/* Loading Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {processingState === 'analyzing' ? 'Analyzing Conversation...' : 'Designing Your Poster...'}
          </h2>
          <p className="text-muted-foreground">
            {processingState === 'analyzing' 
              ? 'Extracting insights from voice interaction' 
              : 'Creating a visual artifact of your connection'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 py-8 bg-background overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 pb-12"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Your Connection Artifact</h1>
          <p className="text-muted-foreground">Generated from your voice & intention</p>
        </div>

        {/* The Poster Card */}
        <div className={`relative w-full aspect-[4/5] rounded-3xl overflow-hidden p-8 flex flex-col justify-between shadow-2xl bg-gradient-to-br ${posterData.colorScheme}`}>
          {/* Abstract Texture Overlay */}
          <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <Sparkles className="text-white/80 w-8 h-8" />
              <span className="text-white/60 font-mono text-sm tracking-widest uppercase">{posterData.date}</span>
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest uppercase text-white/60">2026 Intention</span>
              <h2 className="text-3xl font-display font-bold text-white leading-tight">
                "{posterData.intention}"
              </h2>
            </div>

            <div className="space-y-4 pt-4">
              <span className="text-xs font-bold tracking-widest uppercase text-white/60">Voice Insights</span>
              <div className="flex flex-wrap gap-2">
                {posterData.insights.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/20 pt-6 mt-4">
            <div className="flex justify-between items-center text-white/80 text-sm font-mono">
              <span>{posterData.vibeLevel} Vibe</span>
              <span>{posterData.audioDuration}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleShare} className="h-12 border-white/10 hover:bg-white/5">
            <Share2 className="mr-2 w-4 h-4" /> Share
            </Button>
            <Button variant="outline" className="h-12 border-white/10 hover:bg-white/5">
            <Download className="mr-2 w-4 h-4" /> Save Image
            </Button>
        </div>

        {/* Email Capture */}
        <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
            <div className="text-center space-y-1">
            <h3 className="font-medium text-white">Save this memory</h3>
            <p className="text-sm text-muted-foreground">Enter your email to receive this poster</p>
            </div>
            
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailSubmit)} className="flex gap-2">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <FormControl>
                        <Input placeholder="your@email.com" {...field} className="bg-black/20 border-white/10 text-white" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
                <ArrowRight className="w-4 h-4" />
                </Button>
            </form>
            </Form>
        </div>

        {/* Feedback Section */}
        <div className="space-y-6 border-t border-white/10 pt-8">
             <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 block text-center">
                    How was this experience?
                </label>
                <div className="flex justify-between items-center px-2">
                    <span className="text-2xl grayscale opacity-50">😐</span>
                    <div className="flex gap-2 overflow-x-auto py-2 px-2 mask-linear no-scrollbar">
                        {[1,2,3,4,5].map((num) => (
                            <button
                                key={num}
                                onClick={() => setNps(num * 2)} // Mapping 1-5 to 2-10 scale roughly or just use 1-5
                                className={`w-10 h-10 rounded-full font-bold text-sm transition-all flex items-center justify-center flex-shrink-0 ${
                                    (nps || 0) / 2 === num 
                                    ? "bg-accent text-black scale-110 shadow-lg shadow-accent/30" 
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
                placeholder="Any thoughts on how we can improve?" 
                className="bg-black/20 border-white/10 min-h-[80px] rounded-xl text-sm"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
            />

            <Button 
                onClick={handleDone}
                className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-white/90 rounded-full"
            >
                Start New Connection
            </Button>
        </div>

      </motion.div>
    </div>
  );
}
