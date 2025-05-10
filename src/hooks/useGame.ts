
import { useState, useEffect, useCallback } from 'react';

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
  const [botWins, setBotWins] = useState(0);
  const [code, setCode] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [isPlayerWinner, setIsPlayerWinner] = useState<boolean | null>(null);

  // Generate a random code of 3 symbols
  const generateCode = useCallback(() => {
    const newCode: string[] = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
      newCode.push(SYMBOLS[randomIndex]);
    }
    return newCode;
  }, []);

  // Start a new game
  const startGame = useCallback(() => {
    const newCode = generateCode();
    setCode(newCode);
    setUserInput([]);
    setGameState('showCode');
    
    // Show the code for 800ms
    setTimeout(() => {
      setGameState('input');
    }, 800);
  }, [generateCode]);

  // Handle user input
  const handleSymbolClick = useCallback((symbol: string) => {
    if (gameState !== 'input') return;
    
    const newUserInput = [...userInput, symbol];
    setUserInput(newUserInput);
    
    // If user has selected 3 symbols, compare with code
    if (newUserInput.length === 3) {
      const isMatch = newUserInput.every((sym, i) => sym === code[i]);
      
      if (isMatch) {
        setPlayerWins(prev => prev + 1);
        setIsPlayerWinner(true);
      } else {
        setBotWins(prev => prev + 1);
        setIsPlayerWinner(false);
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
          setBotWins(0);
        } else {
          setRound(nextRound);
          startGame();
        }
      }, 1000);
    }
  }, [gameState, userInput, code, round, playerWins, botWins, startGame]);

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState('idle');
    setRound(1);
    setPlayerWins(0);
    setBotWins(0);
    setCode([]);
    setUserInput([]);
    setIsPlayerWinner(null);
  }, []);

  return {
    gameState,
    round,
    playerWins,
    botWins,
    code,
    userInput,
    isPlayerWinner,
    startGame,
    handleSymbolClick,
    resetGame,
    totalRounds: 11
  };
};
