
import React, { useEffect, useRef, useState } from 'react';
import GameGrid from '../components/GameGrid';
import GameStatus from '../components/GameStatus';
import GameOverModal from '../components/GameOverModal';
import HowToPlayGuide from '../components/HowToPlayGuide';
import StartScreen from '../components/StartScreen';
import { useGame } from '../hooks/useGame';
import { HelpCircle } from 'lucide-react';

const Index = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [showLifeWarning, setShowLifeWarning] = useState(false);
  
  const { 
    gameState,
    level,
    personalBest,
    code,
    userInput,
    isPlayerWinner,
    showGameOverModal,
    lives,
    timeLeft,
    currentSymbolPack,
    currentTheme,
    gridSymbols,
    progressPct,
    startGame,
    handleSymbolClick,
    resetGame,
    shareScore,
    showStartScreen,
    dismissStartScreen,
    nextMilestone,
    setTimeLeft,
  } = useGame();

  // Sound effects using useRef for better performance
  const sfxSuccess = useRef<HTMLAudioElement | null>(null);
  const sfxFail = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioInitialized = useRef<boolean>(false);

  // Initialize sound effects
  useEffect(() => {
    sfxSuccess.current = new Audio('/snd/success.mp3');
    sfxFail.current = new Audio('/snd/fail.mp3');
  }, []);

  // Play sound effects based on game state changes
  useEffect(() => {
    if (gameState === 'result') {
      try {
        if (isPlayerWinner && sfxSuccess.current) {
          sfxSuccess.current.play().catch(err => console.error("Error playing success sound:", err));
        } else if (!isPlayerWinner && sfxFail.current) {
          sfxFail.current.play().catch(err => console.error("Error playing fail sound:", err));
        }
      } catch (e) {
        console.error("Audio playback error:", e);
      }
    }
  }, [gameState, isPlayerWinner]);

  // Apply theme to body background
  useEffect(() => {
    document.body.className = `min-h-screen transition-colors duration-1000 ${currentTheme.replace('bg-', 'bg-')}`;
    
    return () => {
      document.body.className = '';
    };
  }, [currentTheme]);

  // Handle life warning display
  useEffect(() => {
    if (lives === 1 && gameState === 'result' && !isPlayerWinner) {
      setShowLifeWarning(true);
      const timer = setTimeout(() => {
        setShowLifeWarning(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [lives, gameState, isPlayerWinner]);

  // Clear timer on unmount or gameState change
  useEffect(() => {
    if (gameState !== 'input') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  // Wrapper for symbol click to handle timer
  const handleSymbolClickWithTimer = (symbol: string) => {
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
    
    // Start timer on first tap if not already running
    if (!timerRef.current && gameState === 'input') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up
            clearInterval(timerRef.current!);
            timerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Call original handler
    handleSymbolClick(symbol);
  };

  if (showStartScreen) {
    return <StartScreen onStart={dismissStartScreen} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center text-indigo-800">🔮 Cipher Clash</h1>
          <button 
            onClick={() => setShowGuide(true)}
            className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
            aria-label="How to Play"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {showLifeWarning && lives === 1 && (
          <div className="mb-4 p-2 bg-yellow-500/80 text-white text-center rounded-md font-bold animate-pulse">
            ⚠️ 1 life left – focus!
          </div>
        )}

        <GameStatus 
          gameState={gameState}
          level={level}
          personalBest={personalBest}
          lives={lives}
          timeLeft={timeLeft}
          startGame={startGame}
          resetGame={resetGame}
          currentTheme={currentTheme}
          nextMilestone={nextMilestone}
        />
        <GameGrid 
          onButtonClick={handleSymbolClickWithTimer}
          gameState={gameState}
          code={code}
          userInput={userInput}
          isPlayerWinner={isPlayerWinner}
          currentSymbolPack={currentSymbolPack}
          gridSymbols={gridSymbols}
          progressPct={progressPct}
        />
        <GameOverModal
          level={level}
          personalBest={personalBest}
          open={showGameOverModal}
          onRestart={startGame}
          onShare={shareScore}
        />
        <HowToPlayGuide 
          open={showGuide} 
          onClose={() => setShowGuide(false)} 
        />
      </div>
    </div>
  );
};

export default Index;
