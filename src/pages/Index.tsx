
import React, { useEffect, useMemo } from 'react';
import GameGrid from '../components/GameGrid';
import GameStatus from '../components/GameStatus';
import GameOverModal from '../components/GameOverModal';
import HowToPlayGuide from '../components/HowToPlayGuide';
import { useGame } from '../hooks/useGame';
import { Help } from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const [showGuide, setShowGuide] = useState(false);
  
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
  } = useGame();

  // Sound effects
  const sfxSuccess = useMemo(() => new Audio('/snd/success.mp3'), []);
  const sfxFail = useMemo(() => new Audio('/snd/fail.mp3'), []);

  // Play sound effects based on game state changes
  useEffect(() => {
    if (gameState === 'result') {
      if (isPlayerWinner) {
        sfxSuccess.play().catch(err => console.error("Error playing success sound:", err));
      } else {
        sfxFail.play().catch(err => console.error("Error playing fail sound:", err));
      }
    }
  }, [gameState, isPlayerWinner, sfxSuccess, sfxFail]);

  // Apply theme to body background
  useEffect(() => {
    document.body.className = `min-h-screen transition-colors duration-1000 ${currentTheme.replace('bg-', 'bg-')}`;
    
    return () => {
      document.body.className = '';
    };
  }, [currentTheme]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center text-indigo-800">Cipher Clash</h1>
          <button 
            onClick={() => setShowGuide(true)}
            className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
            aria-label="How to Play"
          >
            <Help className="w-5 h-5" />
          </button>
        </div>

        <GameStatus 
          gameState={gameState}
          level={level}
          personalBest={personalBest}
          lives={lives}
          timeLeft={timeLeft}
          startGame={startGame}
          resetGame={resetGame}
          currentTheme={currentTheme}
        />
        <GameGrid 
          onButtonClick={handleSymbolClick}
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
