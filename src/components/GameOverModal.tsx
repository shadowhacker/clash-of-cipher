import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Share2 } from 'lucide-react';

interface GameOverModalProps {
  level: number;
  personalBest: number;
  open: boolean;
  onRestart: () => void;
  onShare: () => string;
  totalScore: number;
  onClose: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  personalBest,
  open,
  onRestart,
  onShare,
  totalScore,
  onClose,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = () => {
    const text = onShare();
    toast("Copied to clipboard!", {
      description: "Share your score with friends!",
    });
    setShowShareModal(true);
  };

  const handleShareAgain = () => {
    const text = `My tapasya broke after ${totalScore} points at Level ${level} in Dhyanam!\nCan you go further? Play → https://clash-of-cipher.lovable.app/`;
    navigator.clipboard.writeText(text);
    toast("Copied again!", {
      description: "Ready to share!",
    });
  };

  const handleCloseModal = () => {
    setShowShareModal(false);
    onClose();
  };

  const handleTryAgain = () => {
    onClose(); // First close the modal
    onRestart(); // Then restart the game to initial state
  };

  // Copy to clipboard when share modal opens
  useEffect(() => {
    if (showShareModal) {
      const text = `My tapasya broke after ${totalScore} points at Level ${level} in Dhyanam!\nCan you go further? Play → https://clash-of-cipher.lovable.app/`;
      navigator.clipboard.writeText(text);
    }
  }, [showShareModal, totalScore, level]);

  // Helper function to determine font size based on number length
  const getScoreFontSize = (score: number) => {
    const scoreString = score.toString();
    if (scoreString.length > 6) return 'text-4xl md:text-5xl';
    if (scoreString.length > 4) return 'text-4xl md:text-5xl';
    return 'text-5xl md:text-6xl';
  };

  const getLevelFontSize = (level: number) => {
    const levelString = level.toString();
    if (levelString.length > 2) return 'text-4xl md:text-5xl';
    return 'text-5xl md:text-6xl';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleCloseModal}>
        <DialogContent className="p-0 border-0 max-w-xl overflow-hidden bg-transparent">
          <DialogTitle className="sr-only">Game Over</DialogTitle>
          <DialogDescription className="sr-only">
            Your tapasya broke. Score: {totalScore}, Level: {level}
          </DialogDescription>

          <div
            className="w-full h-full flex flex-col items-center justify-between"
            style={{
              position: 'relative',
              minHeight: '85vh',
              padding: '0 0 2rem 0'
            }}
          >
            {/* Background image with overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url("/images/bg-game-over.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: -2
              }}
            />

            {/* Dark overlay for better text visibility */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.37)',
                zIndex: -1
              }}
            />

            {/* Top header section */}
            <div className="text-center w-full mt-20 mb-auto z-10">
              <h1
                className="text-4xl md:text-5xl font-bold mb-3"
                style={{
                  color: '#e9a142',
                  fontFamily: 'serif',
                  textShadow: '0 4px 4px rgb(0, 0, 0)'
                }}
              >
                YOUR TAPASYA
              </h1>
              <h1
                className="text-5xl md:text-6xl font-bold"
                style={{
                  color: '#e9a142',
                  fontFamily: 'serif',
                  textShadow: '0 4px 4px rgb(0, 0, 0)'
                }}
              >
                BROKE
              </h1>
            </div>

            {/* Bottom container for score, level and buttons */}
            <div className="flex flex-col items-center w-full gap-8 px-8 z-10 mt-auto">
              {/* Score & Level section - positioned above the button */}
              <div className="flex w-full justify-around px-4">
                <div className="text-center w-1/2 px-2">
                  <p
                    className="text-2xl font-semibold mb-1"
                    style={{ color: '#e8934a', textShadow: '0 2px 2px rgba(0, 0, 0, 0.7)' }}
                  >
                    SCORE
                  </p>
                  <p
                    className={`${getScoreFontSize(totalScore)} font-bold truncate`}
                    style={{
                      color: '#e8934a',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
                      maxWidth: '100%'
                    }}
                  >
                    {totalScore.toLocaleString()}
                  </p>
                </div>

                <div className="text-center w-1/2 px-2">
                  <div>
                    <p
                      className="text-2xl font-semibold mb-1"
                      style={{ color: '#e8934a', textShadow: '0 2px 2px rgba(0, 0, 0, 0.7)' }}
                    >
                      LEVEL
                    </p>
                  </div>
                  <p
                    className={`${getLevelFontSize(level)} font-bold truncate`}
                    style={{
                      color: '#e8934a',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
                      maxWidth: '100%'
                    }}
                  >
                    {level}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col items-center w-full gap-5">
                <button
                  onClick={handleTryAgain}
                  className="w-full max-w-md py-3 font-bold text-xl rounded-xl transition-transform hover:scale-105 focus:outline-none"
                  style={{
                    backgroundColor: '#69310f',
                    color: '#ffbb24',
                    border: '4px solid #873b11',
                    borderRadius: '16px',
                    boxShadow: '0 0 25px rgba(105, 49, 15, 0.5)',
                    textShadow: '0 2px 2px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  RESTART DHYANAM
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center w-full max-w-md py-3 font-bold text-lg transition-opacity hover:opacity-80"
                  style={{
                    color: '#e8934a',
                    textShadow: '0 2px 2px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <span className="mr-2">💬</span> CHALLENGE YOUR SANGHA
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md bg-amber-950/95 text-amber-100 border-amber-800">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-amber-400">
              <span className="block text-3xl mb-2">🧘</span>
              Challenge your Sangha!
            </DialogTitle>
            <DialogDescription className="text-center text-amber-300/80">
              Your score has been copied to clipboard. Share it with friends.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-md mb-4 bg-amber-900/50 p-3 rounded-md border border-amber-800/50 text-amber-200">
              My tapasya broke after {totalScore.toLocaleString()} points at Level {level} in Dhyanam!<br />
              Can you go further? Play → https://clash-of-cipher.lovable.app/
            </p>
            <p className="text-amber-400 text-sm flex items-center justify-center">
              <span className="inline-block mr-1">✅</span> Message copied—paste it to WhatsApp, Telegram, X, etc.
            </p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowShareModal(false)}
              className="border-amber-700 text-amber-400 hover:bg-amber-900/50"
            >
              Close
            </Button>
            <Button
              onClick={handleShareAgain}
              className="bg-amber-700 text-amber-200 hover:bg-amber-800"
            >
              Share Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameOverModal;
