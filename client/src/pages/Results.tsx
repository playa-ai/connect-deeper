import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Share2, Download, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { updateConnection, analyzeConnection, generatePoster } from "@/lib/api";
import { getVibeLevel } from "@/lib/questions";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export default function Results() {
  const [, setLocation] = useLocation();
  const { data, updateData, reset } = useConnection();
  const [processingState, setProcessingState] = useState<'analyzing' | 'generating' | 'complete' | 'error'>('analyzing');
  const [errorMessage, setErrorMessage] = useState("");
  
  const [transcript, setTranscript] = useState("");
  const [insights, setInsights] = useState("");
  const [posterImageUrl, setPosterImageUrl] = useState<string | null>(null);
  
  const [nps, setNps] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const runAnalysis = async () => {
    if (!data.connectionId) {
      setErrorMessage("No connection found. Please start over.");
      setProcessingState('error');
      return;
    }

    try {
      setProcessingState('analyzing');
      setErrorMessage("");
      const analysis = await analyzeConnection(data.connectionId);
      setTranscript(analysis.transcript);
      setInsights(analysis.insights);
      
      setProcessingState('generating');
      try {
        const poster = await generatePoster(data.connectionId);
        setPosterImageUrl(poster.posterImageUrl);
      } catch (posterError) {
        console.error("Poster generation failed:", posterError);
      }
      
      setProcessingState('complete');
    } catch (error) {
      console.error("Analysis failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to analyze conversation");
      setProcessingState('error');
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [data.connectionId]);

  const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    if (!data.connectionId) return;
    
    try {
      await updateConnection(data.connectionId, {
        guestEmail: values.email,
      });
      
      updateData({ guestEmail: values.email });
      
      toast({
        title: "Email Saved!",
        description: `We'll send your connection memory to ${values.email}`,
      });
    } catch (error) {
      console.error("Error updating email:", error);
      toast({
        title: "Error",
        description: "Failed to save email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDone = async () => {
    if (!data.connectionId) return;
    
    setIsSaving(true);
    try {
      await updateConnection(data.connectionId, {
        npsScore: nps,
        feedbackText: feedback,
      });

      updateData({
        npsScore: nps,
        feedbackText: feedback,
      });
      
      toast({
        title: "Session Saved",
        description: "Thank you for connecting.",
      });

      setTimeout(() => {
        reset();
        setLocation("/");
      }, 1500);
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast({
        title: "Error",
        description: "Failed to save feedback.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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

  const handleDownload = () => {
    if (posterImageUrl) {
      const link = document.createElement('a');
      link.href = posterImageUrl;
      link.download = 'connection-poster.png';
      link.click();
    }
  };

  const vibeLevel = getVibeLevel(data.vibeDepth);
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "~3 min";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (processingState === 'analyzing' || processingState === 'generating') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 bg-background relative overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white" data-testid="text-processing-status">
            {processingState === 'analyzing' ? 'Analyzing Conversation...' : 'Generating Your Poster...'}
          </h2>
          <p className="text-muted-foreground">
            {processingState === 'analyzing' 
              ? 'AI is transcribing and extracting insights' 
              : 'Creating a visual artifact of your connection'}
          </p>
        </div>
      </div>
    );
  }

  if (processingState === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 bg-background">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white" data-testid="text-error-title">Something went wrong</h2>
          <p className="text-muted-foreground" data-testid="text-error-message">{errorMessage}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={runAnalysis} className="mt-4" data-testid="button-retry">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => setLocation("/")} className="mt-4" data-testid="button-go-home">
              Go Home
            </Button>
          </div>
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
          <h1 className="text-3xl font-bold text-white" data-testid="text-results-title">Your Connection</h1>
          <p className="text-muted-foreground">Powered by AI analysis</p>
        </div>

        {posterImageUrl ? (
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={posterImageUrl} 
              alt="Your connection poster" 
              className="w-full h-full object-cover"
              data-testid="img-poster"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden p-8 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-primary/80 via-purple-900 to-background">
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <Sparkles className="text-white/80 w-8 h-8" />
                <span className="text-white/60 font-mono text-sm tracking-widest uppercase">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest uppercase text-white/60">2026 Intention</span>
                <h2 className="text-2xl font-display font-bold text-white leading-tight" data-testid="text-intention">
                  "{data.intentionText}"
                </h2>
              </div>
            </div>

            <div className="relative z-10 border-t border-white/20 pt-6 mt-4">
              <div className="flex justify-between items-center text-white/80 text-sm font-mono">
                <span className="capitalize">{vibeLevel} Vibe</span>
                <span>{formatDuration(data.audioDuration)}</span>
              </div>
            </div>
          </div>
        )}

        {insights && (
          <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">AI Insights</h3>
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap" data-testid="text-insights">
              {insights}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleShare} className="h-12 border-white/10 hover:bg-white/5" data-testid="button-share">
            <Share2 className="mr-2 w-4 h-4" /> Share
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownload}
            disabled={!posterImageUrl}
            className="h-12 border-white/10 hover:bg-white/5"
            data-testid="button-download"
          >
            <Download className="mr-2 w-4 h-4" /> Save Image
          </Button>
        </div>

        <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="text-center space-y-1">
            <h3 className="font-medium text-white">Save this memory</h3>
            <p className="text-sm text-muted-foreground">Enter your email to receive this</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailSubmit)} className="flex gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input 
                        placeholder="your@email.com" 
                        {...field} 
                        className="bg-black/20 border-white/10 text-white"
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90" data-testid="button-submit-email">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </Form>
        </div>

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
                    onClick={() => setNps(num * 2)}
                    data-testid={`button-nps-${num}`}
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
            data-testid="input-feedback"
          />

          <Button 
            onClick={handleDone}
            disabled={isSaving}
            className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-white/90 rounded-full"
            data-testid="button-done"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" /> Saving...
              </>
            ) : (
              "Start New Connection"
            )}
          </Button>
        </div>

      </motion.div>
    </div>
  );
}
