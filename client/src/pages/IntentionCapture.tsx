import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mic, MicOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createConnection } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

const formSchema = z.object({
  intention: z.string().min(5, "Intention must be at least 5 characters."),
});

export default function IntentionCapture() {
  const [, setLocation] = useLocation();
  const { updateData } = useConnection();
  const [isSaving, setIsSaving] = useState(false);
  
  const { 
    transcript, 
    isListening, 
    isSupported: isSpeechSupported, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useSpeechRecognition();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intention: "",
    },
  });

  // Sync transcript to form
  useEffect(() => {
    if (transcript.trim()) {
      const current = form.getValues("intention");
      const newValue = current ? current + transcript : transcript.trim();
      form.setValue("intention", newValue, { shouldValidate: true });
      resetTranscript();
    }
  }, [transcript, form, resetTranscript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isListening) stopListening();
    
    setIsSaving(true);
    try {
      const connection = await createConnection({
        hostId: "host-" + Date.now(),
        intentionText: values.intention,
        vibeDepth: 50,
        guestConsented: false,
      });
      
      updateData({
        connectionId: connection.id,
        intentionText: values.intention,
      });
      
      setLocation("/consent");
    } catch (error) {
      console.error("Error saving intention:", error);
      toast({
        title: "Error",
        description: "Failed to save your intention. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            2026 Intention
          </h1>
          <p className="text-muted-foreground">
            {isSpeechSupported 
              ? "Speak or type what matters most for the year ahead." 
              : "Type what matters most for the year ahead."}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="intention"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Your Intention</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea 
                        placeholder="I want to focus on..." 
                        className="min-h-[200px] bg-white/5 border-white/10 resize-none text-2xl font-medium leading-relaxed placeholder:text-white/20 focus:border-primary/50 transition-all rounded-3xl p-6"
                        data-testid="input-intention"
                        {...field} 
                      />
                      
                      {isSpeechSupported && (
                        <div className="absolute bottom-4 right-4">
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            data-testid="button-voice"
                            className={`h-14 w-14 rounded-full shadow-lg transition-all ${
                              isListening 
                                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                            onClick={toggleListening}
                          >
                            {isListening ? (
                              <div className="relative flex items-center justify-center">
                                <span className="absolute w-full h-full rounded-full border-2 border-red-500 animate-ping opacity-50"></span>
                                <MicOff className="w-6 h-6" />
                              </div>
                            ) : (
                              <Mic className="w-6 h-6" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <AnimatePresence>
                {isListening && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-center text-sm text-primary font-medium"
                    >
                        Listening... Speak your intention
                    </motion.div>
                )}
            </AnimatePresence>

            <Button 
              type="submit" 
              data-testid="button-continue"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity rounded-full shadow-lg shadow-primary/25 mt-4"
              disabled={isListening || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
