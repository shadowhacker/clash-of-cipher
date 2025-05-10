
import React from 'react';
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
  return (
    <div className="relative">
      {gameState !== 'idle' && (
        <div className="mb-3">
          <Progress value={progressPct} className="h-1" />
        </div>
      )}
      
      {gameState === 'showCode' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-indigo-800/80 rounded-md">
          <div className="flex flex-wrap gap-4 max-w-xs justify-center">
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
            className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-md shadow-md text-2xl transition-colors"
            onClick={() => onButtonClick(symbol)}
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
