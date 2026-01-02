import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useWakeLock } from "@/hooks/useWakeLock";
import { Button } from "@/components/ui/button";
import { getQuestions } from "@/lib/questions";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { updateConnection } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function Recording() {
  const [, setLocation] = useLocation();
  const { data, updateData } = useConnection();
  const { isRecording, startRecording, stopRecording, audioBlob, duration } = useAudioRecorder();
  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const questions = getQuestions(data.vibeDepth);

  useEffect(() => {
    requestWakeLock();
    startRecording();
    
    return () => {
      releaseWakeLock();
      stopRecording();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioBlob && !isSaving) {
      saveRecording();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob]);

  const saveRecording = async () => {
    if (!data.connectionId || !audioBlob) return;
    
    setIsSaving(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        await updateConnection(data.connectionId!, {
          audioData: base64Audio,
          audioDurationSeconds: duration,
          questionsAsked: questions,
        });

        updateData({ 
          audioBlob,
          audioDuration: duration,
          questionsAsked: questions 
        });
        
        releaseWakeLock();
        setLocation("/results");
      };
    } catch (error) {
      console.error("Error saving recording:", error);
      toast({
        title: "Error",
        description: "Failed to save recording. Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      stopRecording(); 
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto relative overflow-hidden bg-black">
       <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-destructive/10 via-background to-background -z-10 pointer-events-none"
      />

      <div className="flex justify-between items-center py-6">
        <div className="flex items-center gap-2">
           <motion.div 
             animate={{ scale: [1, 1.2, 1] }}
             transition={{ duration: 1.5, repeat: Infinity }}
             className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]"
           />
           <span className="text-red-400 font-mono text-sm tracking-wider" data-testid="text-recording-time">REC {formatTime(duration)}</span>
        </div>
        <div className="text-muted-foreground text-sm font-medium" data-testid="text-question-progress">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold leading-tight text-white" data-testid="text-question">
              {questions[currentQuestionIndex]}
            </h2>
            <p className="text-lg text-white/50 italic font-light">
              Ask, listen, then tap Next
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="py-8">
        <Button 
          onClick={handleNext}
          disabled={isSaving}
          data-testid="button-next-question"
          className={`w-full h-20 text-xl font-bold rounded-full transition-all duration-300 shadow-2xl ${
            isLastQuestion 
            ? "bg-white text-black hover:bg-white/90 shadow-white/10" 
            : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
          }`}
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : isLastQuestion ? (
            <span className="flex items-center gap-3">Finish <Check className="w-6 h-6" /></span>
          ) : (
            <span className="flex items-center gap-3">Next Question <ArrowRight className="w-6 h-6" /></span>
          )}
        </Button>
      </div>
    </div>
  );
}
