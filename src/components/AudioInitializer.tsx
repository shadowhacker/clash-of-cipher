
import React, { useRef } from 'react';

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
  progressPct: number;
}

const AudioInitializer: React.FC<AudioInitializerProps> = ({ onSymbolClick, children }) => {
  const audioInitialized = useRef<boolean>(false);

  // Wrapper for symbol click to handle audio initialization
  const handleSymbolClickWithAudio = (symbol: string) => {
    // Initialize audio context on first user interaction
    if (!audioInitialized.current) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContext.resume().catch(e => console.error("Audio context resume error:", e));
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
