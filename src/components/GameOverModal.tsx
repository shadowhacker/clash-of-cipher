
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Share2, X } from 'lucide-react';

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
    const text = `I just scored ${totalScore} points on Round ${level} of Cipher Clash!\nThink you can beat me? Play → https://symbol-grid-sparkle-showdown.lovable.app/`;
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
    onRestart(); // Then restart the game
  };

  // Copy to clipboard when share modal opens
  useEffect(() => {
    if (showShareModal) {
      const text = `I just scored ${totalScore} points on Round ${level} of Cipher Clash!\nThink you can beat me? Play → https://symbol-grid-sparkle-showdown.lovable.app/`;
      navigator.clipboard.writeText(text);
    }
  }, [showShareModal, totalScore, level]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={handleCloseModal}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Game Over</DialogTitle>
            <DialogClose 
              onClick={handleCloseModal} 
              className="absolute right-4 top-4 opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </DialogClose>
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
              Try Again
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
            <DialogClose 
              onClick={() => setShowShareModal(false)} 
              className="absolute right-4 top-4 opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-md mb-4 bg-indigo-50 p-3 rounded-md border border-indigo-100">
              I just scored {totalScore} points on Round {level} of Cipher Clash!<br/>
              Think you can beat me? Play → https://symbol-grid-sparkle-showdown.lovable.app/
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
