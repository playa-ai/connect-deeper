import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Share2, Download, Sparkles, Loader2, ArrowRight, MessageCircle, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { updateConnection, analyzeConnection, generatePoster, getFollowUp, FollowUpResult } from "@/lib/api";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export default function Results() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/results/:id");
  const { data, updateData, reset } = useConnection();
  
  const connectionId = params?.id || data.connectionId;
  const [processingState, setProcessingState] = useState<'waiting' | 'analyzing' | 'complete' | 'error'>('waiting');
  const [hasTriedAnalysis, setHasTriedAnalysis] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [transcript, setTranscript] = useState("");
  const [intentionSummary, setIntentionSummary] = useState("");
  const [insights, setInsights] = useState("");
  
  const [posterImageUrl, setPosterImageUrl] = useState<string | null>(null);
  const [posterLoading, setPosterLoading] = useState(false);
  
  const [followUp, setFollowUp] = useState<FollowUpResult | null>(null);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  
  const [nps, setNps] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const runAnalysis = async () => {
    if (!connectionId) return;
    
    setHasTriedAnalysis(true);
    
    if (connectionId && !params?.id) {
      window.history.replaceState(null, '', `/results/${connectionId}`);
    }

    try {
      setProcessingState('analyzing');
      setErrorMessage("");
      const analysis = await analyzeConnection(connectionId);
      setTranscript(analysis.transcript);
      setIntentionSummary(analysis.intentionSummary);
      setInsights(analysis.insights);
      
      setProcessingState('complete');
      
      // Start poster generation async (non-blocking)
      setPosterLoading(true);
      generatePoster(connectionId)
        .then((poster) => setPosterImageUrl(poster.posterImageUrl))
        .catch((err) => console.error("Poster generation failed:", err))
        .finally(() => setPosterLoading(false));
        
    } catch (error) {
      console.error("Analysis failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to analyze conversation");
      setProcessingState('error');
    }
  };

  useEffect(() => {
    if (connectionId && !hasTriedAnalysis) {
      runAnalysis();
    }
  }, [connectionId, hasTriedAnalysis]);
  
  useEffect(() => {
    if (!params?.id && !data.connectionId && processingState === 'waiting') {
      const timer = setTimeout(() => {
        if (!data.connectionId) {
          setErrorMessage("No connection found. Please start over.");
          setProcessingState('error');
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [params?.id, data.connectionId, processingState]);

  useEffect(() => {
    if (processingState === 'complete' && connectionId && !followUp && !loadingFollowUp) {
      const loadFollowUp = async () => {
        setLoadingFollowUp(true);
        try {
          const followUpData = await getFollowUp(connectionId!);
          setFollowUp(followUpData);
        } catch (followUpError) {
          console.error("Follow-up generation failed:", followUpError);
        } finally {
          setLoadingFollowUp(false);
        }
      };
      loadFollowUp();
    }
  }, [processingState, connectionId, followUp, loadingFollowUp]);

  const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    if (!connectionId) return;
    
    try {
      await updateConnection(connectionId, { guestEmail: values.email });
      updateData({ guestEmail: values.email });
      toast({
        title: "Saved!",
        description: `We'll send your memory to ${values.email}`,
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
    if (!connectionId) return;
    
    setIsSaving(true);
    try {
      await updateConnection(connectionId, {
        npsScore: nps,
        feedbackText: feedback,
      });

      updateData({ npsScore: nps, feedbackText: feedback });
      
      toast({
        title: "Thanks for sharing!",
        description: "Your feedback helps us improve.",
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
    const shareUrl = connectionId 
      ? `${window.location.origin}/connection/${connectionId}`
      : window.location.origin;
      
    if (navigator.share) {
      navigator.share({
        title: 'My 2026 Connection',
        text: intentionSummary ? `My intention for 2026: ${intentionSummary}` : 'Check out my 2026 connection memory!',
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!" });
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

  if (processingState === 'waiting' || processingState === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 bg-background relative overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white" data-testid="text-processing-status">
            {processingState === 'waiting' ? 'Loading...' : 'Listening to your story...'}
          </h2>
          <p className="text-muted-foreground">
            {processingState === 'analyzing' ? 'This takes about 30 seconds' : 'Preparing your connection'}
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

  // Get just 1 follow-up question and 1 quest
  const nextQuestion = followUp?.deeperQuestions?.[0];
  const nextQuest = followUp?.actionItems?.[0];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 py-8 bg-background overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 pb-12"
      >
        {/* Branding */}
        <div className="flex justify-center">
          <a 
            href="https://playa-ai.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-white/60 group-hover:text-white/80 transition-colors">
              Playa AI
            </span>
          </a>
        </div>

        {/* Intention - Hero */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Your 2026 intention</p>
          {intentionSummary && (
            <h1 className="text-3xl font-bold text-white leading-snug" data-testid="text-intention-summary">
              "{intentionSummary}"
            </h1>
          )}
        </div>

        {/* Insight - Short & warm */}
        {insights && (
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/5 p-5 rounded-2xl border border-primary/20">
            <p className="text-white/90 leading-relaxed text-center" data-testid="text-insights">
              {insights.split('\n')[0].replace(/^[#*\-\s]+/, '')}
            </p>
          </div>
        )}

        {/* Follow-up: 1 question + 1 quest */}
        {(loadingFollowUp || nextQuestion || nextQuest) && (
          <div className="space-y-4">
            {loadingFollowUp ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Finding your next step...</span>
              </div>
            ) : (
              <>
                {nextQuestion && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-semibold text-pink-400 uppercase tracking-wide">Ask yourself</span>
                    </div>
                    <p className="text-white/90" data-testid="text-next-question">"{nextQuestion}"</p>
                  </div>
                )}
                
                {nextQuest && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">Your quest</span>
                    </div>
                    <p className="text-white/90" data-testid="text-next-quest">{nextQuest}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Poster (async loaded) */}
        {(posterLoading || posterImageUrl) && (
          <div className="space-y-3">
            {posterLoading ? (
              <div className="w-full aspect-[4/5] rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Creating your poster...</p>
              </div>
            ) : posterImageUrl && (
              <>
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={posterImageUrl} 
                    alt="Your connection poster" 
                    className="w-full h-full object-cover"
                    data-testid="img-poster"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleDownload}
                  className="w-full h-12 border-white/10 hover:bg-white/5"
                  data-testid="button-download"
                >
                  <Download className="mr-2 w-4 h-4" /> Save Poster
                </Button>
              </>
            )}
          </div>
        )}

        {/* Share */}
        <Button 
          variant="outline" 
          onClick={handleShare} 
          className="w-full h-12 border-white/10 hover:bg-white/5" 
          data-testid="button-share"
        >
          <Share2 className="mr-2 w-4 h-4" /> Share
        </Button>

        {/* Email capture */}
        <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/10">
          <div className="text-center space-y-1">
            <h3 className="font-medium text-white">Keep this memory</h3>
            <p className="text-sm text-muted-foreground">We'll send it to your inbox</p>
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

        {/* NPS + Feedback */}
        <div className="space-y-5 border-t border-white/10 pt-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80 block text-center">
              How was this?
            </label>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map((num) => (
                <button
                  key={num}
                  onClick={() => setNps(num * 2)}
                  data-testid={`button-nps-${num}`}
                  className={`w-11 h-11 rounded-full font-bold text-sm transition-all flex items-center justify-center ${
                    (nps || 0) / 2 === num 
                      ? "bg-accent text-black scale-110 shadow-lg shadow-accent/30" 
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <Textarea 
            placeholder="Any thoughts? (optional)" 
            className="bg-black/20 border-white/10 min-h-[70px] rounded-xl text-sm"
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
              "Done"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
