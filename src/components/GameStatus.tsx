
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface GameStatusProps {
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  round: number;
  playerWins: number;
  botWins: number;
  totalRounds: number;
  startGame: () => void;
  resetGame: () => void;
}

const GameStatus: React.FC<GameStatusProps> = ({ 
  gameState, 
  round, 
  playerWins, 
  botWins, 
  totalRounds,
  startGame,
  resetGame
}) => {
  return (
    <div className="h-[48px] flex items-center justify-between mb-4 bg-indigo-50 rounded-md p-2 max-w-[320px] mx-auto">
      {gameState === 'idle' ? (
        <div className="flex w-full justify-center">
          <Button 
            onClick={startGame}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Start Game
          </Button>
        </div>
      ) : (
        <>
          <div className="text-indigo-800 font-medium">
            Round {round} / {totalRounds}
          </div>
          <div className="text-indigo-800 font-medium">
            Player {playerWins} - {botWins} Bot
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
