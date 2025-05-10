
import React from 'react';
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
  const handleShare = () => {
    const text = onShare();
    toast("Copied to clipboard!", {
      description: "Share your score with friends!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Game Over</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-lg mb-2">You reached <span className="font-bold">Level {level}</span>!</p>
          <p>Your personal best: <span className="font-bold">{personalBest}</span></p>
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
  );
};

export default GameOverModal;
