
import React, { useEffect } from 'react';
import GameGrid from '../components/GameGrid';
import GameStatus from '../components/GameStatus';
import GameOverModal from '../components/GameOverModal';
import { useGame } from '../hooks/useGame';

const Index = () => {
  const { 
    gameState,
    level,
    personalBest,
    code,
    userInput,
    isPlayerWinner,
    showGameOverModal,
    currentSymbolPack,
    currentTheme,
    startGame,
    handleSymbolClick,
    resetGame,
    shareScore,
  } = useGame();

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
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">Cipher Clash</h1>
        <GameStatus 
          gameState={gameState}
          level={level}
          personalBest={personalBest}
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
        />
        <GameOverModal
          level={level}
          personalBest={personalBest}
          open={showGameOverModal}
          onRestart={startGame}
          onShare={shareScore}
        />
      </div>
    </div>
  );
};

export default Index;
