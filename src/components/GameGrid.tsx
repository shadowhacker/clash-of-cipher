import React, { useState, useEffect } from 'react';

interface GameGridProps {
  onButtonClick: (symbol: string) => void;
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  code: string[];
  userInput: string[];
  isPlayerWinner: boolean | null;
  currentSymbolPack: string[];
  gridSymbols: string[];
  showWrongTaps?: boolean;
}

const GameGrid: React.FC<GameGridProps> = ({ 
  onButtonClick, 
  gameState, 
  code, 
  userInput,
  isPlayerWinner,
  gridSymbols,
  showWrongTaps = false,
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

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
      {gameState === 'showCode' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black rounded-md pointer-events-none">
          <div className="flex flex-col items-center flex-wrap gap-4 max-w-xs justify-center shadow-2xl rounded-lg px-6 py-4 text-4xl font-bold text-white">
            <p className="text-sm uppercase tracking-wide text-amber-400 mb-2">
              Memorise these!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {code.map((symbol, idx) => (
                <span key={idx} className="text-4xl text-white">{symbol}</span>
              ))}
            </div>
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
      
      <div className="grid grid-cols-3 gap-2 bg-black p-4 rounded-lg">
        {gridSymbols.map((symbol, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(symbol, index)}
            className={`
              w-16 h-16 sm:w-20 sm:h-20
              flex items-center justify-center
              bg-gray-700 border border-gray-600
              text-white text-2xl font-bold
              rounded-md shadow-inner
              hover:bg-gray-600
              transition-colors duration-150
              ${showWrongTaps && userInput[index] === symbol ? 'bg-green-500' : ''}
              ${showWrongTaps && userInput[index] !== symbol ? 'bg-red-600' : ''}
            `}
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
