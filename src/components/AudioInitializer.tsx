
import React, { useRef } from 'react';

interface AudioInitializerProps {
  onSymbolClick: (symbol: string) => void;
  children: React.ReactNode;
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
        if (React.isValidElement(child)) {
          // Fix: Pass the wrapper function to a prop name that the child component accepts
          return React.cloneElement(child, {
            // The child component expects 'onButtonClick' not 'onSymbolClick'
            // But we need to ensure the child component accepts this prop
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
