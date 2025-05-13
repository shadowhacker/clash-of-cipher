
import React from 'react';
import AudioControls from './AudioControls';

interface IntroScreenProps {
  onStartGame: () => void;
  onShowGuide: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStartGame, onShowGuide }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 to-amber-950 text-amber-500">
      <div className="absolute top-4 right-4">
        <AudioControls className="bg-amber-900 hover:bg-amber-800" />
      </div>
      
      <div className="text-center space-y-8 relative">
        <div className="absolute inset-0 -z-10 w-full max-w-md h-full mx-auto bg-[url('/lovable-uploads/f24a658f-3a8a-4ef1-88ca-0ea1e57c865b.png')] bg-center bg-no-repeat bg-contain opacity-70"></div>
        
        <h1 className="text-6xl font-bold tracking-tight text-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Dhyanam</h1>

        <div className="space-y-8 mt-64 md:mt-80">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 justify-center px-4">
            <button
              onClick={onStartGame}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-amber-100 font-semibold rounded-lg transition-colors w-full sm:w-auto text-lg border border-amber-700"
            >
              Begin Your Tapasya
            </button>
            <button
              onClick={onShowGuide}
              className="px-8 py-3 bg-transparent hover:bg-amber-900/30 text-amber-400 font-semibold rounded-lg transition-colors border border-amber-700 w-full sm:w-auto"
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
