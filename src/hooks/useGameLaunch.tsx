import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { preloadAllSymbols, forceMarkAllLoaded } from '../components/SymbolPreloader';

interface UseGameLaunchProps {
  onLaunchComplete: () => void;
}

export const useGameLaunch = ({ onLaunchComplete }: UseGameLaunchProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayContent, setOverlayContent] = useState<'loading' | 'countdown'>('loading');
  const [countdownValue, setCountdownValue] = useState<number | string>(3);

  const launchRun = useCallback(async (): Promise<void> => {
    // Phase 1: Loading - preload images
    setShowOverlay(true);
    setOverlayContent('loading');

    try {
      // Load symbols with a timeout to prevent blocking
      await Promise.race([
        preloadAllSymbols(),
        new Promise<null>(resolve => setTimeout(() => {
          forceMarkAllLoaded(); // Mark all loaded if timeout occurs
          resolve(null);
        }, 2000))
      ]);
    } catch (error) {
      console.error("Error preloading symbols:", error);
      forceMarkAllLoaded(); // Mark all loaded if error occurs
    }

    // Ensure loading shows for a minimum amount of time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Phase 2: Countdown
    setOverlayContent('countdown');
    const countdown = [3, 2, 1, 'GO!'];

    for (const value of countdown) {
      setCountdownValue(value);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Phase 3: Complete
    setShowOverlay(false);
    onLaunchComplete();
  }, [onLaunchComplete]);

  const Overlay = useCallback(() => (
    <AnimatePresence mode="wait">
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
        >
          <motion.div
            key={overlayContent}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-6xl font-extrabold text-white"
          >
            {overlayContent === 'loading' ? 'Loading...' : countdownValue}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  ), [showOverlay, overlayContent, countdownValue]);

  return {
    launchRun,
    Overlay
  };
}; 