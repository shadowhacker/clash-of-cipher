
import { useState, useEffect, useCallback, useRef } from 'react';

// Array of symbols available for the game
const SYMBOLS = ['▲', '●', '◆', '★', '☆', '■', '✦', '✿'];

// Game states
type GameState = 'idle' | 'showCode' | 'input' | 'result';

// Hook for managing game state
export const useGame = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>('idle');
  const [round, setRound] = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [botWins, setPlayerLosses] = useState(0);
  const [code, setCode] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [isPlayerWinner, setIsPlayerWinner] = useState<boolean | null>(null);
  
  // AI state
  const [aiInput, setAiInput] = useState<string[]>([]);
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiSymbolIndexRef = useRef<number>(0);
  
  // Generate a random code of 3 symbols
  const generateCode = useCallback(() => {
    const newCode: string[] = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
      newCode.push(SYMBOLS[randomIndex]);
    }
    return newCode;
  }, []);
  
  // Clear AI timers
  const clearAiTimers = useCallback(() => {
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
  }, []);

  // Start AI turns
  const startAiTurn = useCallback(() => {
    if (gameState !== 'input') return;
    
    setAiInput([]);
    aiSymbolIndexRef.current = 0;
    
    const simulateAiTap = () => {
      if (gameState !== 'input' || aiSymbolIndexRef.current >= 3) return;
      
      // Get random grid symbol (simulating AI tapping a random symbol)
      const gridSymbols = getRandomSymbols();
      const randomSymbol = gridSymbols[Math.floor(Math.random() * gridSymbols.length)];
      
      // Update AI input
      setAiInput(prev => [...prev, randomSymbol]);
      aiSymbolIndexRef.current += 1;
      
      // Continue if not done
      if (aiSymbolIndexRef.current < 3) {
        const randomDelay = Math.floor(Math.random() * 201) + 200; // 200-400ms
        aiTimerRef.current = setTimeout(simulateAiTap, randomDelay);
      }
    };
    
    // Start AI after a short delay
    aiTimerRef.current = setTimeout(simulateAiTap, 500);
  }, [gameState]);
  
  // Function to randomly select symbols for the grid
  const getRandomSymbols = () => {
    const result: string[] = [];
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
      result.push(SYMBOLS[randomIndex]);
    }
    return result;
  };

  // Start a new game
  const startGame = useCallback(() => {
    clearAiTimers();
    const newCode = generateCode();
    setCode(newCode);
    setUserInput([]);
    setAiInput([]);
    setGameState('showCode');
    
    // Show the code for 800ms
    setTimeout(() => {
      setGameState('input');
      startAiTurn();
    }, 800);
  }, [generateCode, clearAiTimers, startAiTurn]);

  // Handle user input
  const handleSymbolClick = useCallback((symbol: string) => {
    if (gameState !== 'input') return;
    
    const newUserInput = [...userInput, symbol];
    setUserInput(newUserInput);
    
    // If user has selected 3 symbols, compare with code
    if (newUserInput.length === 3) {
      clearAiTimers();
      
      // Calculate correct symbols for player and AI
      const playerCorrect = newUserInput.filter((sym, i) => sym === code[i]).length;
      const aiCorrect = aiInput.filter((sym, i) => sym === code[i]).length;
      
      // Determine winner
      if (playerCorrect > aiCorrect) {
        setPlayerWins(prev => prev + 1);
        setIsPlayerWinner(true);
      } else if (aiCorrect > playerCorrect) {
        setPlayerLosses(prev => prev + 1);
        setIsPlayerWinner(false);
      } else {
        // It's a tie, no one gets points
        setIsPlayerWinner(null);
      }
      
      setGameState('result');
      
      // Auto advance after 1 second
      setTimeout(() => {
        const nextRound = round + 1;
        const gameEnded = playerWins >= 5 || botWins >= 5;
        
        if (gameEnded) {
          setGameState('idle');
          setRound(1);
          setPlayerWins(0);
          setPlayerLosses(0);
        } else {
          setRound(nextRound);
          startGame();
        }
      }, 1000);
    }
  }, [gameState, userInput, aiInput, code, round, playerWins, botWins, startGame, clearAiTimers]);

  // Reset the game
  const resetGame = useCallback(() => {
    clearAiTimers();
    setGameState('idle');
    setRound(1);
    setPlayerWins(0);
    setPlayerLosses(0);
    setCode([]);
    setUserInput([]);
    setAiInput([]);
    setIsPlayerWinner(null);
  }, [clearAiTimers]);

  // Cleanup effect
  useEffect(() => {
    return () => clearAiTimers();
  }, [clearAiTimers]);

  return {
    gameState,
    round,
    playerWins,
    botWins,
    code,
    userInput,
    aiInput,
    isPlayerWinner,
    startGame,
    handleSymbolClick,
    resetGame,
    totalRounds: 11
  };
};
