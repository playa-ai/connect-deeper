import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2, Home, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getConnection } from "@/lib/api";
import type { Connection } from "@shared/schema";

export default function SharedResults() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/connection/:id");
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConnection = async () => {
      if (!params?.id) {
        setError("No connection ID provided");
        setLoading(false);
        return;
      }

      try {
        const data = await getConnection(params.id);
        setConnection(data);
      } catch (err) {
        console.error("Error fetching connection:", err);
        setError("This connection was not found or has expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchConnection();
  }, [params?.id]);

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Connection Memory',
        text: connection?.intentionText 
          ? `My intention for 2026: ${connection.intentionText}`
          : 'Check out this connection memory!',
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading connection...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !connection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <h1 className="text-3xl font-bold text-white">Connection Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            onClick={() => setLocation("/")}
            className="bg-white text-black hover:bg-white/90"
          >
            <Home className="mr-2 w-4 h-4" /> Go Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto bg-black">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 space-y-8 py-8"
      >
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Connection Memory</p>
          <h1 className="text-3xl font-bold text-white">2026 Intention</h1>
        </div>

        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-3xl border border-primary/20">
          <p className="text-xl text-white font-medium text-center italic" data-testid="text-shared-intention">
            "{connection.intentionText}"
          </p>
        </div>

        {connection.aiInsights && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Insights</h2>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-shared-insights">{connection.aiInsights}</p>
          </div>
        )}

        {connection.posterImageUrl && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Memory Poster</h2>
            <img 
              src={connection.posterImageUrl} 
              alt="Connection poster" 
              className="w-full rounded-2xl shadow-xl"
              data-testid="img-shared-poster"
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={handleShare}
            className="flex-1 h-12 border-white/10 hover:bg-white/5"
            data-testid="button-share"
          >
            <Share2 className="mr-2 w-4 h-4" /> Share
          </Button>
          <Button 
            onClick={() => setLocation("/")}
            className="flex-1 h-12 bg-white text-black hover:bg-white/90"
            data-testid="button-start-own"
          >
            <Home className="mr-2 w-4 h-4" /> Start Your Own
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
