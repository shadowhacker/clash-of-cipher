import React, { useEffect, useState } from 'react';
import AudioControls from './AudioControls';

interface IntroScreenProps {
  onStartGame: () => void;
  onShowGuide: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStartGame, onShowGuide }) => {
  const [hasSeenGuide, setHasSeenGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has seen guide
    const seenGuide = localStorage.getItem('hasSeenGuide');
    setHasSeenGuide(!!seenGuide);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-indigo-800 text-white">
      <div className="absolute top-4 right-4">
        <AudioControls className="bg-indigo-800 hover:bg-indigo-700" />
      </div>
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">Clash of Cipher</h1>

        <div className="space-y-4 mt-8">
          {hasSeenGuide ? (
            <div className="flex gap-4">
              <button
                onClick={onStartGame}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              >
                Start Game
              </button>
              <button
                onClick={onShowGuide}
                className="px-8 py-3 bg-transparent hover:bg-white/10 text-white font-semibold rounded-lg transition-colors"
              >
                How to Play
              </button>
            </div>
          ) : (
            <button
              onClick={onShowGuide}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            >
              How to Play
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
