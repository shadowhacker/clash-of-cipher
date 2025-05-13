import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MASTER_SYMBOLS } from './useGame';

interface UseGameLaunchProps {
  onLaunchComplete: () => void;
}

export const useGameLaunch = ({ onLaunchComplete }: UseGameLaunchProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayContent, setOverlayContent] = useState<'loading' | 'countdown'>('loading');
  const [countdownValue, setCountdownValue] = useState<number | string>(3);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Preload all symbol images
  const preloadImages = useCallback(async () => {
    if (imagesPreloaded) return true;

    const promises = MASTER_SYMBOLS.map((symbol) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = `/symbols/${symbol}`;
        img.onload = () => resolve();
        img.onerror = () => {
          console.error(`Failed to load symbol: ${symbol}`);
          resolve();
        };
      });
    });

    await Promise.all(promises);
    setImagesPreloaded(true);
    return true;
  }, [imagesPreloaded]);

  const launchRun = useCallback(async () => {
    // Phase 1: Loading - preload images
    setShowOverlay(true);
    setOverlayContent('loading');

    // Wait for images to be preloaded with a minimum loading time of 1.5 seconds
    const startTime = Date.now();
    await preloadImages();

    // Ensure loading screen shows for at least 1.5 seconds
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 1500) {
      await new Promise(resolve => setTimeout(resolve, 1500 - elapsedTime));
    }

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
  }, [onLaunchComplete, preloadImages]);

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