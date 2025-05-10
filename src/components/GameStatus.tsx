
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface GameStatusProps {
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  level: number;
  personalBest: number;
  startGame: () => void;
  resetGame: () => void;
  currentTheme: string;
}

const GameStatus: React.FC<GameStatusProps> = ({ 
  gameState, 
  level, 
  personalBest,
  startGame,
  resetGame,
  currentTheme,
}) => {
  const themeClasses = {
    'bg-amber-500': 'bg-amber-600 hover:bg-amber-700',
    'bg-emerald-500': 'bg-emerald-600 hover:bg-emerald-700',
    'bg-sky-500': 'bg-sky-600 hover:bg-sky-700',
    'bg-fuchsia-500': 'bg-fuchsia-600 hover:bg-fuchsia-700',
    'bg-rose-500': 'bg-rose-600 hover:bg-rose-700',
  }[currentTheme] || 'bg-indigo-600 hover:bg-indigo-700';

  return (
    <div className="h-[48px] flex items-center justify-between mb-4 bg-indigo-50 rounded-md p-2 max-w-[320px] mx-auto transition-colors">
      {gameState === 'idle' ? (
        <div className="flex w-full justify-center">
          <Button 
            onClick={startGame}
            className={themeClasses}
          >
            Start Game
          </Button>
        </div>
      ) : (
        <>
          <div className="text-indigo-800 font-medium">
            Level {level}
          </div>
          <div className="text-indigo-800 font-medium">
            Best: {personalBest}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetGame} 
            className="p-1"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default GameStatus;
