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

  // Theme classes for buttons
  const themeClasses = {
    'bg-amber-500': 'bg-amber-600 hover:bg-amber-700',
    'bg-emerald-500': 'bg-emerald-600 hover:bg-emerald-700',
    'bg-sky-500': 'bg-sky-600 hover:bg-sky-700',
    'bg-fuchsia-500': 'bg-fuchsia-600 hover:bg-fuchsia-700',
    'bg-rose-500': 'bg-rose-600 hover:bg-rose-700',
  }[currentTheme] || 'bg-indigo-600 hover:bg-indigo-700';

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
    savePlayerName(name);
    setShowPlayerNameDialog(false);
    if (gameState === 'idle') {
      startGame();
    }
  };

  // Handle intro screen start game
  const handleIntroStartGame = () => {
    dismissStartScreen();
    const playerName = getPlayerName();
    if (!playerName) {
      setShowPlayerNameDialog(true);
    } else {
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
      </>
    );
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
            <AudioControls />
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
          onOpenGuide={() => setShowGuide(true)}
          playerName={getPlayerName()}
        />

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

        {gameState === 'idle' && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={startGame}
              className={`${themeClasses} text-lg px-8 py-6`}
            >
              Start Game
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
