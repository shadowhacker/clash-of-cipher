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
    <div className="relative mt-4">
      {/* Decorative line above grid */}
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-600/70 to-transparent mb-8"></div>

      {/* Show code overlay - simplified but keeping aesthetic elements */}
      {gameState === 'showCode' && (
        <div className=" absolute inset-0 flex items-center justify-center z-10 bg-black/80 rounded-md pointer-events-none">
          <div className="flex flex-col items-center gap-4 max-w-xs justify-center shadow-2xl rounded-lg px-6 py-4">
            <p className="text-amber-400 text-2xl font-medium tracking-wider uppercase">
              Meditate on these
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-4xl font-bold text-white">
              {code.map((symbol, idx) => (
                <span key={idx}>
                  <img
                    src={`/symbols/${symbol}`}
                    alt={`Symbol ${idx + 1}`}
                    className="w-10 h-10 object-contain inline-block"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <div className={`absolute inset-0 flex items-center justify-center z-10 ${isPlayerWinner === true ? 'bg-green-900/50' : 'bg-red-900/50'
          } rounded-md pointer-events-none`}>
          <div className="text-amber-100 text-2xl font-bold drop-shadow-lg px-6 py-3 rounded-lg backdrop-blur-sm">
            {isPlayerWinner === true ? 'Perfect Meditation! 🧘' : 'Meditation Broken! 💔'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 max-w-[320px] mx-auto relative">
        {/* Container for the grid */}
        <div className="absolute inset-0 -m-3 border-2 border-amber-700/40 rounded-lg pointer-events-none"></div>

        {gridSymbols.map((symbol, index) => {
          // Determine cell color logic for wrong taps visualization
          let cellClassName = "w-16 h-16 sm:w-[70px] sm:h-[70px] flex items-center justify-center rounded-md transition-all ";

          if (showWrongTaps && isWrongInput(symbol, index)) {
            cellClassName += "bg-red-800/80 border-2 border-red-500/100 shadow-md shadow-red-900/50";
          } else if (showWrongTaps && isCorrectCode(symbol)) {
            cellClassName += "bg-green-700/90 border-2 border-green-400/100 shadow-md shadow-green-600/50";
          } else if (highlightedIndex === index) {
            cellClassName += "bg-amber-700/90 border-2 border-amber-400 scale-105 shadow-md shadow-amber-600/50";
          } else {
            cellClassName += "bg-amber-900/50 hover:bg-amber-800/80 border border-amber-700/70 shadow-inner shadow-amber-900/50";
          }

          return (
            <button
              key={index}
              className={cellClassName}
              onClick={() => handleButtonClick(symbol, index)}
              disabled={gameState !== 'input'}
              aria-label={`Symbol ${index + 1}`}
            >
              <img
                src={`/symbols/${symbol}`}
                alt={`Symbol ${index + 1}`}
                className="w-10 h-10 object-contain"
              />
            </button>
          );
        })}
      </div>

      {gameState === 'input' && (
        <div className="mt-6 flex flex-col gap-2 items-center">
          <div className="flex justify-center gap-2 items-center">
            <div className="text-sm font-medium text-amber-400 uppercase tracking-wider">Progress</div>
            <div className="flex gap-1 ml-2">
              {code.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${userInput[idx]
                    ? 'bg-amber-700 border border-amber-500'
                    : 'bg-transparent border-2 border-amber-600/50'
                    }`}
                >
                  {userInput[idx] && (
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Decorative line below grid */}
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-600/70 to-transparent mt-8"></div>
    </div>
  );
};

export default GameGrid;
