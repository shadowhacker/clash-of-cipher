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
import { Button } from '../components/ui/button';
import IntroScreen from '../components/IntroScreen';
import GuideScreen from '../components/GuideScreen';
import CountdownOverlay from '../components/CountdownOverlay';
import LoadingScreen from '../components/LoadingScreen';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showGuideScreen, setShowGuideScreen] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [hasSeenGuide, setHasSeenGuide] = useState(() => !!localStorage.getItem('hasSeenGuide'));
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);
  const [showPlayerNameDialog, setShowPlayerNameDialog] = React.useState(false);
  const [isFirstTimePlay, setIsFirstTimePlay] = React.useState(() => {
    return !localStorage.getItem('cipher-clash-first-play');
  });
  const [fastest, setFastest] = useState(0);
  const [overlay, setOverlay] = useState<React.ReactNode>(null);
  
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
    showWrongTaps
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

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runCountdown = async (numbers: (number | string)[]) => {
    for (const num of numbers) {
      setOverlay(<CountdownOverlay count={num} />);
      await sleep(1000);
    }
  };

  const beginNewRunCore = () => {
    resetGame();
    startGame();
  };

  const launchRun = async () => {
    // Phase 1: short loading splash
    setOverlay(<LoadingScreen />);
    await sleep(1000);

    // Phase 2: 3-2-1-GO countdown
    await runCountdown([3, 2, 1, 'GO!']);

    // Phase 3: really start the first round
    beginNewRunCore();
    setOverlay(null);
  };

  const handleIntroStart = () => {
    setShowIntro(false);
    launchRun();
  };

  const handleShowGuide = () => {
    setShowGuideScreen(true);
  };

  const handleCloseGuide = () => {
    setShowGuideScreen(false);
    if (!hasSeenGuide) {
      localStorage.setItem('hasSeenGuide', 'true');
      setHasSeenGuide(true);
    }
  };

  const handleGuideStart = () => {
    localStorage.setItem('hasSeenGuide', 'true');
    setHasSeenGuide(true);
    setShowGuideScreen(false);
    launchRun();
  };

  // Update advanceRound to track fastest time
  const advanceRound = () => {
    const roundTime = 10 - timeLeft;
    setFastest(t => t === 0 ? roundTime : Math.min(t, roundTime));
    
    // Persist fastest time with score
    const playerId = getDeviceId();
    const name = getPlayerName();
    if (playerId && name) {
      setDoc(doc(db, 'scores', playerId), {
        name,
        bestScore: personalBest,
        fastest,
        ts: serverTimestamp()
      }, { merge: true });
    }
  };

  if (showIntro) {
    return (
      <>
        <IntroScreen 
          onStart={handleIntroStart}
          onShowGuide={handleShowGuide}
        />
        <GuideScreen 
          open={showGuideScreen} 
          onClose={handleCloseGuide} 
          isFirstTime={!hasSeenGuide}
          onStart={handleGuideStart}
        />
        {showCountdown && <CountdownOverlay onComplete={handleCountdownComplete} />}
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
            <Leaderboard personalBest={personalBest} />
            <button 
              onClick={handleShowGuide}
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
          playerName={getPlayerName()}
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
            showWrongTaps={showWrongTaps}
          />
        </AudioInitializer>

        {gameState === 'idle' && (
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={launchRun}
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
          onRestart={launchRun}
          onShare={shareScore}
          totalScore={totalScore}
          onClose={handleGameOverClose}
        />
        
        {showCountdown && <CountdownOverlay onComplete={handleCountdownComplete} />}
      </div>
    </div>
  );
};

export default Index;
