
import React from 'react';
import AudioControls from './AudioControls';

interface IntroScreenProps {
  onStartGame: () => void;
  onShowGuide: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStartGame, onShowGuide }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 to-amber-950 text-amber-500 overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <AudioControls className="bg-amber-900 hover:bg-amber-800" />
      </div>
      
      <div className="text-center w-full h-full flex flex-col items-center justify-between py-8 px-4">
        {/* Background image with proper positioning and opacity */}
        <div 
          className="absolute inset-0 bg-[url('/lovable-uploads/27a724f6-c34b-48a0-9d1f-2d98440d7d7d.png')] bg-cover bg-center opacity-30 z-0"
          style={{ backgroundPosition: 'center 40%' }}
        ></div>
        
        {/* Content container with proper spacing for mobile */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full w-full max-w-md">
          {/* Top section with title */}
          <div className="mt-16 md:mt-24">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Dhyanam
            </h1>
          </div>
          
          {/* Bottom section with buttons */}
          <div className="w-full mb-16 md:mb-24 flex flex-col gap-4">
            <button
              onClick={onStartGame}
              className="w-full px-6 py-4 bg-amber-600 hover:bg-amber-700 text-amber-100 font-semibold rounded-lg transition-colors text-lg border border-amber-700"
            >
              Begin Your Tapasya
            </button>
            <button
              onClick={onShowGuide}
              className="w-full px-6 py-4 bg-transparent hover:bg-amber-900/30 text-amber-400 font-semibold rounded-lg transition-colors border border-amber-700"
            >
              How to Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
