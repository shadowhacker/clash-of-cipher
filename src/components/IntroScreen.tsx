import React from 'react';
import AudioControls from './AudioControls';

interface IntroScreenProps {
  onStartGame: () => void;
  onShowGuide: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStartGame, onShowGuide }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center overflow-hidden"
      style={{
        backgroundColor: '#0e0817',
        backgroundImage: 'url("/images/bg-intro.png")',
        backgroundPosition: 'center center',
        backgroundSize: 'auto 100%',
        backgroundRepeat: 'no-repeat'
      }}>
      <div className="absolute top-4 right-4 z-10">
        <AudioControls className="bg-amber-800/50 hover:bg-amber-700/50" />
      </div>

      <div className="w-full h-full flex flex-col justify-end" style={{ paddingBottom: '5vh' }}>
        <div className="flex-grow"></div>

        <div className="flex justify-center" style={{ marginBottom: '4vh' }}>
          <h1
            style={{
              color: '#ffa825',
              fontFamily: 'serif',
              fontWeight: 'bold',
              fontSize: 'clamp(3rem, 12vw, 6rem)',
              textShadow: '0 4px 4px rgb(0, 0, 0)',
              letterSpacing: '0.02em',
            }}>
            Dhyanam
          </h1>
        </div>

        <div className="flex justify-center" style={{ marginBottom: '3vh' }}>
          <button
            onClick={onStartGame}
            className="transition-transform hover:scale-105 focus:outline-none"
            style={{
              backgroundColor: '#69310f',
              color: '#ffbb24',
              border: '4px solid #873b11',
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              fontWeight: '700',
              letterSpacing: '0.05em',
              boxShadow: '0 0 25px rgba(105, 49, 15, 0.5)',
              textTransform: 'uppercase',
              width: 'clamp(240px, 80vw, 320px)',
              height: '54px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            BEGIN YOUR TAPASYA
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onShowGuide}
            className="px-6 py-2 bg-transparent hover:bg-amber-900/30 text-amber-400/80 font-medium rounded-lg transition-colors text-sm"
          >
            How to Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
