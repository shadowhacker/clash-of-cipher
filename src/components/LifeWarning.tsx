
import React, { useEffect, useState } from 'react';

interface LifeWarningProps {
  lives: number;
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  isPlayerWinner: boolean | null;
}

const LifeWarning: React.FC<LifeWarningProps> = ({ lives, gameState, isPlayerWinner }) => {
  const [showLifeWarning, setShowLifeWarning] = useState(false);
  
  // Handle life warning display
  useEffect(() => {
    if (lives === 1 && gameState === 'result' && !isPlayerWinner) {
      setShowLifeWarning(true);
      const timer = setTimeout(() => {
        setShowLifeWarning(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [lives, gameState, isPlayerWinner]);

  if (!showLifeWarning || lives !== 1) {
    return null;
  }

  return (
    <div className="mb-4 p-2 bg-yellow-500/80 text-white text-center rounded-md font-bold animate-pulse">
      ⚠️ 1 life left – focus!
    </div>
  );
};

export default LifeWarning;
