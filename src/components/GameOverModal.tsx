import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Share2, X, Trophy, RefreshCw } from 'lucide-react';

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
    const text = `I just scored ${totalScore} points on Round ${level} of Cipher Clash!\nThink you can beat me? Play → https://clash-of-cipher.lovable.app/`;
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
      const text = `I just scored ${totalScore} points on Round ${level} of Cipher Clash!\nThink you can beat me? Play → https://clash-of-cipher.lovable.app/`;
      navigator.clipboard.writeText(text);
    }
  }, [showShareModal, totalScore, level]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5" /> Game Over
            </DialogTitle>
            <DialogDescription className="text-center">
              Your game has ended. Here's how you did.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-lg mb-2">
              You scored <span className="font-bold">{totalScore} points</span>!
            </p>
            <p className="mb-2">
              Reached <span className="font-bold">Round {level}</span>
            </p>
            <p>Your lifetime best: <span className="font-bold">{personalBest}</span></p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button onClick={handleTryAgain}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share My Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              <span className="block text-3xl mb-2">🎉</span>
              Challenge your friends!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your score has been copied to clipboard. Share it with friends.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-md mb-4 bg-indigo-50 p-3 rounded-md border border-indigo-100">
              I just scored {totalScore} points on Round {level} of Cipher Clash!<br />
              Think you can beat me? Play → https://clash-of-cipher.lovable.app/
            </p>
            <p className="text-green-600 text-sm flex items-center justify-center">
              <span className="inline-block mr-1">✅</span> Message copied—paste it to WhatsApp, Telegram, X, etc.
            </p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
            <Button onClick={handleShareAgain}>
              Share Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameOverModal;
