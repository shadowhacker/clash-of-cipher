
import React from 'react';
import GameGrid from './GameGrid';
import GameStatus from './GameStatus';
import { Button } from './ui/button';
import AudioInitializer from './AudioInitializer';

interface GameContainerProps {
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  level: number;
  personalBest: number;
  code: string[];
  userInput: string[];
  isPlayerWinner: boolean | null;
  showGameOverModal: boolean;
  lives: number;
  timeLeft: number;
  currentSymbolPack: string[];
  currentTheme: string;
  gridSymbols: string[];
  themeClasses: string;
  handleSymbolClick: (symbol: string) => void;
  startGame: () => void;
  resetGame: () => void;
  nextMilestone: number;
  totalScore: number;
  currentStreak: number;
  showWrongTaps: boolean;
  playerName: string | null;
  onOpenGuide: () => void;
}

const GameContainer: React.FC<GameContainerProps> = ({
  gameState,
  level,
  personalBest,
  code,
  userInput,
  isPlayerWinner,
  lives,
  timeLeft,
  currentSymbolPack,
  currentTheme,
  gridSymbols,
  themeClasses,
  handleSymbolClick,
  startGame,
  resetGame,
  nextMilestone,
  totalScore,
  currentStreak,
  showWrongTaps,
  playerName,
  onOpenGuide
}) => {
  return (
    <>
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
        totalScore={totalScore}
        onOpenGuide={onOpenGuide}
        playerName={playerName || undefined}
      />

      <AudioInitializer onSymbolClick={handleSymbolClick}>
        <GameGrid
          onButtonClick={(symbol) => { }} // This prop will be overridden by AudioInitializer
          gameState={gameState}
          code={code}
          userInput={userInput}
          isPlayerWinner={isPlayerWinner}
          currentSymbolPack={currentSymbolPack}
          gridSymbols={gridSymbols}
          showWrongTaps={showWrongTaps}
          timeLeft={timeLeft}
        />
      </AudioInitializer>

      {gameState === 'idle' && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={startGame}
            className={`bg-amber-600 hover:bg-amber-700 text-lg px-8 py-6 text-amber-100 rounded-xl border border-amber-500/50`}
          >
            Begin Your Tapasya
          </Button>
        </div>
      )}
    </>
  );
};

export default GameContainer;
