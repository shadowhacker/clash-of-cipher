import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useGameLaunch } from './useGameLaunch.tsx';
import {
  areAllImagesLoaded,
  preloadAllSymbols,
  preloadSpecificSymbols,
  MASTER_SYMBOLS
} from '../utils/symbolCacheUtils';

// Game constants
export const MAX_ROUND_TIME = 10; // Maximum time for each round in seconds

// Game states
type GameState = 'idle' | 'showCode' | 'input' | 'result';

// Color themes for different level milestones
const THEMES = [
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-fuchsia-500',
  'bg-rose-500'
];

// Hook for managing game state
export const useGame = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [personalBest, setPersonalBest] = useState(() => {
    const saved = localStorage.getItem('cipher-clash-best');
    return saved ? parseInt(saved) : 0;
  });
  const [code, setCode] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [isPlayerWinner, setIsPlayerWinner] = useState<boolean | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [lives, setLives] = useState(2);
  const [timeLeft, setTimeLeft] = useState(MAX_ROUND_TIME);
  const [gridSymbols, setGridSymbols] = useState<string[]>([]);
  const [showStartScreen, setShowStartScreen] = useState(true);

  // New scoring system state
  const [totalScore, setTotalScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [gems, setGems] = useState(0);
  const [showWrongTaps, setShowWrongTaps] = useState(false);

  // Timer reference to track and clear intervals
  const timerRef = useRef<number | null>(null);

  // Function references to solve circular dependencies
  const startInputPhaseRef = useRef<() => void>(() => { });
  const restartSameLevelRef = useRef<() => void>(() => { });

  // Clear any existing timer
  const clearGameTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Get current theme based on level
  const getCurrentTheme = useCallback((currentLevel: number) => {
    return THEMES[Math.floor((currentLevel - 1) / 10) % THEMES.length];
  }, []);

  // Get current symbol pack based on level
  const getCurrentSymbolPack = useCallback((currentLevel: number) => {
    const packIndex = Math.floor((currentLevel - 1) / 7) % 2;
    return packIndex === 0
      ? MASTER_SYMBOLS.slice(0, 8)
      : MASTER_SYMBOLS.slice(4, 12);
  }, []);

  // Calculate code length based on level
  const getCodeLength = useCallback((currentLevel: number) => {
    const length = 2 + Math.floor((currentLevel - 1) / 4);
    return Math.min(length, 20); // Cap at 20 symbols
  }, []);

  // Calculate round score based on new formula
  const calculateRoundScore = useCallback(
    (
      round: number,
      codeLen: number,
      secondsRemaining: number,
      streak: number
    ) => {
      // Base points: (roundNumber ** 2) * codeLength
      const basePts = Math.pow(round, 2) * codeLen;

      // Speed multiplier: 1 + (secondsLeft / 10) - ranges from 1.0 to 2.0
      const speedMult = 1 + secondsRemaining / 10;

      // Flawless multiplier: 1.25 ** currentStreak
      const flawlessMult = Math.pow(1.25, streak);

      // Calculate round score
      let roundScore = Math.floor(basePts * speedMult * flawlessMult);

      // Jackpot round: every 20th round adds 1000 bonus points
      if (round % 20 === 0) {
        roundScore += 1000;
      }

      return {
        roundScore,
        speedMult,
        flawlessMult
      };
    },
    []
  );

  // Game over function
  const gameOver = useCallback(() => {
    clearGameTimer();
    setIsPlayerWinner(false);
    setGameState('result');

    // Update personal best if total score is higher
    if (totalScore > personalBest) {
      setPersonalBest(totalScore);
      localStorage.setItem('cipher-clash-best', totalScore.toString());
    }

    setTimeout(
      () => {
        setShowGameOverModal(true);
      },
      showWrongTaps ? 2500 : 1000
    ); // Longer delay if showing wrong taps
  }, [totalScore, personalBest, clearGameTimer, showWrongTaps]);

  // Start input phase (renamed from flash-done callback)
  const startInputPhase = useCallback(() => {
    setGameState('input');

    // Immediately start the timer as requested
    setTimeLeft(MAX_ROUND_TIME);
    clearGameTimer();

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearGameTimer();
          // Use the function reference to avoid circular dependency
          if (typeof restartSameLevelRef.current === 'function') {
            restartSameLevelRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearGameTimer]);

  // Update function reference
  startInputPhaseRef.current = startInputPhase;

  // Restart the same level function (on wrong input or timeout)
  const restartSameLevel = useCallback((): void => {
    setUserInput([]);
    setGameState('showCode');
    // Show the code for 2000ms to give more time to see it
    setTimeout(() => {
      // Use the function reference
      if (typeof startInputPhaseRef.current === 'function') {
        startInputPhaseRef.current();
      }
    }, 2000);
  }, []);

  // Update function reference
  restartSameLevelRef.current = restartSameLevel;

  // Lose a life handler - define before any functions that use it
  const loseLife = useCallback(() => {
    clearGameTimer(); // Clear any existing timer first

    // Reset streak when losing a life
    setCurrentStreak(0);
    setShowWrongTaps(true);

    setLives((prevLives) => {
      const newLives = Math.max(prevLives - 1, 0);
      if (newLives === 0) {
        // Call gameOver directly here to avoid stale closure issues
        setTimeout(() => gameOver(), 0);
      } else {
        // Only restart if we still have lives left
        setTimeout(() => {
          setShowWrongTaps(false);
          // Use the function reference
          if (typeof restartSameLevelRef.current === 'function') {
            restartSameLevelRef.current();
          }
        }, 2500); // Show wrong taps for 2.5 seconds
      }
      return newLives;
    });

    // Add a pause to make life loss more noticeable
    setGameState('result');
    setIsPlayerWinner(false);
    setTimeLeft(MAX_ROUND_TIME); // Reset timer using constant
  }, [clearGameTimer, gameOver]);

  // Generate a grid ensuring all code symbols are included
  const generateGrid = useCallback(
    (symbolPack: string[], codeSequence: string[]) => {
      // Start with a random grid from the symbol pack
      const result: string[] = Array.from({ length: 16 }, () => {
        const randomIndex = Math.floor(Math.random() * symbolPack.length);
        return symbolPack[randomIndex];
      });

      // Make sure all code symbols exist in the grid
      codeSequence.forEach((symbol) => {
        // Check if symbol is already in the grid
        if (!result.includes(symbol)) {
          // Replace a random cell with this symbol
          const randomCellIndex = Math.floor(Math.random() * result.length);
          result[randomCellIndex] = symbol;
        }
      });

      return result;
    },
    []
  );

  // Generate a random code of symbols based on current level
  const generateCode = useCallback(
    (currentLevel: number) => {
      const currentPack = getCurrentSymbolPack(currentLevel);
      const codeLength = getCodeLength(currentLevel);

      return Array.from({ length: codeLength }, () => {
        const randomIndex = Math.floor(Math.random() * currentPack.length);
        return currentPack[randomIndex];
      });
    },
    [getCurrentSymbolPack, getCodeLength]
  );

  // Calculate next milestone level
  const getNextMilestone = useCallback((currentLevel: number) => {
    const nextColor = Math.ceil((currentLevel + 1) / 10) * 10;
    const nextPack = Math.ceil((currentLevel + 1) / 7) * 7;
    return Math.min(nextColor, nextPack);
  }, []);

  // Initialize game launch hook
  const { launchRun, Overlay } = useGameLaunch({
    onLaunchComplete: () => {
      // Start the first round after countdown
      const initialLevel = 1;
      const newCode = generateCode(initialLevel);
      const currentPack = getCurrentSymbolPack(initialLevel);
      setCode(newCode);
      setUserInput([]);
      setLevel(initialLevel);

      // Generate grid symbols
      const newGridSymbols = generateGrid(currentPack, newCode);

      // Set the grid symbols right away
      setGridSymbols(newGridSymbols);

      // Mark these symbols as loaded (even if they're not yet)
      // This ensures the game flow continues
      const symbolsToMark = [...new Set([...newCode, ...newGridSymbols])];
      symbolsToMark.forEach(symbol => {
        // Force preload in browser cache
        const img = new Image();
        img.src = `/symbols/${symbol}`;
      });

      // Skip waiting for preloading, just show the code immediately
      setGameState('showCode');
      setShowGameOverModal(false);
      setLives(2);
      setTimeLeft(MAX_ROUND_TIME);
      setShowStartScreen(false);

      // Reset score system
      setTotalScore(0);
      setCurrentStreak(0);
      setGems(0);
      setShowWrongTaps(false);

      // Show the code for 2000ms to give more time to see it
      setTimeout(() => {
        startInputPhase();
      }, 2000);
    }
  });

  // Update startGame to use launchRun
  const startGame = useCallback(() => {
    clearGameTimer();
    launchRun();
  }, [clearGameTimer, launchRun]);

  // Start next level
  const startNextLevel = useCallback(
    (newLevel: number): void => {
      clearGameTimer();
      const newCode = generateCode(newLevel);
      const currentPack = getCurrentSymbolPack(newLevel);
      setCode(newCode);
      setUserInput([]);
      setLevel(newLevel);

      // Generate a new grid for this level, ensuring all code symbols are included
      const newGridSymbols = generateGrid(currentPack, newCode);

      // Set the grid symbols right away
      setGridSymbols(newGridSymbols);

      // Mark these symbols as loaded (even if they're not yet)
      // This ensures the game flow continues
      const symbolsToMark = [...new Set([...newCode, ...newGridSymbols])];
      symbolsToMark.forEach(symbol => {
        // Force preload in browser cache
        const img = new Image();
        img.src = `/symbols/${symbol}`;
      });

      // Skip waiting for preloading, just show the code immediately
      setGameState('showCode');
      setTimeLeft(MAX_ROUND_TIME);

      // Show the code for 2000ms to give more time to see it
      setTimeout(() => {
        startInputPhase();
      }, 2000);
    },
    [
      generateCode,
      getCurrentSymbolPack,
      generateGrid,
      clearGameTimer,
      startInputPhase
    ]
  );

  // Handle user input - remove timer start on first input
  const handleSymbolClick = useCallback(
    (symbol: string) => {
      if (gameState !== 'input') return;

      const newUserInput = [...userInput, symbol];
      setUserInput(newUserInput);

      // If user has selected enough symbols, compare with code
      if (newUserInput.length === code.length) {
        clearGameTimer();
        // Check if input matches the code exactly
        const isCorrect = newUserInput.every((sym, i) => sym === code[i]);

        if (isCorrect) {
          // User got it right
          setIsPlayerWinner(true);

          // Increment streak
          const newStreak = currentStreak + 1;
          setCurrentStreak(newStreak);

          // Calculate score for this round
          const secondsRemaining = timeLeft;
          const { roundScore, speedMult } = calculateRoundScore(
            level,
            code.length,
            secondsRemaining,
            newStreak
          );

          // Update total score
          setTotalScore((prev) => prev + roundScore);

          // Show toast with score info
          toast(
            `+${roundScore} pts • x${speedMult.toFixed(
              1
            )} Speed • Streak ${newStreak}`,
            { duration: 1000 }
          );

          // Show success result briefly
          setGameState('result');

          // Auto advance to next level after 1 second
          setTimeout(async () => {
            const nextLevel = level + 1;
            await startNextLevel(nextLevel);
          }, 1000);
        } else {
          // User got it wrong
          loseLife();
        }
      }
    },
    [
      gameState,
      userInput,
      code,
      level,
      timeLeft,
      loseLife,
      clearGameTimer,
      currentStreak,
      calculateRoundScore,
      startNextLevel
    ]
  );

  // Copy "share my best" text to clipboard
  const shareScore = useCallback(() => {
    const text = `I just scored ${totalScore} points on Round ${level} of Cipher Clash!\nThink you can beat me? Play → https://symbol-grid-sparkle-showdown.lovable.app/`;
    navigator.clipboard.writeText(text);
    return text;
  }, [totalScore, level]);

  // Reset the game
  const resetGame = useCallback(() => {
    clearGameTimer();
    setGameState('idle');
    setLevel(1);
    setUserInput([]);
    setCode([]);
    setIsPlayerWinner(null);
    setShowGameOverModal(false);
    setLives(2);
    setTimeLeft(MAX_ROUND_TIME);
    setTotalScore(0);
    setCurrentStreak(0);
    setShowWrongTaps(false);
  }, [clearGameTimer]);

  // Dismiss start screen
  const dismissStartScreen = useCallback(() => {
    setShowStartScreen(false);
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      clearGameTimer();
    };
  }, [clearGameTimer]);

  return {
    gameState,
    level,
    personalBest,
    code,
    userInput,
    isPlayerWinner,
    showGameOverModal,
    lives,
    timeLeft,
    currentSymbolPack: getCurrentSymbolPack(level),
    currentTheme: getCurrentTheme(level),
    gridSymbols,
    startGame,
    handleSymbolClick,
    resetGame,
    shareScore,
    showStartScreen,
    dismissStartScreen,
    nextMilestone: getNextMilestone(level),
    totalScore,
    currentStreak,
    gems,
    showWrongTaps,
    Overlay
  };
};
