
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
import { Share2, RefreshCw } from 'lucide-react';

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
        <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0">
          <div className="w-full bg-gradient-to-b from-[#221F26]/95 to-[#1A1F2C]/95 border border-amber-900/50 rounded-lg overflow-hidden">
            <div className="relative pt-8 px-6 pb-6">
              <div className="absolute inset-0 bg-[url('/lovable-uploads/d239d8bd-0e89-40ef-a501-bee4d78b326f.png')] bg-center bg-cover opacity-30 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-amber-500 text-center mb-1">
                  YOUR TAPASYA BROKE
                </h2>
                
                <div className="w-20 h-20 my-4">
                  {/* Trident symbol - SVG representation */}
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-600">
                    <path d="M12 3L12 21M12 3C11 6 6 8 6 8M12 3C13 6 18 8 18 8M6 21H18" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                <div className="grid grid-cols-2 gap-12 mt-6 w-full text-center">
                  <div>
                    <h3 className="text-xl text-amber-500">SCORE</h3>
                    <p className="text-4xl font-bold text-amber-400">{totalScore}</p>
                  </div>
                  <div>
                    <h3 className="text-xl text-amber-500">LEVEL</h3>
                    <p className="text-4xl font-bold text-amber-400">REACHED {level}</p>
                  </div>
                </div>
                
                <div className="w-full mt-10 flex flex-col gap-4">
                  <Button 
                    onClick={handleTryAgain} 
                    className="w-full py-6 text-xl bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-amber-200 rounded-lg border border-amber-600"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" /> RESTART DHYANAM
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleShare} 
                    className="w-full py-6 text-xl bg-transparent border border-amber-700/50 text-amber-400 hover:bg-amber-900/30 rounded-lg"
                  >
                    <Share2 className="mr-2 h-5 w-5" />
                    CHALLENGE YOUR SANGHA
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-[#1A1F2C] to-[#221F26] border border-amber-800/50 text-amber-200">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-amber-500">
              <span className="block text-3xl mb-2">🧘</span>
              Challenge your Sangha
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
