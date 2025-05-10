
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
  const [lives, setLives] = useState(2); // One extra chance
  const [timeLeft, setTimeLeft] = useState(10);
  
  // Timer reference
  const timerRef = useRef<number | null>(null);
  
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
  
  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (lives > 1) {
      setLives(prev => prev - 1);
      restartSameLevel();
    } else {
      gameOver();
    }
  }, [lives]);
  
  // Restart the same level (on wrong input or timeout)
  const restartSameLevel = useCallback(() => {
    setUserInput([]);
    setGameState('showCode');
    setTimeLeft(10);
    
    setTimeout(() => {
      setGameState('input');
      startGameTimer();
    }, 1000);
  }, [startGameTimer]);
  
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
    setCode(newCode);
    setUserInput([]);
    setLevel(initialLevel);
    setGameState('showCode');
    setShowGameOverModal(false);
    setLives(2);
    setTimeLeft(10);
    
    // Show the code for 1000ms
    setTimeout(() => {
      setGameState('input');
      startGameTimer();
    }, 1000);
  }, [generateCode, clearGameTimer, startGameTimer]);

  // Start next level
  const startNextLevel = useCallback((newLevel: number) => {
    clearGameTimer();
    const newCode = generateCode(newLevel);
    setCode(newCode);
    setUserInput([]);
    setLevel(newLevel);
    setGameState('showCode');
    setLives(2);
    setTimeLeft(10);
    
    // Show the code for 1000ms
    setTimeout(() => {
      setGameState('input');
      startGameTimer();
    }, 1000);
  }, [generateCode, clearGameTimer, startGameTimer]);

  // Handle user input
  const handleSymbolClick = useCallback((symbol: string) => {
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
        if (lives > 1) {
          setLives(prev => prev - 1);
          restartSameLevel();
        } else {
          // Game over
          gameOver();
        }
      }
    }
  }, [gameState, userInput, code, level, lives, updatePersonalBest, startNextLevel, clearGameTimer, restartSameLevel, gameOver]);

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
    startGame,
    handleSymbolClick,
    resetGame,
    shareScore,
  };
};
