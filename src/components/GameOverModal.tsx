
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
      description: "Share your meditative score with friends!",
    });
    setShowShareModal(true);
  };

  const handleShareAgain = () => {
    const text = `I just reached spiritual level ${level} with ${totalScore} points in Dhyanam!\nCan you achieve deeper meditation? Play → https://dhyanam.lovable.app/`;
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
      const text = `I just reached spiritual level ${level} with ${totalScore} points in Dhyanam!\nCan you achieve deeper meditation? Play → https://dhyanam.lovable.app/`;
      navigator.clipboard.writeText(text);
    }
  }, [showShareModal, totalScore, level]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-indigo-950 to-amber-950 border border-amber-700 text-amber-200">
          <DialogHeader>
            <DialogTitle className="text-center text-xl flex items-center justify-center gap-2 text-amber-500">
              <Trophy className="h-5 w-5" /> Meditation Complete
            </DialogTitle>
            <DialogDescription className="text-center text-amber-400/80">
              Your journey of focus has ended. Here's your achievement.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-lg mb-2 text-amber-300">
              You scored <span className="font-bold text-amber-500">{totalScore} points</span>!
            </p>
            <p className="mb-2 text-amber-300">
              Reached <span className="font-bold text-amber-500">Level {level}</span>
            </p>
            <p className="text-amber-300">Your best: <span className="font-bold text-amber-500">{personalBest}</span></p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button onClick={handleTryAgain} className="bg-amber-600 hover:bg-amber-700 text-amber-100">
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button variant="outline" onClick={handleShare} className="border-amber-700 text-amber-400 hover:bg-amber-900/30">
              <Share2 className="mr-2 h-4 w-4" />
              Share My Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-indigo-950 to-amber-950 border border-amber-700 text-amber-200">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-amber-500">
              <span className="block text-3xl mb-2">🧘</span>
              Challenge your friends!
            </DialogTitle>
            <DialogDescription className="text-center text-amber-400/80">
              Your score has been copied. Share with friends to inspire their meditation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-md mb-4 bg-amber-950/50 p-3 rounded-md border border-amber-800/50 text-amber-300">
              I just reached spiritual level {level} with {totalScore} points in Dhyanam!<br />
              Can you achieve deeper meditation? Play → https://dhyanam.lovable.app/
            </p>
            <p className="text-green-500 text-sm flex items-center justify-center">
              <span className="inline-block mr-1">✅</span> Message copied—paste it to WhatsApp, Telegram, X, etc.
            </p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setShowShareModal(false)} className="border-amber-700 text-amber-400 hover:bg-amber-900/30">
              Close
            </Button>
            <Button onClick={handleShareAgain} className="bg-amber-600 hover:bg-amber-700 text-amber-100">
              Share Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameOverModal;
