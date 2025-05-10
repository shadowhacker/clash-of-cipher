
import React from 'react';
import GameGrid from '../components/GameGrid';
import GameStatus from '../components/GameStatus';
import { useGame } from '../hooks/useGame';

const Index = () => {
  const { 
    gameState,
    round,
    playerWins,
    botWins,
    code,
    userInput,
    isPlayerWinner,
    startGame,
    handleSymbolClick,
    resetGame,
    totalRounds
  } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">Cipher Clash</h1>
        <GameStatus 
          gameState={gameState}
          round={round}
          playerWins={playerWins}
          botWins={botWins}
          totalRounds={totalRounds}
          startGame={startGame}
          resetGame={resetGame}
        />
        <GameGrid 
          onButtonClick={handleSymbolClick}
          gameState={gameState}
          code={code}
          userInput={userInput}
          isPlayerWinner={isPlayerWinner}
        />
      </div>
    </div>
  );
};

export default Index;
