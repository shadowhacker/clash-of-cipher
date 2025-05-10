import React from 'react';
import GameGrid from '../components/GameGrid';
import GameStatus from '../components/GameStatus';
import GameOverModal from '../components/GameOverModal';
import HowToPlayGuide from '../components/HowToPlayGuide';
import StartScreen from '../components/StartScreen';
import SoundEffects from '../components/SoundEffects';
import ThemeManager from '../components/ThemeManager';
import LifeWarning from '../components/LifeWarning';
import AudioInitializer from '../components/AudioInitializer';
import Leaderboard from '../components/Leaderboard';
import { useGame } from '../hooks/useGame';
import { HelpCircle } from 'lucide-react';

const Index = () => {
  const [showGuide, setShowGuide] = React.useState(false);
  
  const { 
    gameState,
    level,
    personalBest,
    code,
    userInput,
    isPlayerWinner,
    showGameOverModal,
    lives,
    timeLeft,
    currentSymbolPack,
    currentTheme,
    gridSymbols,
    progressPct,
    startGame,
    handleSymbolClick,
    resetGame,
    shareScore,
    showStartScreen,
    dismissStartScreen,
    nextMilestone,
  } = useGame();

  if (showStartScreen) {
    return <StartScreen onStart={dismissStartScreen} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Theme Manager (handles body background) */}
      <ThemeManager currentTheme={currentTheme} />
      
      {/* Sound Effects */}
      <SoundEffects 
        gameState={gameState} 
        isPlayerWinner={isPlayerWinner} 
      />
      
      <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-center text-indigo-800">🔮 Cipher Clash</h1>
            <div className="flex items-center space-x-2">
              <Leaderboard personalBest={personalBest} />
              <button 
                onClick={() => setShowGuide(true)}
                className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
                aria-label="How to Play"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

        {/* Life Warning */}
        <LifeWarning 
          lives={lives} 
          gameState={gameState} 
          isPlayerWinner={isPlayerWinner} 
        />

        <GameStatus 
          gameState={gameState}
          level={level}
          personalBest={personalBest}
          lives={lives}
          timeLeft={timeLeft}
          startGame={startGame}
          resetGame={resetGame}
          currentTheme={currentTheme}
          nextMilestone={nextMilestone}
        />
        
        <AudioInitializer onSymbolClick={handleSymbolClick}>
          <GameGrid 
            onButtonClick={(symbol) => {}} // This prop will be overridden by AudioInitializer
            gameState={gameState}
            code={code}
            userInput={userInput}
            isPlayerWinner={isPlayerWinner}
            currentSymbolPack={currentSymbolPack}
            gridSymbols={gridSymbols}
            progressPct={progressPct}
          />
        </AudioInitializer>
        
        <GameOverModal
          level={level}
          personalBest={personalBest}
          open={showGameOverModal}
          onRestart={startGame}
          onShare={shareScore}
        />
        
        <HowToPlayGuide 
          open={showGuide} 
          onClose={() => setShowGuide(false)} 
        />
      </div>
    </div>
  );
};

export default Index;
