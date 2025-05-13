import React, { useRef, useEffect, useState } from 'react';

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

  // Listen for mute change events
  useEffect(() => {
    const handleMuteChange = (e: CustomEvent) => {
      setIsMuted(e.detail.muted);

      // If we have an audio context, suspend it when muted or resume when unmuted
      if (audioContext.current) {
        if (e.detail.muted) {
          audioContext.current.suspend().catch(e => console.error("Error suspending audio context:", e));
        } else {
          audioContext.current.resume().catch(e => console.error("Error resuming audio context:", e));
        }
      }
    };

    window.addEventListener('audio-mute-change', handleMuteChange as EventListener);

    return () => {
      window.removeEventListener('audio-mute-change', handleMuteChange as EventListener);
    };
  }, []);

  // Wrapper for symbol click to handle audio initialization
  const handleSymbolClickWithAudio = (symbol: string) => {
    // Initialize audio context on first user interaction if not muted
    if (!audioInitialized.current && !isMuted) {
      try {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContext.current.resume().catch(e => console.error("Audio context resume error:", e));
        audioInitialized.current = true;
      } catch (err) {
        console.error("Audio context creation error:", err);
      }
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
