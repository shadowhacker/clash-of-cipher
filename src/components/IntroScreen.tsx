
import React from 'react';
import AudioControls from './AudioControls';
import { Button } from '@/components/ui/button';

interface IntroScreenProps {
  onStartGame: () => void;
  onShowGuide: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStartGame, onShowGuide }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between bg-indigo-950 text-amber-500 overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <AudioControls className="bg-amber-900 hover:bg-amber-800" />
      </div>
      
      {/* Full screen background image */}
      <div 
        className="absolute inset-0 bg-[url('/lovable-uploads/d1a23847-43b7-49a4-9a33-7ca331ec75c8.png')] bg-cover bg-center opacity-100"
        style={{ backgroundPosition: 'center center' }}
      ></div>
      
      {/* Content container with proper spacing for both mobile and desktop */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full">
        {/* Empty top section for spacing */}
        <div className="mt-16 md:mt-32">
          <h1 className="text-center text-4xl md:text-6xl font-bold text-amber-500 mt-8 tracking-wider">
            DHYANAM
          </h1>
          <p className="text-center text-amber-400 mt-4 text-lg md:text-xl max-w-md mx-auto px-4">
            The ancient memory practice of spiritual mastery
          </p>
        </div>
        
        {/* Bottom section with styled button */}
        <div className="mb-16 md:mb-28 px-8 w-full max-w-xs mx-auto">
          <button
            onClick={onStartGame}
            className="w-full py-3 rounded-md font-bold uppercase tracking-wider text-amber-300 text-lg transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(to bottom, #8B4513, #5D2906)',
              border: '2px solid #C9852A',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              textShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)'
            }}
          >
            Begin Your Tapasya
          </button>
          
          {/* How to play button */}
          <button
            onClick={onShowGuide}
            className="w-full px-6 py-3 mt-4 bg-transparent hover:bg-amber-900/30 text-amber-400 font-medium rounded-lg transition-colors border border-amber-700/30 text-sm"
          >
            How to Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
