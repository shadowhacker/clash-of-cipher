import React, { useRef, useEffect, useState, useCallback } from 'react';
import logger from '../utils/logger';

interface AudioInitializerProps {
  onSymbolClick: (symbol: string) => void;
  children: React.ReactNode;
}

// Define props type for the child component to properly pass down props
interface GameGridProps {
  onButtonClick: (symbol: string) => void;
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  code: string[];
  userInput: string[];
  isPlayerWinner: boolean | null;
  currentSymbolPack: string[];
  gridSymbols: string[];
  showWrongTaps?: boolean;
}

const AudioInitializer: React.FC<AudioInitializerProps> = ({ onSymbolClick, children }) => {
  const audioInitialized = useRef<boolean>(false);
  const audioContext = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem('cipher-clash-muted');
    return savedMute === 'true';
  });
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Listen for mute change events
  useEffect(() => {
    const handleMuteChange = (e: CustomEvent) => {
      setIsMuted(e.detail.muted);
      setMusicEnabled(e.detail.musicEnabled);

      // If we have an audio context, suspend it when muted or resume when unmuted
      if (audioContext.current) {
        if (e.detail.muted) {
          audioContext.current.suspend().catch(e => logger.error("Error suspending audio context:", e));
        } else {
          audioContext.current.resume().catch(e => logger.error("Error resuming audio context:", e));
        }
      }
    };

    window.addEventListener('audio-mute-change', handleMuteChange as EventListener);

    return () => {
      window.removeEventListener('audio-mute-change', handleMuteChange as EventListener);
    };
  }, []);

  // Toggle audio context state based on musicEnabled prop
  useEffect(() => {
    if (!audioContext.current) return;

    try {
      if (!musicEnabled) {
        audioContext.current.suspend().catch(e => logger.error("Error suspending audio context:", e));
      } else {
        audioContext.current.resume().catch(e => logger.error("Error resuming audio context:", e));
      }
    } catch (e) {
      logger.error("Audio context error:", e);
    }
  }, [musicEnabled]);

  // Initialize audio context on user interaction
  const initializeAudio = useCallback(() => {
    try {
      if (!audioContext.current) {
        const AnyWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
        const AudioCtx = window.AudioContext || AnyWindow.webkitAudioContext;
        audioContext.current = new AudioCtx();
      }

      // Try to resume audio context if suspended
      if (audioContext.current.state === 'suspended' && musicEnabled) {
        audioContext.current.resume().catch(e => logger.error("Audio context resume error:", e));
      }

      setIsInitialized(true);
    } catch (err) {
      logger.error("Audio context creation error:", err);
    }
  }, [musicEnabled]);

  // Wrapper for symbol click to handle audio initialization
  const handleSymbolClickWithAudio = (symbol: string) => {
    // Initialize audio context on first user interaction if not muted
    if (!audioInitialized.current && !isMuted) {
      initializeAudio();
    }

    // Call original handler
    onSymbolClick(symbol);
  };

  // Clone the child element with the new click handler
  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement<GameGridProps>(child)) {
          // Correctly pass the props to the child component
          return React.cloneElement(child, {
            ...child.props,
            onButtonClick: handleSymbolClickWithAudio
          });
        }
        return child;
      })}
    </>
  );
};

export default AudioInitializer;
