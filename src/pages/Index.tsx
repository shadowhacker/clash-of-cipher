import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../hooks/useGame';
import { getPlayerName, savePlayerName } from '../utils/deviceStorage';
import GuideScreen from '../components/GuideScreen';
import GameGrid from '../components/GameGrid';
import GameStatus from '../components/GameStatus';
import GameOverModal from '../components/GameOverModal';
import AudioControls from '../components/AudioControls';
import { Button } from '../components/ui/button';
import AudioInitializer from '../components/AudioInitializer';
import SoundEffects from '../components/SoundEffects';
import ThemeManager from '../components/ThemeManager';
import PlayerNameDialog from '../components/PlayerNameDialog';
import Leaderboard from '../components/Leaderboard';
import LifeWarning from '../components/LifeWarning';
import HelpButton from '../components/HelpButton';
import logger from '../utils/logger';
import HowToPlayGuide from '../components/HowToPlayGuide';
import StartScreen from '../components/StartScreen';

interface IndexProps {
  paused?: boolean;
}

const Index = ({ paused = false }: IndexProps) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
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
    Overlay,
    configReady
  } = useGame(paused);

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

  const handleGuideClose = useCallback(() => {
    setShowGuide(false);
    // Mark as seen on first play
    if (isFirstTimePlay) {
      localStorage.setItem('hasSeenGuide', 'true');
      setIsFirstTimePlay(false);
    }
  }, [isFirstTimePlay]);

  const handleHowToPlayClose = useCallback(() => {
    setShowHowToPlay(false);
    // Mark as seen on first play
    if (isFirstTimePlay) {
      localStorage.setItem('hasSeenGuide', 'true');
      setIsFirstTimePlay(false);
    }
  }, [isFirstTimePlay]);

  const handleShowLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
  }, []);

  const handleCloseLeaderboard = useCallback(() => {
    setShowLeaderboard(false);
  }, []);

  const handleShowGuide = useCallback(() => {
    setShowGuide(true);
  }, []);

  const handleShowHowToPlay = useCallback(() => {
    setShowHowToPlay(true);
  }, []);

  // Define handleStartGame first so it can be used in other callbacks
  const handleStartGame = useCallback(() => {
    if (showStartScreen) {
      logger.debug('On start screen, dismissing and starting game');
      dismissStartScreen();
      startGame();
      return;
    }
    if (gameState === 'idle') {
      logger.debug('In idle state, starting game');
      startGame();
    }
  }, [showStartScreen, gameState, dismissStartScreen, startGame]);

  const handlePlayerNameSubmit = useCallback((name: string) => {
    savePlayerName(name);
    setShowPlayerNameDialog(false);
    // After setting nickname, start the game
    handleStartGame();
  }, [handleStartGame]);

  // Handle start game from intro screens
  const handleIntroStartGame = useCallback(() => {
    // If player has no nickname, show nickname dialog first
    const playerName = getPlayerName();
    if (!playerName) {
      setShowPlayerNameDialog(true);
      return;
    }
    // If first time, do NOT show guide automatically, just start the game
    handleStartGame();
  }, [handleStartGame]);

  const handleIntroShowGuide = useCallback(() => {
    setShowGuide(true);
  }, []);

  if (showStartScreen) {
    return (
      <>
        <StartScreen
          onStart={handleIntroStartGame}
          onHowToPlay={handleIntroShowGuide}
        />
        <GuideScreen
          open={showGuide}
          onClose={handleGuideClose}
          isFirstTime={isFirstTimePlay}
        />
        <HowToPlayGuide
          open={showHowToPlay}
          onClose={handleHowToPlayClose}
          isFirstTime={true}
        />
        <PlayerNameDialog
          open={showPlayerNameDialog}
          onSubmit={handlePlayerNameSubmit}
          onClose={() => setShowPlayerNameDialog(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Dark overlay to ensure UI elements are readable against the background image */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>
      
      {/* Theme Manager (handles body background) */}
      <ThemeManager currentTheme={currentTheme} />

      {/* Sound Effects */}
      <SoundEffects
        gameState={gameState}
        isPlayerWinner={isPlayerWinner}
        level={level}
        totalScore={totalScore}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header section with title and controls */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-bold text-center text-amber-400" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, letterSpacing: '-0.03em' }}>🧘 Dhyanam</h1>
          <div className="flex items-center space-x-2">
            <AudioControls />
            <Leaderboard personalBest={personalBest} />
            <HelpButton onClick={() => setShowHowToPlay(true)} />
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

        {/* Context message overlay - only visible during input state */}
        <div className={`fixed left-1/2 bottom-[0%] z-30 transform -translate-x-1/2 w-full max-w-md pointer-events-none transition-opacity duration-300 ${gameState === 'input' ? 'opacity-100' : 'opacity-0'}`} aria-live="polite">
          <div className="mx-auto text-center text-amber-200 font-medium px-4 py-2 bg-amber-900/80 rounded-lg border border-amber-700/30 animate-pulse shadow-lg pointer-events-auto select-none">
            Tap the symbols in the EXACT SAME ORDER as they appeared
          </div>
        </div>

        {/* Game Grid */}
        <AudioInitializer onSymbolClick={handleSymbolClick}>
          <GameGrid
            onButtonClick={(symbol) => { }} // This prop will be overridden by AudioInitializer
            gameState={gameState}
            code={code}
            userInput={userInput}
            isPlayerWinner={isPlayerWinner}
            gridSymbols={gridSymbols}
            showWrongTaps={showWrongTaps}
            paused={paused}
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
          onClose={resetGame}
          onBackToHome={() => {
            resetGame();
            window.location.reload();
          }}
        />

        <GuideScreen
          open={showGuide}
          onClose={handleGuideClose}
          isFirstTime={isFirstTimePlay}
        />

        <HowToPlayGuide
          open={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
          isFirstTime={false}
        />

        {/* Game Launch Overlay */}
        <Overlay />
      </div>
    </div>
  );
};

export default Index;
