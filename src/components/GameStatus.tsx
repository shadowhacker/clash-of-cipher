import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Medal, HelpCircle } from 'lucide-react';
import { MAX_ROUND_TIME } from '../config/gameConfig';
import { formatLargeNumber } from '@/utils/formatUtils';

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
  onOpenGuide?: () => void;
  playerName?: string;
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
  onOpenGuide,
  playerName
}) => {
  const themeClasses = {
    'bg-amber-500': 'bg-amber-600 hover:bg-amber-700',
    'bg-emerald-500': 'bg-emerald-600 hover:bg-emerald-700',
    'bg-sky-500': 'bg-sky-600 hover:bg-sky-700',
    'bg-fuchsia-500': 'bg-fuchsia-600 hover:bg-fuchsia-700',
    'bg-rose-500': 'bg-rose-600 hover:bg-rose-700',
  }[currentTheme] || 'bg-amber-600 hover:bg-amber-700';

  const isTimeCritical = timeLeft <= 3 && gameState === 'input';

  // Calculate the percentage for the progress bar using the MAX_ROUND_TIME constant
  const timePercentage = Math.min(100, Math.max(0, (timeLeft / MAX_ROUND_TIME) * 100));

  // Determine progress bar color based on time left
  const getProgressBarColor = () => {
    if (timeLeft <= 3) return 'bg-red-500';
    if (timeLeft <= 5) return 'bg-amber-500';
    return 'bg-amber-600';
  };

  return (
    <div className="flex flex-col space-y-3 max-w-[320px] mx-auto">
      {/* Welcome and Best Meditation Score */}
      <div className="mb-1">
        <div className="flex items-center justify-center">
          <div className="text-amber-400 font-medium text-center">
            {gameState === 'idle' && playerName ? (
              <div className="space-y-1">
                <div className="text-lg">Welcome back, {playerName}!</div>
                <div className="text-base font-semibold" title={personalBest.toLocaleString()}>
                  🏆 Best Meditation: {formatLargeNumber(personalBest).displayValue}
                </div>
              </div>
            ) : (
              <div className="text-base font-semibold" title={personalBest.toLocaleString()}>
                🏆 Best Meditation: {formatLargeNumber(personalBest).displayValue}
              </div>
            )}
          </div>
        </div>
      </div>

      {gameState !== 'idle' && (
        <div className="relative">
          {/* Decorative horizontal line */}
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-amber-600/70 to-transparent -top-2"></div>

          {/* Game status panel */}
          <div className="h-[52px] flex items-center justify-between mb-2 bg-amber-900/50 rounded-md p-3 transition-colors border border-amber-700/50">
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <span className="text-amber-400 font-medium text-sm">ROUND</span>
                <span className="text-amber-300 font-bold text-xl">{level}</span>
              </div>
              <div className="h-9 w-[1px] bg-amber-700/50 mx-1"></div>
              <div className="flex flex-col">
                <span className="text-amber-400 font-medium text-sm">SCORE</span>
                <span className="text-amber-300 font-bold text-xl" title={totalScore.toLocaleString()}>
                  {formatLargeNumber(totalScore).displayValue}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <span className="text-amber-300 font-bold text-xl flex items-center">
                  {lives} <span className="ml-1 text-base">❤️</span>
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className={`text-amber-300 font-bold text-xl flex items-center ${isTimeCritical ? 'animate-pulse text-red-400' : ''}`}>
                  {timeLeft}<span className="ml-1 text-base">s</span>
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetGame}
                className="p-1 rounded-full text-amber-400 hover:bg-amber-800/70 hover:text-amber-300"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Time progress bar */}
          <div className="w-full h-2 bg-amber-900/30 rounded-full overflow-hidden mt-1 mb-3" style={{ minHeight: '0.5rem' }}>
            {gameState === 'input' && (
              <div
                className={`h-full ${getProgressBarColor()} transition-all duration-1000 ease-linear`}
                style={{ width: `${timePercentage}%` }}
              ></div>
            )}
          </div>

          {/* Decorative horizontal line */}
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-amber-600/70 to-transparent -bottom-2"></div>
        </div>
      )}
    </div>
  );
};

export default GameStatus;
