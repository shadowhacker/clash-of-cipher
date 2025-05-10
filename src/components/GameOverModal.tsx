
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface GameOverModalProps {
  level: number;
  personalBest: number;
  open: boolean;
  onRestart: () => void;
  onShare: () => string;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  personalBest,
  open,
  onRestart,
  onShare,
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
    const text = `I reached Level ${personalBest} in Cipher Clash! Think you can beat me? Play here → https://cipherclash.com`;
    navigator.clipboard.writeText(text);
    toast("Copied again!", {
      description: "Ready to share!",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Game Over</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-lg mb-2">You reached <span className="font-bold">Level {level}</span>!</p>
            <p>Your lifetime best: <span className="font-bold">{personalBest}</span></p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button onClick={onRestart}>
              Try Again
            </Button>
            <Button variant="outline" onClick={handleShare}>
              Share My Best
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareModal} onOpenChange={() => setShowShareModal(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              <span className="block text-3xl mb-2">🎉</span>
              Challenge your friends!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-md mb-4 bg-indigo-50 p-3 rounded-md border border-indigo-100">
              I reached Level {personalBest} in Cipher Clash!<br/>
              Think you can beat me? Play here → https://cipherclash.com
            </p>
            <p className="text-green-600 text-sm flex items-center justify-center">
              <span className="inline-block mr-1">✅</span> Copied to clipboard
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
