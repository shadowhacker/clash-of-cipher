import React from 'react';
import AudioControls from './AudioControls';

interface IntroScreenProps {
  onStartGame: () => void;
  onShowGuide: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStartGame, onShowGuide }) => {
  // Use a gradient background instead of an image
  const bgStyle = {
      background: 'radial-gradient(circle, #1a0d05 0%, #0e0817 100%)'
    };

  return (
    <div className="fixed inset-0 flex flex-col items-center overflow-hidden"
      style={{
        backgroundColor: '#0e0817',
        ...bgStyle
      }}>
      <div className="absolute top-4 right-4 z-10">
        <AudioControls />
      </div>

      <div className="w-full h-full flex flex-col justify-end items-center px-4" style={{ paddingBottom: '5vh' }}>
        <div className="flex-grow"></div>

        <div className="flex justify-center w-full" style={{ marginBottom: '2vh' }}>
          <h1
            className="text-center px-2"
            style={{
              color: '#ffa825',
              fontFamily: 'serif',
              fontWeight: 'bold',
              fontSize: 'clamp(4rem, 20vw, 6rem)',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
              letterSpacing: '0.02em',
              lineHeight: '1',
              width: '100%',
              maxWidth: '90vw'
            }}>
            Dhyanam
          </h1>
        </div>

        <div className="flex justify-center w-full" style={{ marginBottom: '4vh' }}>
          <p className="text-center text-amber-400/90 px-4"
            style={{
              fontFamily: 'serif',
              fontSize: 'clamp(0.9rem, 4vw, 1.3rem)',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
              letterSpacing: '0.05em',
              maxWidth: '90vw'
            }}>
            The ancient memory practice of spiritual mastery
          </p>
        </div>

        <div className="flex justify-center w-full" style={{ marginBottom: '3vh' }}>
          <button
            onClick={onStartGame}
            className="transition-transform hover:scale-105 focus:outline-none"
            style={{
              backgroundColor: '#69310f',
              color: '#ffbb24',
              border: '4px solid #873b11',
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
              fontWeight: '700',
              letterSpacing: '0.05em',
              boxShadow: '0 0 25px rgba(105, 49, 15, 0.5)',
              textTransform: 'uppercase',
              width: 'clamp(240px, 85vw, 320px)',
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
