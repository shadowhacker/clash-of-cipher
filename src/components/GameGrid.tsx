import React, { useState, useEffect } from 'react';
import CachedSymbol from './CachedSymbol';
import { preloadAllGameSymbols } from '../hooks/useImageCache';

// Import the CACHE_BUSTER constant
const CACHE_BUSTER = 'v1';

// Default placeholder symbols for initial loading
const DEFAULT_PLACEHOLDER_SYMBOLS = Array(16).fill('symbol-1.png');

interface GameGridProps {
  onButtonClick: (symbol: string) => void;
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  code: string[];
  userInput: string[];
  isPlayerWinner: boolean | null;
  gridSymbols: string[];
  showWrongTaps?: boolean;
  paused?: boolean; // NEW: pause all input and updates
};

const GameGrid: React.FC<GameGridProps> = ({
  onButtonClick,
  gameState,
  code,
  userInput,
  isPlayerWinner,
  gridSymbols,
  showWrongTaps = false,
  paused = false,
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [hasLoadedSymbols, setHasLoadedSymbols] = useState(false);

  // Symbols to display - use placeholder if grid is empty
  const displaySymbols = gridSymbols.length > 0 ? gridSymbols : DEFAULT_PLACEHOLDER_SYMBOLS;

  // Preload symbols when they change
  useEffect(() => {
    // Preload all symbols when grid changes
    preloadAllGameSymbols();

    // Mark as having loaded symbols once we have real symbols
    if (gridSymbols.length > 0) {
      setHasLoadedSymbols(true);
    }
  }, [gridSymbols]);

  // Handle button click with visual feedback
  const handleButtonClick = (symbol: string, index: number): void => {
    if (paused) return; // Disable input when paused
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
    <div className="relative mt-2 sm:mt-4 flex flex-col justify-between">
      {/* Decorative line above grid */}
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-600/70 to-transparent mb-4 sm:mb-6"></div>

      {/* Responsive height container for grid and progress */}
      <div className="flex flex-col h-[340px] xs:h-[380px] sm:h-[420px]">
        {/* Show code overlay - simplified but keeping aesthetic elements */}
        {gameState === 'showCode' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 rounded-md pointer-events-none" style={{ background: 'rgba(0,0,0,0.92)' }}>
            <div className="flex flex-col items-center gap-4 max-w-xs justify-center shadow-2xl rounded-lg px-6 py-4">
              <p className="text-amber-400 text-base sm:text-lg font-medium tracking-wider uppercase" style={{ fontFamily: 'Hind Madurai, sans-serif', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                Memorise these symbols
              </p>
              <div className="flex flex-wrap gap-4 justify-center text-4xl font-bold text-white">
                {code.map((symbol, idx) => (
                  <span key={idx} className="bg-amber-800/80 p-2 rounded-md border border-amber-600/70 shadow-md">
                    <CachedSymbol symbol={symbol} index={idx} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div
            className={`absolute inset-0 flex items-center justify-center z-10 rounded-md pointer-events-none
              ${isPlayerWinner ? 'animate-success-pulse' : 'animate-failure-pulse'}`}
          >
            {/* Background with gradient and pattern */}
            <div
              className={`absolute inset-0 rounded-xl ${isPlayerWinner
                ? 'bg-gradient-to-br from-emerald-900/95 via-green-800/95 to-teal-900/95'
                : 'bg-gradient-to-br from-rose-900/95 via-red-800/95 to-amber-900/95'
                }`}
              style={{
                backgroundImage: isPlayerWinner
                  ? "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2334d399' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                  : "url(\"data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f43f5e' fill-opacity='0.15'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6h-2c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
              }}
            ></div>

            {/* Dark overlay for better contrast */}
            <div className="absolute inset-0 bg-black/40 rounded-xl"></div>

            {/* Message container with glow effect */}
            <div
              className={`relative px-8 py-5 rounded-xl backdrop-blur-md 
                ${isPlayerWinner
                  ? 'bg-emerald-900/80 border-2 border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.6)]'
                  : 'bg-rose-900/80 border-2 border-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                }`}
              style={{
                minWidth: '80%',
                boxShadow: isPlayerWinner
                  ? '0 0 25px rgba(16, 185, 129, 0.5), inset 0 0 15px rgba(52, 211, 153, 0.3)'
                  : '0 0 25px rgba(225, 29, 72, 0.5), inset 0 0 15px rgba(244, 63, 94, 0.3)'
              }}
            >
              {/* Animated icons */}
              {isPlayerWinner ? (
                <div className="absolute -top-8 -right-8 text-5xl animate-float">🧘</div>
              ) : (
                <div className="absolute -top-8 -right-8 text-5xl animate-shake">💔</div>
              )}

              {/* Message text with glow */}
              <div
                className={`text-center font-bold drop-shadow-lg
                  ${isPlayerWinner
                    ? 'text-4xl sm:text-5xl text-white'
                    : 'text-4xl sm:text-5xl text-white'
                  }`}
                style={{
                  textShadow: isPlayerWinner
                    ? '0 0 15px rgba(52,211,153,0.9), 0 2px 0 rgba(0,0,0,0.7)'
                    : '0 0 15px rgba(244,63,94,0.9), 0 2px 0 rgba(0,0,0,0.7)'
                }}
              >
                {isPlayerWinner === true ? 'Perfect Meditation!' : 'Meditation Broken!'}
              </div>

              {/* Subtitle */}
              <div
                className={`mt-3 text-center text-lg sm:text-xl font-medium ${isPlayerWinner
                  ? 'text-emerald-100'
                  : 'text-rose-100'
                  }`}
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                {isPlayerWinner === true
                  ? 'Your focus is unshakeable'
                  : 'Focus harder next time'}
              </div>
            </div>
          </div>
        )}

        {/* Grid section - centered with flex */}
        <div className="flex items-center justify-center flex-grow">
          <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-[290px] sm:max-w-[320px] mx-auto relative">
            {/* Container for the grid */}
            <div className="absolute inset-0 -m-2 sm:-m-3 border-2 border-amber-700/40 rounded-lg pointer-events-none"></div>

            {Array.from({ length: 16 }).map((_, index) => {
              const symbol = gridSymbols[index] || '';
              // Determine cell color logic for wrong taps visualization
              let cellClassName = "w-[64px] h-[64px] sm:w-[70px] sm:h-[70px] flex items-center justify-center rounded-md transition-all ";

              if (showWrongTaps && isWrongInput(symbol, index)) {
                cellClassName += "bg-red-800/80 border-2 border-red-500/100 shadow-md shadow-red-900/50";
              } else if (showWrongTaps && isCorrectCode(symbol)) {
                cellClassName += "bg-green-700/90 border-2 border-green-400/100 shadow-md shadow-green-600/50";
              } else if (highlightedIndex === index) {
                cellClassName += "bg-amber-700/90 border-2 border-amber-400 scale-105 shadow-md shadow-amber-600/50";
              } else if (!hasLoadedSymbols || !symbol) {
                cellClassName += "bg-amber-900/30 border border-amber-700/30 shadow-inner shadow-amber-900/30";
              } else {
                cellClassName += "bg-amber-900/50 hover:bg-amber-800/80 border border-amber-700/70 shadow-inner shadow-amber-900/50";
              }

              return (
                <button
                  key={index}
                  className={cellClassName}
                  onClick={() => symbol && handleButtonClick(symbol, index)}
                  disabled={gameState !== 'input' || !symbol}
                  aria-label={`Symbol ${index + 1}`}
                >
                  {symbol && <CachedSymbol symbol={symbol} index={index} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress section - fixed height area */}
        <div className="h-[50px] flex items-center justify-center">
          {gameState === 'input' && (
            <div className="flex flex-col gap-1 sm:gap-2 items-center">
              <div className="flex justify-center gap-1 sm:gap-2 items-center">
                <div className="text-sm font-medium text-amber-400 uppercase tracking-wider">Progress</div>
                <div className="flex gap-1 ml-2">
                  {code.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${userInput[idx]
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
        </div>
      </div>

      {/* Decorative line below grid */}
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-600/70 to-transparent mt-2 sm:mt-4"></div>
    </div>
  );
};

export default GameGrid;
