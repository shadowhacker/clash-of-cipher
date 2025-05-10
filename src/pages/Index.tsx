
import React, { useState, useEffect } from 'react';
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
import PlayerNameDialog from '../components/PlayerNameDialog';
import { useGame } from '../hooks/useGame';
import { HelpCircle } from 'lucide-react';
import { getPlayerName, savePlayerName, getDeviceId } from '../utils/deviceStorage';

const Index = () => {
  const [showGuide, setShowGuide] = React.useState(false);
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);
  const [showPlayerNameDialog, setShowPlayerNameDialog] = React.useState(false);
  
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
    // New scoring system
    totalScore,
    currentStreak,
    showWrongTaps
  } = useGame();

  // Check for existing player name whenever the component mounts
  useEffect(() => {
    const playerName = getPlayerName();
    if (!playerName) {
      // Only show dialog if not on start screen (to avoid two modals)
      if (!showStartScreen) {
        setShowPlayerNameDialog(true);
      }
    }
  }, []);

  // Handle player name submission
  const handlePlayerNameSubmit = (name: string) => {
    savePlayerName(name);
    setShowPlayerNameDialog(false);
    if (gameState === 'idle') {
      startGame();
    }
  };

  // Handle start screen dismissal
  const handleDismissStartScreen = () => {
    dismissStartScreen();
    const playerName = getPlayerName();
    if (!playerName) {
      setShowPlayerNameDialog(true);
    } else {
      startGame();
    }
  };

  // Handle game over modal close
  const handleGameOverClose = () => {
    resetGame();
  };

  if (showStartScreen) {
    return <StartScreen onStart={handleDismissStartScreen} />;
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
      
      {/* Player Name Dialog */}
      <PlayerNameDialog 
        open={showPlayerNameDialog} 
        onSubmit={handlePlayerNameSubmit}
        onClose={() => {
          // If they dismiss without entering a name, we'll show it again later
          setShowPlayerNameDialog(false);
        }}
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
          totalScore={totalScore}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
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
            showWrongTaps={showWrongTaps}
          />
        </AudioInitializer>
        
        <GameOverModal
          level={level}
          personalBest={personalBest}
          open={showGameOverModal}
          onRestart={startGame}
          onShare={shareScore}
          totalScore={totalScore}
          onClose={handleGameOverClose}
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
