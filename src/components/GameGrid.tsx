
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface GameGridProps {
  onButtonClick: (symbol: string) => void;
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  code: string[];
  userInput: string[];
  isPlayerWinner: boolean | null;
  currentSymbolPack: string[];
  gridSymbols: string[];
  progressPct: number;
}

const GameGrid: React.FC<GameGridProps> = ({ 
  onButtonClick, 
  gameState, 
  code, 
  userInput,
  isPlayerWinner,
  gridSymbols,
  progressPct,
}) => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Show level up message when progress reaches 100%
  useEffect(() => {
    if (progressPct === 100) {
      setShowLevelUp(true);
      const timer = setTimeout(() => {
        setShowLevelUp(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [progressPct]);

  // Handle button click with visual feedback
  const handleButtonClick = (symbol: string, index: number) => {
    setHighlightedIndex(index);
    setTimeout(() => {
      setHighlightedIndex(null);
    }, 150);
    onButtonClick(symbol);
  };

  // Determine if a symbol is part of the wrong input
  const isWrongInput = (symbol: string, index: number): boolean => {
    if (gameState !== 'result' || isPlayerWinner !== false) return false;
    
    // Find the first incorrect input position
    let firstWrongIndex = -1;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== code[i]) {
        firstWrongIndex = i;
        break;
      }
    }
    
    // If this is the wrong symbol that was tapped
    return firstWrongIndex >= 0 && index === gridSymbols.indexOf(userInput[firstWrongIndex]);
  };

  // Check if this symbol is part of the correct sequence (for game over visualization)
  const isCorrectCode = (symbol: string): boolean => {
    if (gameState !== 'result' || isPlayerWinner !== false) return false;
    return code.includes(symbol);
  };

  return (
    <div className="relative">
      {gameState !== 'idle' && (
        <>
          <div className="mb-1 text-center text-xs text-indigo-600 font-medium">
            Level Progress (10 rounds)
          </div>
          <div className="mb-3 relative">
            <Progress value={progressPct} className="h-1 bg-red-300" />
            {showLevelUp && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/80 rounded-md text-white font-bold">
                Level Up!
              </div>
            )}
          </div>
        </>
      )}
      
      {gameState === 'showCode' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black rounded-md pointer-events-none">
          <div className="flex flex-wrap gap-4 max-w-xs justify-center shadow-2xl rounded-lg px-6 py-4 text-4xl font-bold text-white">
            {code.map((symbol, idx) => (
              <span key={idx} className="text-4xl text-white">{symbol}</span>
            ))}
          </div>
        </div>
      )}
      
      {gameState === 'result' && (
        <div className={`absolute inset-0 flex items-center justify-center z-10 ${
          isPlayerWinner === true ? 'bg-green-500/80' : 'bg-red-500/80'
        } rounded-md`}>
          <div className="text-white text-2xl font-bold">
            {isPlayerWinner === true ? 'Correct!' : 'Wrong!'}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-2 max-w-[320px] mx-auto">
        {gridSymbols.map((symbol, index) => (
          <button
            key={index}
            className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-md shadow-md text-2xl transition-colors ${
              isWrongInput(symbol, index) ? 'bg-red-500/70 text-white' : 
              isCorrectCode(symbol) && gameState === 'result' && !isPlayerWinner ? 'bg-green-500/70 text-white' :
              highlightedIndex === index ? 'bg-green-400 text-indigo-800' : 
              'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'
            }`}
            onClick={() => handleButtonClick(symbol, index)}
            disabled={gameState !== 'input'}
            aria-label={`Symbol ${index + 1}`}
          >
            {symbol}
          </button>
        ))}
      </div>
      
      {gameState === 'input' && (
        <div className="mt-4 flex flex-col gap-2 items-center">
          <div className="flex justify-center gap-2">
            <div className="text-sm font-medium text-indigo-800">Progress:</div>
            <div className="flex gap-1">
              {code.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-6 h-6 rounded-full border-2 border-indigo-800 ${
                    userInput[idx] ? 'bg-indigo-800' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameGrid;
