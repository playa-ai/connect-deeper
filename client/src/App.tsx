import { Switch, Route } from "wouter";
import { ConnectionProvider } from "@/context/ConnectionContext";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import IntentionCapture from "@/pages/IntentionCapture";
import ConsentVibe from "@/pages/ConsentVibe";
import Recording from "@/pages/Recording";
import Results from "@/pages/Results";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/capture" component={IntentionCapture} />
      <Route path="/consent" component={ConsentVibe} />
      <Route path="/recording" component={Recording} />
      <Route path="/results" component={Results} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ConnectionProvider>
      <Router />
      <Toaster />
    </ConnectionProvider>
  );
}

export default App;
