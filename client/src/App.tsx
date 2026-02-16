import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import FirebaseLogin from "./pages/FirebaseLogin";
import Lobby from "./pages/Lobby";
import GameArena from "./pages/GameArena";
import MobileGameArena from "./pages/MobileGameArena";
import TrainingMode from "./pages/TrainingMode";
import WaitingRoom from "./pages/WaitingRoom";

function Router() {
  // make sure to consider if you need authentication for certain routes
  const isMobile = window.innerWidth < 768;

  return (
    <Switch>
      <Route path="/login" component={FirebaseLogin} />
      <Route path="/lobby" component={Lobby} />
      <Route path="/game">
        {isMobile ? <MobileGameArena /> : <GameArena />}
      </Route>
      <Route path="/game?mode=training" component={TrainingMode} />
      <Route path="/training" component={TrainingMode} />
      <Route path="/waiting">
        {() => {
          const params = new URLSearchParams(window.location.search);
          const mode = params.get('mode') as '1v1' | '3v3' | 'training' || '1v1';
          return <WaitingRoom mode={mode} />;
        }}
      </Route>
      <Route path="/404" component={NotFound} />
      {/* Redirect to lobby by default (guest mode) */}
      <Route path="/" component={Lobby} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
