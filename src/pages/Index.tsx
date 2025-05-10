
import React from 'react';
import GameGrid from '../components/GameGrid';
import GameStatus from '../components/GameStatus';

const Index = () => {
  const handleButtonClick = (symbol: string, index: number) => {
    console.log(`Button clicked: Symbol ${symbol}, Index ${index}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">Cipher Clash</h1>
        <GameStatus />
        <GameGrid onButtonClick={handleButtonClick} />
      </div>
    </div>
  );
};

export default Index;
