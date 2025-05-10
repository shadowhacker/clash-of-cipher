
import React from 'react';

// Array of symbols to display on the grid buttons
const SYMBOLS = ['▲', '●', '◆', '★', '☆', '■', '✦', '✿'];

interface GameGridProps {
  onButtonClick: (symbol: string) => void;
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  code: string[];
  userInput: string[];
  aiInput?: string[];
  isPlayerWinner: boolean | null;
}

const GameGrid: React.FC<GameGridProps> = ({ 
  onButtonClick, 
  gameState, 
  code, 
  userInput,
  aiInput = [],
  isPlayerWinner
}) => {
  // Function to randomly select symbols for the grid
  const getRandomSymbols = () => {
    const result: string[] = [];
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
      result.push(SYMBOLS[randomIndex]);
    }
    return result;
  };

  // Generate the grid with random symbols
  const gridSymbols = getRandomSymbols();

  return (
    <div className="relative">
      {gameState === 'showCode' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-indigo-800/80 rounded-md">
          <div className="flex gap-4">
            {code.map((symbol, idx) => (
              <span key={idx} className="text-4xl text-white">{symbol}</span>
            ))}
          </div>
        </div>
      )}
      
      {gameState === 'result' && (
        <div className={`absolute inset-0 flex items-center justify-center z-10 ${
          isPlayerWinner === true ? 'bg-green-500/80' : 
          isPlayerWinner === false ? 'bg-red-500/80' : 
          'bg-yellow-500/80'
        } rounded-md`}>
          <div className="text-white text-2xl font-bold">
            {isPlayerWinner === true ? 'You Win!' : 
             isPlayerWinner === false ? 'AI Wins!' : 
             'Tie!'}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-2 max-w-[320px] mx-auto">
        {gridSymbols.map((symbol, index) => (
          <button
            key={index}
            className="w-[72px] h-[72px] flex items-center justify-center bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-md shadow-md text-2xl transition-colors"
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
            <div className="text-sm font-medium text-indigo-800">You:</div>
            {[0, 1, 2].map((idx) => (
              <div 
                key={idx} 
                className={`w-6 h-6 rounded-full border-2 border-indigo-800 ${
                  userInput[idx] ? 'bg-indigo-800' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <div className="text-sm font-medium text-indigo-800">AI:</div>
            {[0, 1, 2].map((idx) => (
              <div 
                key={idx} 
                className={`w-6 h-6 rounded-full border-2 border-red-500 ${
                  aiInput[idx] ? 'bg-red-500' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameGrid;
