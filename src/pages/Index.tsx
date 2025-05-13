import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { getPlayerName, savePlayerName } from '../utils/deviceStorage';
import IntroScreen from '../components/IntroScreen';
import GuideScreen from '../components/GuideScreen';
import GameGrid from '../components/GameGrid';
import GameStatus from '../components/GameStatus';
import GameOverModal from '../components/GameOverModal';
import AudioControls from '../components/AudioControls';
import { Button } from '../components/ui/button';
import { HelpCircle } from 'lucide-react';
import AudioInitializer from '../components/AudioInitializer';
import SoundEffects from '../components/SoundEffects';
import ThemeManager from '../components/ThemeManager';
import PlayerNameDialog from '../components/PlayerNameDialog';
import Leaderboard from '../components/Leaderboard';
import LifeWarning from '../components/LifeWarning';
import HelpButton from '../components/HelpButton';

const Index = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
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

  // Theme classes for buttons - update to prefer amber as the default
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
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{
        background: 'linear-gradient(to bottom, #1a0d05, #0e0817)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Theme Manager (handles body background) */}
      <ThemeManager currentTheme={currentTheme} />

      {/* Sound Effects */}
      <SoundEffects
        gameState={gameState}
        isPlayerWinner={isPlayerWinner}
      />

      <div className="w-full max-w-md relative">
        {/* Header section with title and controls */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-bold text-center text-amber-400">🧘 Dhyanam</h1>
          <div className="flex items-center space-x-2">
            <AudioControls />
            <Leaderboard personalBest={personalBest} />
            <HelpButton onClick={() => setShowGuide(true)} />
          </div>
        </div>

        {/* Decorative horizontal line */}
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-600/70 to-transparent mb-4"></div>

        {/* Life Warning */}
        <LifeWarning
          lives={lives}
          gameState={gameState}
          isPlayerWinner={isPlayerWinner}
        />

        {/* Game Status */}
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
          onOpenGuide={() => setShowGuide(true)}
          playerName={getPlayerName()}
        />

        {/* Game Grid */}
        <AudioInitializer onSymbolClick={handleSymbolClick}>
          <GameGrid
            onButtonClick={(symbol) => { }} // This prop will be overridden by AudioInitializer
            gameState={gameState}
            code={code}
            userInput={userInput}
            isPlayerWinner={isPlayerWinner}
            currentSymbolPack={currentSymbolPack}
            gridSymbols={gridSymbols}
            showWrongTaps={showWrongTaps}
          />
        </AudioInitializer>

        {/* Start Game Button */}
        {gameState === 'idle' && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={startGame}
              className="w-full max-w-md py-4 font-bold text-xl rounded-xl transition-transform hover:scale-105 focus:outline-none"
              style={{
                backgroundColor: '#69310f',
                color: '#ffbb24',
                border: '4px solid #873b11',
                borderRadius: '16px',
                padding: '12px 20px',
                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                fontWeight: '700',
                letterSpacing: '0.05em',
                boxShadow: '0 0 25px rgba(105, 49, 15, 0.5)',
                textTransform: 'uppercase',
                width: 'clamp(240px, 80vw, 320px)',
                height: '54px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              BEGIN YOUR TAPASYA
            </Button>
          </div>
        )}

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
