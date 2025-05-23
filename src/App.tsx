import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SymbolPreloader from "./components/SymbolPreloader";
import InitialLoadingScreen from "./components/InitialLoadingScreen";
import AudioInitializer from "./components/AudioInitializer";
import { preloadAllGameSymbols, loadingProgress } from "./hooks/useImageCache";
import logger from "./utils/logger";

const queryClient = new QueryClient();

const App = () => {
  // --- Pause/resume game and all background tasks when tab is hidden or screen is off (web or native) ---
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    // Manage music, musing, and game pause state
    let soundManager: any = null;
    let hadMusicPlaying = false;
    let musingWasActive = false;
    let lastBackgroundMusicTrack = "intro"; // Default track, update as needed


    function handleVisibilityChange() {
      if (document.hidden) {
        setPaused(true);
        import("./utils/soundManager").then((mod) => {
          soundManager = mod;
          // Pause music if playing
          if (soundManager.isBackgroundMusicPlaying && soundManager.isBackgroundMusicPlaying()) {
            hadMusicPlaying = true;
            // Save the last track name if available
            if (soundManager.getCurrentBackgroundMusicName) {
              lastBackgroundMusicTrack = soundManager.getCurrentBackgroundMusicName() || "intro";
            }
            soundManager.stopBackgroundMusic();
          }
          // Pause musing if active
          if (soundManager.pauseMusing && soundManager.isMusingActive && soundManager.isMusingActive()) {
            musingWasActive = true;
            soundManager.pauseMusing();
          }
        });
      } else {
        setPaused(false);
        import("./utils/soundManager").then((mod) => {
          soundManager = mod;
          // Resume music if it was playing before
          if (hadMusicPlaying && soundManager.playBackgroundMusic) {
            soundManager.playBackgroundMusic(lastBackgroundMusicTrack);
            hadMusicPlaying = false;
          }
          // Resume musing if it was active before
          if (musingWasActive && soundManager.resumeMusing) {
            soundManager.resumeMusing();
            musingWasActive = false;
          }
        });
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  const [appReady, setAppReady] = useState(false);
  const [symbolsPreloaded, setSymbolsPreloaded] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);

  // Preload symbols when app launches
  useEffect(() => {
    const loadAllSymbols = async () => {
      try {
        logger.info("Starting to preload all game symbols...");
        await preloadAllGameSymbols();
        logger.info(
          `All symbols preloaded! Loading progress: ${loadingProgress.loaded}/${loadingProgress.total}`
        );
        setSymbolsPreloaded(true);
      } catch (error) {
        logger.error("Error preloading symbols:", error);
        // Still mark as preloaded to allow game to continue
        setSymbolsPreloaded(true);
      }
    };
    loadAllSymbols();
  }, []);

  // Handle loading screen completion - only called when InitialLoadingScreen is done
  const handleLoadingComplete = useCallback(() => {
    logger.info("Loading screen animation complete");
    setLoadingComplete(true);
  }, []);

  // Only mark app as ready when both conditions are met:
  // 1. Symbols are preloaded (or attempted to preload)
  // 2. Loading screen animation is complete
  useEffect(() => {
    if (symbolsPreloaded && loadingComplete) {
      logger.info("App is now fully ready to render!");
      setAppReady(true);
    }
  }, [symbolsPreloaded, loadingComplete]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div
          style={{
            background: "radial-gradient(circle, #1a0d05 0%, #0e0817 100%)",
            minHeight: "100vh",
          }}
        >
          {/* Audio initializer to handle browser autoplay policies */}
          <AudioInitializer onSymbolClick={() => {}}>{null}</AudioInitializer>

          {/* Show loading screen on first load */}
          {!appReady && (
            <InitialLoadingScreen onComplete={handleLoadingComplete} />
          )}

          {/* Keep preloader active, but hidden after initial load */}
          <div style={{ display: "none" }}>
            <SymbolPreloader onComplete={() => setSymbolsPreloaded(true)} />
          </div>

          <Toaster />
          <Sonner />

          {/* Only show the app content when fully ready */}
          {appReady && (
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                <Route path="/" element={<Index paused={paused} />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
