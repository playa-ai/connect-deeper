import { Switch, Route } from "wouter";
import { ConnectionProvider } from "@/context/ConnectionContext";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import HostGrounding from "@/pages/HostGrounding";
import Handoff from "@/pages/Handoff";
import GuestGrounding from "@/pages/GuestGrounding";
import ConsentVibe from "@/pages/ConsentVibe";
import Recording from "@/pages/Recording";
import Results from "@/pages/Results";
import SharedResults from "@/pages/SharedResults";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ground" component={HostGrounding} />
      <Route path="/handoff" component={Handoff} />
      <Route path="/guest-ground" component={GuestGrounding} />
      <Route path="/consent" component={ConsentVibe} />
      <Route path="/recording" component={Recording} />
      <Route path="/results" component={Results} />
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
