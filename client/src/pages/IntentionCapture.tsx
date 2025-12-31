import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useConnection } from "@/context/ConnectionContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const formSchema = z.object({
  intention: z.string().min(5, "Intention must be at least 5 characters."),
  email: z.string().email("Please enter a valid email address."),
});

export default function IntentionCapture() {
  const [, setLocation] = useLocation();
  const { updateData } = useConnection();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intention: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateData({
      intentionText: values.intention,
      guestEmail: values.email,
    });
    setLocation("/consent");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Background Ambience */}
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
          <p className="text-muted-foreground">Capture what matters most for the year ahead.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="intention"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-white/90">Your Intention</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="I want to focus on..." 
                      className="min-h-[120px] bg-white/5 border-white/10 resize-none text-lg placeholder:text-white/20 focus:border-primary/50 transition-all rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-white/90">Where should we send your reminder?</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      className="bg-white/5 border-white/10 h-14 text-lg placeholder:text-white/20 focus:border-primary/50 transition-all rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity rounded-full shadow-lg shadow-primary/25 mt-8"
            >
              Save & Continue <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
