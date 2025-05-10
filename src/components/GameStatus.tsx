import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Medal } from 'lucide-react';

interface GameStatusProps {
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  level: number;
  personalBest: number;
  lives: number;
  timeLeft: number;
  startGame: () => void;
  resetGame: () => void;
  currentTheme: string;
  nextMilestone: number;
  totalScore: number;
  onOpenLeaderboard?: () => void;
}

const GameStatus: React.FC<GameStatusProps> = ({ 
  gameState, 
  level, 
  personalBest,
  lives,
  timeLeft,
  startGame,
  resetGame,
  currentTheme,
  totalScore,
  onOpenLeaderboard,
}) => {
  const themeClasses = {
    'bg-amber-500': 'bg-amber-600 hover:bg-amber-700',
    'bg-emerald-500': 'bg-emerald-600 hover:bg-emerald-700',
    'bg-sky-500': 'bg-sky-600 hover:bg-sky-700',
    'bg-fuchsia-500': 'bg-fuchsia-600 hover:bg-fuchsia-700',
    'bg-rose-500': 'bg-rose-600 hover:bg-rose-700',
  }[currentTheme] || 'bg-indigo-600 hover:bg-indigo-700';

  const isTimeCritical = timeLeft <= 3 && gameState === 'input';

  return (
    <div className="flex flex-col space-y-1 max-w-[320px] mx-auto">
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-indigo-600 font-medium">
            🏆 Lifetime Best: {personalBest}
          </div>
        </div>
      </div>
      
      <div className="h-[48px] flex items-center justify-between mb-2 bg-indigo-50 rounded-md p-2 transition-colors">
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
            <div className="flex items-center space-x-2">
              <span className="text-indigo-800 font-medium">Round {level}</span>
              <span className="text-indigo-800">·</span>
              <span className="text-indigo-800 font-medium">Score {totalScore}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-indigo-800 font-medium">❤️ {lives}</span>
              <span className="text-indigo-800 font-medium ${isTimeCritical ? 'animate-bounce' : ''}">
                ⏱ {timeLeft}s
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onOpenLeaderboard} 
                className="p-1 ml-1"
                title="Hall of Heroes"
              >
                <Medal className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetGame} 
                className="p-1"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameStatus;
