import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SymbolPreloader from "./components/SymbolPreloader";
import InitialLoadingScreen from "./components/InitialLoadingScreen";
import { preloadAllGameSymbols } from "./hooks/useImageCache";

const queryClient = new QueryClient();

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [symbolsPreloaded, setSymbolsPreloaded] = useState(false);

  // Preload symbols when app launches
  useEffect(() => {
    // Start preloading symbols right away
    preloadAllGameSymbols().then(() => {
      setSymbolsPreloaded(true);
    });
  }, []);

  // Handle loading screen completion
  const handleLoadingComplete = () => {
    setAppReady(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div style={{
          background: 'radial-gradient(circle, #1a0d05 0%, #0e0817 100%)',
          minHeight: '100vh'
        }}>
          {/* Show loading screen on first load */}
          {!appReady && (
            <InitialLoadingScreen onComplete={handleLoadingComplete} />
          )}

          {/* Keep preloader active, but hidden after initial load */}
          <div style={{ display: 'none' }}>
            <SymbolPreloader onComplete={() => setSymbolsPreloaded(true)} />
          </div>

          <Toaster />
          <Sonner />

          {/* Only show the app content when the loading screen is complete */}
          {appReady && (
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          )}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
