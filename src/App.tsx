import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SymbolPreloader from "./components/SymbolPreloader";
import InitialLoadingScreen from "./components/InitialLoadingScreen";
import { preloadAllGameSymbols, loadingProgress } from "./hooks/useImageCache";
import logger from './utils/logger';

const queryClient = new QueryClient();

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [symbolsPreloaded, setSymbolsPreloaded] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);

  // Preload symbols when app launches
  useEffect(() => {
    const loadAllSymbols = async () => {
      try {
        logger.info('Starting to preload all game symbols...');
        await preloadAllGameSymbols();
        logger.info(`All symbols preloaded! Loading progress: ${loadingProgress.loaded}/${loadingProgress.total}`);
        setSymbolsPreloaded(true);
      } catch (error) {
        logger.error('Error preloading symbols:', error);
        // Still mark as preloaded to allow game to continue
        setSymbolsPreloaded(true);
      }
    };
    loadAllSymbols();
  }, []);

  // Handle loading screen completion - only called when InitialLoadingScreen is done
  const handleLoadingComplete = useCallback(() => {
    logger.info('Loading screen animation complete');
    setLoadingComplete(true);
  }, []);

  // Only mark app as ready when both conditions are met:
  // 1. Symbols are preloaded (or attempted to preload)
  // 2. Loading screen animation is complete
  useEffect(() => {
    if (symbolsPreloaded && loadingComplete) {
      logger.info('App is now fully ready to render!');
      setAppReady(true);
    }
  }, [symbolsPreloaded, loadingComplete]);

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

          {/* Only show the app content when fully ready */}
          {appReady && (
            <BrowserRouter future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}>
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
