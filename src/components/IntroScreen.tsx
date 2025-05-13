
import React from 'react';
import AudioControls from './AudioControls';

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
        className="absolute inset-0 bg-[url('/lovable-uploads/d1a23847-43b7-49a4-9a33-7ca331ec75c8.png')] bg-cover bg-center"
        style={{ backgroundPosition: 'center center' }}
      ></div>
      
      {/* Content container with proper spacing for both mobile and desktop */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full">
        {/* Empty top section for spacing */}
        <div className="mt-16 md:mt-32"></div>
        
        {/* Logo is displayed in the background image */}
        
        {/* Bottom section with button */}
        <div className="mb-16 md:mb-32 px-8 w-full max-w-xs mx-auto">
          <button
            onClick={onStartGame}
            className="w-full px-6 py-4 bg-amber-700/80 hover:bg-amber-600/80 text-amber-100 font-bold rounded-lg transition-colors text-lg border border-amber-500 uppercase tracking-wider"
          >
            Begin Your Tapasya
          </button>
          
          {/* Help button (how to play) */}
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
