
import { useState, useEffect, useCallback, useRef } from 'react';

// Array of all available symbols
const MASTER_SYMBOLS = ['▲', '●', '◆', '★', '☆', '■', '✦', '✿', '♣', '♥', '☀', '☂'];

// Game states
type GameState = 'idle' | 'showCode' | 'input' | 'result';

// Color themes for different level milestones
const THEMES = ['bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-fuchsia-500', 'bg-rose-500'];

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
  const [lives, setLives] = useState(2); // Two lives
  const [timeLeft, setTimeLeft] = useState(10);
  const [gridSymbols, setGridSymbols] = useState<string[]>([]);
  const [progressPct, setProgressPct] = useState(10); // Progress percentage (10-100)
  const [showStartScreen, setShowStartScreen] = useState(true);
  
  // Timer reference
  const timerRef = useRef<number | null>(null);
  // Flag to track if first input received
  const firstInputReceived = useRef(false);
  
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
  
  // Clear any existing timer
  const clearGameTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  // Start the countdown timer
  const startGameTimer = useCallback(() => {
    clearGameTimer();
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up
          clearGameTimer();
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);
  
  // Calculate next milestone level
  const getNextMilestone = useCallback((currentLevel: number) => {
    const nextColor = Math.ceil((currentLevel + 1) / 10) * 10;
    const nextPack = Math.ceil((currentLevel + 1) / 7) * 7;
    return Math.min(nextColor, nextPack);
  }, []);
  
  // Lose a life with proper cap at 0
  const loseLife = useCallback(() => {
    clearGameTimer(); // Clear any existing timer first
    
    setLives(prev => {
      const newLives = Math.max(prev - 1, 0);
      if (newLives === 0) {
        gameOver();
      }
      return newLives;
    });
    
    // Add a pause to make life loss more noticeable
    setGameState('result');
    setIsPlayerWinner(false);
    setTimeLeft(10); // Reset timer
    
    setTimeout(() => {
      if (lives > 1) { // Only restart if we still have lives left
        restartSameLevel();
      }
    }, 800);
  }, [lives]);
  
  // Handle timeout
  const handleTimeout = useCallback(() => {
    loseLife();
  }, [loseLife]);
  
  // Restart the same level (on wrong input or timeout)
  const restartSameLevel = useCallback(() => {
    setUserInput([]);
    firstInputReceived.current = false; // Reset first input flag
    setGameState('showCode');
    
    setTimeout(() => {
      setGameState('input');
    }, 1000);
  }, []);
  
  // Game over function
  const gameOver = useCallback(() => {
    clearGameTimer();
    setIsPlayerWinner(false);
    setGameState('result');
    updatePersonalBest(level);
    
    setTimeout(() => {
      setShowGameOverModal(true);
    }, 1000);
  }, [level, clearGameTimer]);
  
  // Generate a grid ensuring all code symbols are included
  const generateGrid = useCallback((symbolPack: string[], codeSequence: string[]) => {
    // Start with a random grid from the symbol pack
    const result: string[] = Array.from({ length: 16 }, () => {
      const randomIndex = Math.floor(Math.random() * symbolPack.length);
      return symbolPack[randomIndex];
    });
    
    // Make sure all code symbols exist in the grid
    codeSequence.forEach(symbol => {
      // Check if symbol is already in the grid
      if (!result.includes(symbol)) {
        // Replace a random cell with this symbol
        const randomCellIndex = Math.floor(Math.random() * result.length);
        result[randomCellIndex] = symbol;
      }
    });
    
    return result;
  }, []);
  
  // Generate a random code of symbols based on current level
  const generateCode = useCallback((currentLevel: number) => {
    const currentPack = getCurrentSymbolPack(currentLevel);
    const codeLength = getCodeLength(currentLevel);
    
    return Array.from({ length: codeLength }, () => {
      const randomIndex = Math.floor(Math.random() * currentPack.length);
      return currentPack[randomIndex];
    });
  }, [getCurrentSymbolPack, getCodeLength]);
  
  // Update personal best if needed
  const updatePersonalBest = useCallback((currentLevel: number) => {
    if (currentLevel - 1 > personalBest) {
      setPersonalBest(currentLevel - 1);
      localStorage.setItem('cipher-clash-best', (currentLevel - 1).toString());
    }
  }, [personalBest]);

  // Start a new game
  const startGame = useCallback(() => {
    clearGameTimer();
    const initialLevel = 1;
    const newCode = generateCode(initialLevel);
    const currentPack = getCurrentSymbolPack(initialLevel);
    setCode(newCode);
    setUserInput([]);
    setLevel(initialLevel);
    setGameState('showCode');
    setShowGameOverModal(false);
    setLives(2); // Reset lives only on fresh game
    setTimeLeft(10);
    setProgressPct(10); // Reset progress to 10%
    setGridSymbols(generateGrid(currentPack, newCode));
    firstInputReceived.current = false;
    setShowStartScreen(false);
    
    // Show the code for 1000ms
    setTimeout(() => {
      setGameState('input');
    }, 1000);
  }, [generateCode, getCurrentSymbolPack, generateGrid, clearGameTimer]);

  // Start next level
  const startNextLevel = useCallback((newLevel: number) => {
    clearGameTimer();
    const newCode = generateCode(newLevel);
    const currentPack = getCurrentSymbolPack(newLevel);
    setCode(newCode);
    setUserInput([]);
    setLevel(newLevel);
    setGameState('showCode');
    setTimeLeft(10);
    firstInputReceived.current = false;
    
    // Calculate progress percentage based on level (resets every 10 levels)
    const newProgressPct = ((newLevel - 1) % 10 + 1) * 10;
    setProgressPct(newProgressPct);
    
    // Generate a new grid for this level, ensuring all code symbols are included
    setGridSymbols(generateGrid(currentPack, newCode));
    
    // Show the code for 1000ms
    setTimeout(() => {
      setGameState('input');
    }, 1000);
  }, [generateCode, getCurrentSymbolPack, generateGrid, clearGameTimer]);

  // Handle user input
  const handleSymbolClick = useCallback((symbol: string) => {
    if (gameState !== 'input') return;
    
    // Start timer on first input if not already running
    if (!firstInputReceived.current) {
      firstInputReceived.current = true;
      startGameTimer();
      
      // Ensure audio can play on iOS
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContext.resume().catch(e => console.error("Audio context resume error:", e));
      } catch (err) {
        console.error("Audio context creation error:", err);
      }
    }
    
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
        updatePersonalBest(level + 1);
        
        // Show success result briefly
        setGameState('result');
        
        // Auto advance to next level after 1 second
        setTimeout(() => {
          const nextLevel = level + 1;
          startNextLevel(nextLevel);
        }, 1000);
      } else {
        // User got it wrong
        loseLife();
      }
    }
  }, [gameState, userInput, code, level, loseLife, updatePersonalBest, startNextLevel, clearGameTimer, startGameTimer]);

  // Copy "share my best" text to clipboard
  const shareScore = useCallback(() => {
    const text = `I reached Level ${personalBest} in Cipher Clash! Can you beat me?`;
    navigator.clipboard.writeText(text);
    return text;
  }, [personalBest]);

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
    setTimeLeft(10);
  }, [clearGameTimer]);
  
  // Dismiss start screen
  const dismissStartScreen = useCallback(() => {
    setShowStartScreen(false);
    startGame();
  }, [startGame]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      clearGameTimer();
    };
  }, [clearGameTimer]);

  // Debug functions for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore - intentionally exposing for testing
      window.debugSkipTo = (targetLevel: number) => {
        setLevel(targetLevel);
        startNextLevel(targetLevel);
      };
      
      // @ts-ignore - intentionally exposing for testing
      window.debugSetLevel = (targetLevel: number) => {
        setLevel(targetLevel);
        startNextLevel(targetLevel);
      };
    }
  }, [startNextLevel]);

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
    progressPct,
    startGame,
    handleSymbolClick,
    resetGame,
    shareScore,
    showStartScreen,
    dismissStartScreen,
    nextMilestone: getNextMilestone(level),
    setTimeLeft, // Expose setTimeLeft for timer management
  };
};
