
import React from 'react';

// Array of symbols to display on the grid buttons
const SYMBOLS = ['▲', '●', '◆', '★', '☆', '■', '✦', '✿'];

interface GameGridProps {
  onButtonClick: (symbol: string, index: number) => void;
}

const GameGrid: React.FC<GameGridProps> = ({ onButtonClick }) => {
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
    <div className="grid grid-cols-4 gap-2 max-w-[320px] mx-auto">
      {gridSymbols.map((symbol, index) => (
        <button
          key={index}
          className="w-[72px] h-[72px] flex items-center justify-center bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-md shadow-md text-2xl transition-colors"
          onClick={() => onButtonClick(symbol, index)}
          aria-label={`Symbol ${index + 1}`}
        >
          {symbol}
        </button>
      ))}
    </div>
  );
};

export default GameGrid;
