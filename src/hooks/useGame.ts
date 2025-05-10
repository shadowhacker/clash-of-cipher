
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
  
  // Generate a random code of symbols based on current level
  const generateCode = useCallback((currentLevel: number) => {
    const symbolPack = getCurrentSymbolPack(currentLevel);
    const newCode: string[] = [];
    
    for (let i = 0; i < currentLevel; i++) {
      const randomIndex = Math.floor(Math.random() * symbolPack.length);
      newCode.push(symbolPack[randomIndex]);
    }
    
    return newCode;
  }, [getCurrentSymbolPack]);
  
  // Update personal best if needed
  const updatePersonalBest = useCallback((currentLevel: number) => {
    if (currentLevel - 1 > personalBest) {
      setPersonalBest(currentLevel - 1);
      localStorage.setItem('cipher-clash-best', (currentLevel - 1).toString());
    }
  }, [personalBest]);

  // Start a new game
  const startGame = useCallback(() => {
    const initialLevel = 1;
    const newCode = generateCode(initialLevel);
    setCode(newCode);
    setUserInput([]);
    setLevel(initialLevel);
    setGameState('showCode');
    setShowGameOverModal(false);
    
    // Show the code for 1000ms
    setTimeout(() => {
      setGameState('input');
    }, 1000);
  }, [generateCode]);

  // Start next level
  const startNextLevel = useCallback((newLevel: number) => {
    const newCode = generateCode(newLevel);
    setCode(newCode);
    setUserInput([]);
    setLevel(newLevel);
    setGameState('showCode');
    
    // Show the code for 1000ms
    setTimeout(() => {
      setGameState('input');
    }, 1000);
  }, [generateCode]);

  // Handle user input
  const handleSymbolClick = useCallback((symbol: string) => {
    if (gameState !== 'input') return;
    
    const newUserInput = [...userInput, symbol];
    setUserInput(newUserInput);
    
    // If user has selected enough symbols, compare with code
    if (newUserInput.length === code.length) {
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
        // User got it wrong - game over
        setIsPlayerWinner(false);
        updatePersonalBest(level);
        setGameState('result');
        
        // Show game over modal after brief delay
        setTimeout(() => {
          setShowGameOverModal(true);
        }, 1000);
      }
    }
  }, [gameState, userInput, code, level, updatePersonalBest, startNextLevel]);

  // Copy "share my best" text to clipboard
  const shareScore = useCallback(() => {
    const text = `I reached Level ${personalBest} in Cipher Clash! Can you beat me?`;
    navigator.clipboard.writeText(text);
    return text;
  }, [personalBest]);

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState('idle');
    setLevel(1);
    setUserInput([]);
    setCode([]);
    setIsPlayerWinner(null);
    setShowGameOverModal(false);
  }, []);

  // Debug function to skip to a specific level (only in dev mode)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore - intentionally exposing for testing
      window.debugSkipTo = (targetLevel: number) => {
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
    currentSymbolPack: getCurrentSymbolPack(level),
    currentTheme: getCurrentTheme(level),
    startGame,
    handleSymbolClick,
    resetGame,
    shareScore,
  };
};
