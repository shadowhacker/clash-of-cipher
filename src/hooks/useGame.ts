import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useGameLaunch } from "./useGameLaunch.tsx";
import { preloadSpecificSymbols } from "../utils/symbolCacheUtils";
import {
  getSymbolPack,
  generateGrid as createSymbolGrid,
  verifyGrid,
} from "../utils/symbolManager";
import { secureRandomSample } from "../utils/randomUtils";
import {
  getMaxRoundTime,
  getStartingLives,
  getMilestoneIntervals,
  getThemeColors,
  getScoring,
  getSymbolConfig,
  getFlashTime,
  getSymbolCountRange,
  getRemoteFlashTime,
  getRemoteSymbolCountRange,
  // For backward compatibility
  MAX_ROUND_TIME,
  STARTING_LIVES,
} from "../config/gameConfig.ts";
import logger from "../utils/logger";
import { copyToClipboard } from "../utils/clipboardUtils";
import { useRemoteConfig } from "../hooks/useRemoteConfig";

// Game states
type GameState = "idle" | "showCode" | "input" | "result";

// Hook for managing game state
export const useGame = () => {
  // Remote config - loaded on the start screen before game begins
  const {
    roundLogic,
    loading: configLoading,
    error: configError,
    isInitialized,
  } = useRemoteConfig();

  // Game state
  const [gameState, setGameState] = useState<GameState>("idle");
  const [level, setLevel] = useState(1);
  const [personalBest, setPersonalBest] = useState(() => {
    const saved = localStorage.getItem("cipher-clash-best");
    return saved ? parseInt(saved) : 0;
  });
  const [code, setCode] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [isPlayerWinner, setIsPlayerWinner] = useState<boolean | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [lives, setLives] = useState(getStartingLives()); // Use getter for dynamic value
  const [timeLeft, setTimeLeft] = useState(getMaxRoundTime()); // Use getter for dynamic value
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
  const startInputPhaseRef = useRef<() => void>(() => {});
  const restartSameLevelRef = useRef<() => void>(() => {});
  const loseLifeRef = useRef<() => void>(() => {});

  // Clear any existing timer
  const clearGameTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Initialize game launch hook - only after config is loaded
  const { launchRun, Overlay } = useGameLaunch({
    onLaunchComplete: async () => {
      // Start the first round after countdown
      const initialLevel = 1;

      // Get random symbols for the first level
      const { newCode, availableSymbols } = await generateLevelCode(
        initialLevel
      );
      setCode(newCode);

      // Reset game state
      setUserInput([]);
      setLevel(initialLevel);

      // Generate grid symbols with strategic distribution
      const newGridSymbols = createSymbolGrid(
        initialLevel,
        newCode,
        availableSymbols,
        roundLogic
      );

      // Verify and set grid symbols
      if (!verifyGrid(newGridSymbols, newCode)) {
        logger.error(
          "Grid verification failed on initial level - using fallback"
        );
        // Fallback grid creation to ensure code symbols are included
        const fallbackGrid = [...newCode];
        while (fallbackGrid.length < getSymbolConfig().GRID_SIZE) {
          fallbackGrid.push(
            availableSymbols[
              Math.floor(Math.random() * availableSymbols.length)
            ]
          );
        }
        setGridSymbols(fallbackGrid.sort(() => Math.random() - 0.5));
      } else {
        setGridSymbols(newGridSymbols);
      }

      // Preload symbols for smoother gameplay
      const symbolsToPreload = [...new Set([...newCode, ...newGridSymbols])];
      preloadSpecificSymbols(symbolsToPreload);

      // Start the game
      setGameState("showCode");
      setShowGameOverModal(false);
      setLives(getStartingLives());
      setTimeLeft(getMaxRoundTime());
      setShowStartScreen(false);

      // Reset score system
      setTotalScore(0);
      setCurrentStreak(0);
      setGems(0);
      setShowWrongTaps(false);

      // Get flash time for initial level
      const flashTimeForLevel = roundLogic
        ? getRemoteFlashTime(initialLevel, roundLogic)
        : getFlashTime(initialLevel);

      // Show the code for the calculated flash time (in milliseconds)
      setTimeout(() => {
        startInputPhase();
      }, flashTimeForLevel * 1000);
    },
  });

  // Get current theme based on level
  const getCurrentTheme = useCallback((currentLevel: number) => {
    // Access theme colors from the dynamic getter
    const themeColors = getThemeColors();
    const milestones = getMilestoneIntervals();
    return themeColors[
      Math.floor((currentLevel - 1) / milestones.COLOR_CHANGE) %
        themeColors.length
    ];
  }, []);

  // Calculate round score based on new formula
  const calculateRoundScore = useCallback(
    (
      round: number,
      codeLen: number,
      secondsRemaining: number,
      streak: number
    ) => {
      // Access scoring config from the dynamic getter
      const scoring = getScoring();
      const milestones = getMilestoneIntervals();

      // Base points: (roundNumber ** 2) * codeLength
      const basePts = Math.pow(round, 2) * codeLen;

      // Speed multiplier: 1 + (secondsLeft / 10) - ranges from 1.0 to 2.0
      const speedMult = 1 + secondsRemaining * scoring.SPEED_BONUS_FACTOR;

      // Flawless multiplier: BASE_MULTIPLIER ** currentStreak
      const flawlessMult = Math.pow(scoring.BASE_MULTIPLIER, streak);

      // Calculate round score
      let roundScore = Math.floor(basePts * speedMult * flawlessMult);

      // Jackpot round: bonus points on milestone rounds
      if (round % milestones.JACKPOT_BONUS === 0) {
        roundScore += scoring.JACKPOT_BONUS;
      }

      return {
        roundScore,
        speedMult,
        flawlessMult,
      };
    },
    []
  );

  // Generate code for the current level
  const generateLevelCode = useCallback(
    async (level: number) => {
      // Get fresh random symbols for this level
      const availableSymbols = await getSymbolPack(level);

      // Check if availableSymbols is a valid array
      if (!Array.isArray(availableSymbols) || availableSymbols.length === 0) {
        console.error("Invalid symbols array:", availableSymbols);
        return { newCode: [], availableSymbols: [] };
      }

      // Get symbol count range for current level from remote config
      const [minCount, maxCount] = roundLogic
        ? getRemoteSymbolCountRange(level, roundLogic)
        : getSymbolCountRange(level);

      // Choose a random symbol count within the range for this level
      const symbolCount =
        Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

      // Generate a code with the determined number of symbols
      const newCode = secureRandomSample(availableSymbols, symbolCount);

      return { newCode, availableSymbols };
    },
    [roundLogic]
  );

  // Start input phase (renamed from flash-done callback)
  const startInputPhase = useCallback(() => {
    setGameState("input");

    // Immediately start the timer as requested
    setTimeLeft(getMaxRoundTime());
    clearGameTimer();

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearGameTimer();
          // Call loseLife via the reference to avoid circular dependency
          if (typeof loseLifeRef.current === "function") {
            loseLifeRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearGameTimer]);

  // Update startGame to use launchRun - but only if config is loaded
  const startGame = useCallback(() => {
    if (!isInitialized) {
      logger.warn("Attempted to start game before config was initialized");
      return;
    }

    clearGameTimer();
    launchRun();
  }, [clearGameTimer, launchRun, isInitialized]);

  // Expose configuration loading state to UI
  const configReady = isInitialized && !configLoading;

  // Game over function
  const gameOver = useCallback(() => {
    clearGameTimer();

    // Ensure score is not negative at game over
    setTotalScore((prevScore) => Math.max(prevScore, 0));

    // With infinite levels, we no longer have a "completion" condition
    setIsPlayerWinner(false);
    setGameState("result");

    // Update personal best if total score is higher
    if (totalScore > personalBest) {
      setPersonalBest(totalScore);
      localStorage.setItem("cipher-clash-best", totalScore.toString());
    }

    setTimeout(
      () => {
        setShowGameOverModal(true);
      },
      showWrongTaps ? 2500 : 1000
    ); // Longer delay if showing wrong taps
  }, [totalScore, personalBest, clearGameTimer, showWrongTaps]);

  // Define the restartSameLevel function before assigning it to ref
  const restartSameLevel = useCallback(async (): Promise<void> => {
    // Generate fresh symbols for the same level
    const { newCode, availableSymbols } = await generateLevelCode(level);
    setCode(newCode);

    // Create a new grid ensuring all code symbols are included
    const newGridSymbols = createSymbolGrid(
      level,
      newCode,
      availableSymbols,
      roundLogic
    );

    // Verify all code symbols are in the grid (safety check)
    if (!verifyGrid(newGridSymbols, newCode)) {
      logger.error("Grid verification failed - regenerating");
      // If verification fails, try again with a more direct approach
      const retryGrid = [...newCode]; // Start with the code symbols

      // Fill the rest with random symbols from the available set
      while (retryGrid.length < getSymbolConfig().GRID_SIZE) {
        const randomSymbol =
          availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
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
    setGameState("showCode");

    // Get flash time for current level
    const flashTimeForLevel = roundLogic
      ? getRemoteFlashTime(level, roundLogic)
      : getFlashTime(level);

    // Show the code for the calculated flash time (in milliseconds)
    setTimeout(() => {
      // Use the function reference
      if (typeof startInputPhaseRef.current === "function") {
        startInputPhaseRef.current();
      }
    }, flashTimeForLevel * 1000);
  }, [level, roundLogic, generateLevelCode]);

  // Update function reference
  startInputPhaseRef.current = startInputPhase;

  // Update function reference - This was causing the error as the function was referenced before definition
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
          if (typeof restartSameLevelRef.current === "function") {
            restartSameLevelRef.current();
          }
        }, 2500); // Show wrong taps for 2.5 seconds
      }
      return newLives;
    });

    // Add a pause to make life loss more noticeable
    setGameState("result");
    setIsPlayerWinner(false);
    setTimeLeft(getMaxRoundTime()); // Reset timer using constant
  }, [clearGameTimer, gameOver]);

  // Update function reference for loseLife
  loseLifeRef.current = loseLife;

  // Calculate next milestone level
  const getNextMilestone = useCallback((currentLevel: number) => {
    const nextColor =
      Math.ceil((currentLevel + 1) / getMilestoneIntervals().COLOR_CHANGE) *
      getMilestoneIntervals().COLOR_CHANGE;
    const nextPack =
      Math.ceil(
        (currentLevel + 1) / getMilestoneIntervals().SYMBOL_PACK_CHANGE
      ) * getMilestoneIntervals().SYMBOL_PACK_CHANGE;
    return Math.min(nextColor, nextPack);
  }, []);

  // Start next level
  const startNextLevel = useCallback(
    async (newLevel: number): Promise<void> => {
      clearGameTimer();

      // Generate level code
      const { newCode, availableSymbols } = await generateLevelCode(newLevel);
      setCode(newCode);
      setUserInput([]);
      setLevel(newLevel);

      // Generate a grid with strategic symbol distribution
      const newGridSymbols = createSymbolGrid(
        newLevel,
        newCode,
        availableSymbols,
        roundLogic
      );

      // Verify and set grid symbols
      if (!verifyGrid(newGridSymbols, newCode)) {
        logger.error(
          `Grid verification failed on level ${newLevel} - using fallback`
        );
        // Fallback grid creation to ensure code symbols are included
        const fallbackGrid = [...newCode];
        while (fallbackGrid.length < getSymbolConfig().GRID_SIZE) {
          fallbackGrid.push(
            availableSymbols[
              Math.floor(Math.random() * availableSymbols.length)
            ]
          );
        }
        setGridSymbols(fallbackGrid.sort(() => Math.random() - 0.5));
      } else {
        setGridSymbols(newGridSymbols);
      }

      // Preload symbols for smoother gameplay
      const symbolsToPreload = [...new Set([...newCode, ...newGridSymbols])];
      preloadSpecificSymbols(symbolsToPreload);

      // Show the code
      setGameState("showCode");
      setTimeLeft(getMaxRoundTime());

      // Get flash time for the new level
      const flashTimeForLevel = roundLogic
        ? getRemoteFlashTime(newLevel, roundLogic)
        : getFlashTime(newLevel);

      // Show the code for the calculated flash time (in milliseconds)
      setTimeout(() => {
        startInputPhase();
      }, flashTimeForLevel * 1000);
    },
    [roundLogic, clearGameTimer, startInputPhase, generateLevelCode]
  );

  // Handle user input - remove timer start on first input
  const handleSymbolClick = useCallback(
    (symbol: string) => {
      if (gameState !== "input") return;

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
          setGameState("result");

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
      startNextLevel,
    ]
  );

  // Copy "share my best" text to clipboard
  const shareScore = useCallback(() => {
    // With infinite levels, we'll focus on level achievement rather than completion
    const text = `I just scored ${totalScore} points on Level ${level} of Dhyanam!\nThink you can beat me? Play → https://clash-of-cipher.lovable.app/`;

    // Use the clipboard utility instead of direct navigator.clipboard
    copyToClipboard(text).catch((err) => {
      logger.error("Failed to copy score to clipboard:", err);
    });

    return text;
  }, [totalScore, level]);

  // Reset the game
  const resetGame = useCallback(() => {
    clearGameTimer();
    setGameState("idle");
    setLevel(1);
    setUserInput([]);
    setCode([]);
    setIsPlayerWinner(null);
    setShowGameOverModal(false);
    setLives(getStartingLives());
    setTimeLeft(getMaxRoundTime());
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
    Overlay,
    configReady,
  };
};
