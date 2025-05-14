import { useCallback, useState } from 'react';
import { preloadAllSymbols, forceMarkAllLoaded } from '../utils/symbolCacheUtils';
import LaunchCountdown from '../components/LaunchCountdown.tsx';

interface UseGameLaunchProps {
  onLaunchComplete: () => void;
}

export const useGameLaunch = ({ onLaunchComplete }: UseGameLaunchProps) => {
  const [showCountdown, setShowCountdown] = useState(false);

  // Start full game launch
  const launchRun = useCallback(async () => {
    // First, try to preload all images
    await preloadAllSymbols().catch(() => {
      // If preloading fails, just mark all as loaded and continue
      forceMarkAllLoaded();
    });

    // Show the countdown animation
    setShowCountdown(true);
  }, []);

  // Callback when countdown completes
  const handleCountdownComplete = useCallback(() => {
    // Use requestAnimationFrame to ensure we're not updating during render
    requestAnimationFrame(() => {
      setShowCountdown(false);
      onLaunchComplete();
    });
  }, [onLaunchComplete]);

  // Render function for the overlay instead of a component
  const Overlay = () => {
    return showCountdown ? <LaunchCountdown onComplete={handleCountdownComplete} /> : null;
  };

  return {
    launchRun,
    Overlay
  };
}; 