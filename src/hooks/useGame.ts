import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useGameLaunch } from './useGameLaunch.tsx';
import {
  preloadSpecificSymbols,
} from '../utils/symbolCacheUtils';
import {
  getSymbolPack,
  generateGrid as createSymbolGrid,
  verifyGrid
} from '../utils/symbolManager';
import { secureRandomSample } from '../utils/randomUtils';
import {
  MAX_ROUND_TIME,
  STARTING_LIVES,
  MILESTONE_INTERVALS,
  THEME_COLORS,
  SCORING,
  SYMBOL_CONFIG,
  getFlashTime,
  getSymbolCountRange
} from '../config/gameConfig';
import logger from '../utils/logger';

// Game states
type GameState = 'idle' | 'showCode' | 'input' | 'result';

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
  const [lives, setLives] = useState(STARTING_LIVES);
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
  const loseLifeRef = useRef<() => void>(() => { });

  // Clear any existing timer
  const clearGameTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Get current theme based on level
  const getCurrentTheme = useCallback((currentLevel: number) => {
    return THEME_COLORS[Math.floor((currentLevel - 1) / MILESTONE_INTERVALS.COLOR_CHANGE) % THEME_COLORS.length];
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
      const speedMult = 1 + secondsRemaining * SCORING.SPEED_BONUS_FACTOR;

      // Flawless multiplier: BASE_MULTIPLIER ** currentStreak
      const flawlessMult = Math.pow(SCORING.BASE_MULTIPLIER, streak);

      // Calculate round score
      let roundScore = Math.floor(basePts * speedMult * flawlessMult);

      // Jackpot round: bonus points on milestone rounds
      if (round % MILESTONE_INTERVALS.JACKPOT_BONUS === 0) {
        roundScore += SCORING.JACKPOT_BONUS;
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

    // Ensure score is not negative at game over
    setTotalScore(prevScore => Math.max(prevScore, 0));

    // With infinite levels, we no longer have a "completion" condition
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
        if (prev <= 0) {
          clearGameTimer();
          // Call loseLife via the reference to avoid circular dependency
          if (typeof loseLifeRef.current === 'function') {
            loseLifeRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearGameTimer]);

  // Update function reference
  startInputPhaseRef.current = startInputPhase;

  // Generate code for the current level
  const generateLevelCode = useCallback((level: number) => {
    // Get fresh random symbols for this level
    const availableSymbols = getSymbolPack(level);

    // Get symbol count range for current level
    const [minCount, maxCount] = getSymbolCountRange(level);

    // Choose a random symbol count within the range for this level
    const symbolCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

    // Generate a code with the determined number of symbols
    // Note: We're overriding the default code length calculation here
    const newCode = secureRandomSample(availableSymbols, symbolCount);

    return { newCode, availableSymbols };
  }, []);

  // Update startSameLevel function
  const restartSameLevel = useCallback((): void => {
    // Generate fresh symbols for the same level
    const { newCode, availableSymbols } = generateLevelCode(level);
    setCode(newCode);

    // Create a new grid ensuring all code symbols are included
    const newGridSymbols = createSymbolGrid(level, newCode, availableSymbols);

    // Verify all code symbols are in the grid (safety check)
    if (!verifyGrid(newGridSymbols, newCode)) {
      logger.error("Grid verification failed - regenerating");
      // If verification fails, try again with a more direct approach
      const retryGrid = [...newCode]; // Start with the code symbols

      // Fill the rest with random symbols from the available set
      while (retryGrid.length < SYMBOL_CONFIG.GRID_SIZE) {
        const randomSymbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
        retryGrid.push(randomSymbol);
      }

      // Shuffle the grid
      setGridSymbols(retryGrid.sort(() => Math.random() - 0.5));
    } else {
      setGridSymbols(newGridSymbols);
    }

    // Preload the symbols we're about to use
    const symbolsToPreload = [...new Set([...newCode, ...newGridSymbols])];
    preloadSpecificSymbols(symbolsToPreload);

    // Reset user input and show the code
    setUserInput([]);
    setGameState('showCode');

    // Get flash time for current level
    const flashTimeForLevel = getFlashTime(level);

    // Show the code for the calculated flash time (in milliseconds)
    setTimeout(() => {
      // Use the function reference
      if (typeof startInputPhaseRef.current === 'function') {
        startInputPhaseRef.current();
      }
    }, flashTimeForLevel * 1000);
  }, [level, generateLevelCode]);

  // Update function reference
  restartSameLevelRef.current = restartSameLevel;

  // Lose a life handler - define before any functions that use it
  const loseLife = useCallback(() => {
    clearGameTimer(); // Clear any existing timer first

    // Reset streak when losing a life
    setCurrentStreak(0);
    setShowWrongTaps(true);

    setLives((prevLives) => {
      // Decrement lives but never below 0
      const newLives = Math.max(prevLives - 1, 0);

      if (prevLives <= 0) {

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

  // Update function reference for loseLife
  loseLifeRef.current = loseLife;

  // Calculate next milestone level
  const getNextMilestone = useCallback((currentLevel: number) => {
    const nextColor = Math.ceil((currentLevel + 1) / MILESTONE_INTERVALS.COLOR_CHANGE) * MILESTONE_INTERVALS.COLOR_CHANGE;
    const nextPack = Math.ceil((currentLevel + 1) / MILESTONE_INTERVALS.SYMBOL_PACK_CHANGE) * MILESTONE_INTERVALS.SYMBOL_PACK_CHANGE;
    return Math.min(nextColor, nextPack);
  }, []);

  // Initialize game launch hook
  const { launchRun, Overlay } = useGameLaunch({
    onLaunchComplete: () => {
      // Start the first round after countdown
      const initialLevel = 1;

      // Get random symbols for the first level
      const { newCode, availableSymbols } = generateLevelCode(initialLevel);
      setCode(newCode);

      // Reset game state
      setUserInput([]);
      setLevel(initialLevel);

      // Generate grid symbols with strategic distribution
      const newGridSymbols = createSymbolGrid(initialLevel, newCode, availableSymbols);

      // Verify and set grid symbols
      if (!verifyGrid(newGridSymbols, newCode)) {
        logger.error("Grid verification failed on initial level - using fallback");
        // Fallback grid creation to ensure code symbols are included
        const fallbackGrid = [...newCode];
        while (fallbackGrid.length < SYMBOL_CONFIG.GRID_SIZE) {
          fallbackGrid.push(availableSymbols[Math.floor(Math.random() * availableSymbols.length)]);
        }
        setGridSymbols(fallbackGrid.sort(() => Math.random() - 0.5));
      } else {
        setGridSymbols(newGridSymbols);
      }

      // Preload symbols for smoother gameplay
      const symbolsToPreload = [...new Set([...newCode, ...newGridSymbols])];
      preloadSpecificSymbols(symbolsToPreload);

      // Start the game
      setGameState('showCode');
      setShowGameOverModal(false);
      setLives(STARTING_LIVES);
      setTimeLeft(MAX_ROUND_TIME);
      setShowStartScreen(false);

      // Reset score system
      setTotalScore(0);
      setCurrentStreak(0);
      setGems(0);
      setShowWrongTaps(false);

      // Get flash time for initial level
      const flashTimeForLevel = getFlashTime(initialLevel);

      // Show the code for the calculated flash time (in milliseconds)
      setTimeout(() => {
        startInputPhase();
      }, flashTimeForLevel * 1000);
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

      // Generate level code
      const { newCode, availableSymbols } = generateLevelCode(newLevel);
      setCode(newCode);
      setUserInput([]);
      setLevel(newLevel);

      // Generate a grid with strategic symbol distribution
      const newGridSymbols = createSymbolGrid(newLevel, newCode, availableSymbols);

      // Verify and set grid symbols
      if (!verifyGrid(newGridSymbols, newCode)) {
        logger.error(`Grid verification failed on level ${newLevel} - using fallback`);
        // Fallback grid creation to ensure code symbols are included
        const fallbackGrid = [...newCode];
        while (fallbackGrid.length < SYMBOL_CONFIG.GRID_SIZE) {
          fallbackGrid.push(availableSymbols[Math.floor(Math.random() * availableSymbols.length)]);
        }
        setGridSymbols(fallbackGrid.sort(() => Math.random() - 0.5));
      } else {
        setGridSymbols(newGridSymbols);
      }

      // Preload symbols for smoother gameplay
      const symbolsToPreload = [...new Set([...newCode, ...newGridSymbols])];
      preloadSpecificSymbols(symbolsToPreload);

      // Show the code
      setGameState('showCode');
      setTimeLeft(MAX_ROUND_TIME);

      // Get flash time for the new level
      const flashTimeForLevel = getFlashTime(newLevel);

      // Show the code for the calculated flash time (in milliseconds)
      setTimeout(() => {
        startInputPhase();
      }, flashTimeForLevel * 1000);
    },
    [
      clearGameTimer,
      startInputPhase,
      generateLevelCode
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
    // With infinite levels, we'll focus on level achievement rather than completion
    const text = `I just scored ${totalScore} points on Level ${level} of Dhyanam!\nThink you can beat me? Play → https://clash-of-cipher.lovable.app/`;

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
    setLives(STARTING_LIVES);
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
    currentSymbolPack: getSymbolPack(level),
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
