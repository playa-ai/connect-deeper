import { Switch, Route } from "wouter";
import { ConnectionProvider } from "@/context/ConnectionContext";
import { Toaster } from "@/components/ui/toaster";
import Hook from "@/pages/Hook";
import Explain from "@/pages/Explain";
import ConsentVibe from "@/pages/ConsentVibe";
import Recording from "@/pages/Recording";
import Results from "@/pages/Results";
import SharedResults from "@/pages/SharedResults";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Hook} />
      <Route path="/explain" component={Explain} />
      <Route path="/consent" component={ConsentVibe} />
      <Route path="/recording" component={Recording} />
      <Route path="/results" component={Results} />
      <Route path="/results/:id" component={Results} />
      <Route path="/connection/:id" component={SharedResults} />
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
