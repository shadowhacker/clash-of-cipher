
import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { getPlayerName, savePlayerName } from '../utils/deviceStorage';
import IntroScreen from '../components/IntroScreen';
import GuideScreen from '../components/GuideScreen';
import GameOverModal from '../components/GameOverModal';
import AudioControls from '../components/AudioControls';
import AudioInitializer from '../components/AudioInitializer';
import SoundEffects from '../components/SoundEffects';
import ThemeManager from '../components/ThemeManager';
import PlayerNameDialog from '../components/PlayerNameDialog';
import Leaderboard from '../components/Leaderboard';
import LifeWarning from '../components/LifeWarning';
import HeaderControls from '../components/HeaderControls';
import GameContainer from '../components/GameContainer';
import { useGameLayout } from '../hooks/useGameLayout';

const Index = () => {
  // State for UI management
  const [showGuide, setShowGuide] = useState(false);
  const [showPlayerNameDialog, setShowPlayerNameDialog] = useState(false);
  const [isFirstTimePlay, setIsFirstTimePlay] = useState(() => {
    return !localStorage.getItem('hasSeenGuide');
  });

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
    startGame,
    handleSymbolClick,
    resetGame,
    shareScore,
    showStartScreen,
    dismissStartScreen,
    nextMilestone,
    totalScore,
    currentStreak,
    showWrongTaps,
    Overlay
  } = useGame();

  // Theme classes for buttons
  const themeClasses = {
    'bg-amber-500': 'bg-amber-600 hover:bg-amber-700',
    'bg-emerald-500': 'bg-emerald-600 hover:bg-emerald-700',
    'bg-sky-500': 'bg-sky-600 hover:bg-sky-700',
    'bg-fuchsia-500': 'bg-fuchsia-600 hover:bg-fuchsia-700',
    'bg-rose-500': 'bg-rose-600 hover:bg-rose-700',
  }[currentTheme] || 'bg-amber-600 hover:bg-amber-700';

  // Check for existing player name whenever the component mounts
  useEffect(() => {
    const playerName = getPlayerName();
    if (!playerName) {
      // Only show dialog if not on start screen (to avoid two modals)
      if (!showStartScreen) {
        setShowPlayerNameDialog(true);
      }
    }
  }, [showStartScreen]);

  // Handle player name submission
  const handlePlayerNameSubmit = (name: string) => {
    console.log('Name submitted:', name);
    savePlayerName(name);
    setShowPlayerNameDialog(false);

    // If we're on the intro screen, proceed with dismissing it and starting the game
    if (showStartScreen) {
      console.log('On start screen, dismissing and starting game');
      dismissStartScreen();
      startGame();
    } else if (gameState === 'idle') {
      console.log('In idle state, starting game');
      // Otherwise, just start the game if we're in idle state
      startGame();
    }
  };

  // Handle intro screen start game
  const handleIntroStartGame = () => {
    const playerName = getPlayerName();
    if (!playerName) {
      // We need to get the player name first
      setShowPlayerNameDialog(true);
    } else {
      // Already have a name, proceed directly
      dismissStartScreen();
      startGame();
    }
  };

  // Handle intro screen show guide
  const handleIntroShowGuide = () => {
    setShowGuide(true);
  };

  // Handle guide screen close for first-time users
  const handleGuideClose = () => {
    setShowGuide(false);
    setIsFirstTimePlay(false);
  };

  // Handle game over modal close
  const handleGameOverClose = () => {
    resetGame();
  };

  if (showStartScreen) {
    return (
      <>
        <IntroScreen
          onStartGame={handleIntroStartGame}
          onShowGuide={handleIntroShowGuide}
        />
        <GuideScreen
          open={showGuide}
          onClose={handleGuideClose}
          isFirstTime={isFirstTimePlay}
        />
        <PlayerNameDialog
          open={showPlayerNameDialog}
          onSubmit={handlePlayerNameSubmit}
          onClose={() => {
            // Just hide the dialog if they dismiss without entering a name
            setShowPlayerNameDialog(false);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-amber-950 flex flex-col items-center justify-center p-4">
      {/* Theme Manager (handles body background) */}
      <ThemeManager currentTheme={currentTheme} />

      {/* Sound Effects */}
      <SoundEffects
        gameState={gameState}
        isPlayerWinner={isPlayerWinner}
      />

      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center text-amber-500">🧘 Dhyanam</h1>
          <HeaderControls 
            onOpenGuide={() => setShowGuide(true)}
            personalBest={personalBest}
          />
        </div>

        {/* Life Warning */}
        <LifeWarning
          lives={lives}
          gameState={gameState}
          isPlayerWinner={isPlayerWinner}
        />

        <GameContainer
          gameState={gameState}
          level={level}
          personalBest={personalBest}
          code={code}
          userInput={userInput}
          isPlayerWinner={isPlayerWinner}
          showGameOverModal={showGameOverModal}
          lives={lives}
          timeLeft={timeLeft}
          currentSymbolPack={currentSymbolPack}
          currentTheme={currentTheme}
          gridSymbols={gridSymbols}
          themeClasses={themeClasses}
          handleSymbolClick={handleSymbolClick}
          startGame={startGame}
          resetGame={resetGame}
          nextMilestone={nextMilestone}
          totalScore={totalScore}
          currentStreak={currentStreak}
          showWrongTaps={showWrongTaps}
          playerName={getPlayerName()}
          onOpenGuide={() => setShowGuide(true)}
        />

        <GameOverModal
          level={level}
          personalBest={personalBest}
          open={showGameOverModal}
          onRestart={startGame}
          onShare={shareScore}
          totalScore={totalScore}
          onClose={handleGameOverClose}
        />

        <GuideScreen
          open={showGuide}
          onClose={handleGuideClose}
          isFirstTime={isFirstTimePlay}
        />

        {/* Game Launch Overlay */}
        <Overlay />
      </div>
    </div>
  );
};

export default Index;
