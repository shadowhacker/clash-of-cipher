
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
import { RefreshCw } from 'lucide-react';

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
              <div className="absolute inset-0 bg-[url('/lovable-uploads/349fc7de-7598-487b-89c3-6acf8d7c751d.png')] bg-center bg-cover opacity-30 z-0"></div>
              
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
                    <p className="text-4xl font-bold text-amber-400">{level}</p>
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
                    {/* WhatsApp icon */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="mr-2 h-5 w-5"
                    >
                      <path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 13.5995 2.38913 15.1226 3.08056 16.4724L2.05664 21.1281C2.01913 21.2974 2.05293 21.4739 2.14893 21.6172C2.28804 21.8255 2.531 21.9395 2.77747 21.9395C2.84998 21.9395 2.92301 21.9307 2.99418 21.913L7.87295 20.5621C9.17065 21.1892 10.5523 21.5084 12.001 21.5084C17.5238 21.5084 22.001 17.0313 22.001 11.5084C22.001 5.98555 17.5238 2 12.001 2ZM17.2936 15.377C17.0395 15.9766 16.0583 16.5256 15.5661 16.5911C15.0739 16.6566 14.4559 16.5601 13.7974 16.311C13.1389 16.0619 11.999 15.537 10.8937 14.5248C9.78838 13.5127 8.70111 11.8478 8.50507 11.1893C8.30902 10.5308 8.62624 9.85018 8.83229 9.53295C9.03834 9.21573 9.311 9.13212 9.49815 9.0741C9.68531 9.01608 9.92595 8.99051 10.1083 9.18657C10.2907 9.38262 10.7988 10.0153 10.9341 10.2109C11.0694 10.4065 11.1267 10.5755 11.0532 10.771C10.9797 10.9665 10.6315 11.4402 10.4097 11.692C10.1878 11.9438 9.92868 11.9654 9.76706 12.1962C9.60544 12.4269 9.92182 12.8253 10.0575 13.0202C10.1933 13.2152 10.9088 14.1553 11.8326 14.9848C12.7564 15.8144 13.5924 16.1626 13.8711 16.2934C14.1498 16.4242 14.3463 16.3662 14.5434 16.1701C14.7404 15.974 15.0592 15.5763 15.2635 15.2976C15.4679 15.0189 15.6477 15.0362 15.8602 15.1252C16.0728 15.2142 17.1662 15.7552 17.3985 15.8862C17.6309 16.0171 17.7999 16.1142 17.8723 16.2282C17.9448 16.3422 17.9448 16.5429 17.8713 16.7374C17.7978 16.9319 17.5476 17.5773 17.2936 18.177C17.0395 18.7766 16.0583 19.3256 15.5661 19.3911C15.0739 19.4566 14.4559 19.3601 13.7974 19.111C13.1389 18.8619 11.999 18.337 10.8937 17.3248C9.78838 16.3127 8.70111 14.6478 8.50507 13.9893C8.30902 13.3308 8.62624 12.6502 8.83229 12.333C9.03834 12.0157 9.311 11.9321 9.49815 11.8741C9.68531 11.8161 9.92595 11.7905 10.1083 11.9866C10.2907 12.1826 10.7988 12.8153 10.9341 13.0109C11.0694 13.2065 11.1267 13.3755 11.0532 13.571C10.9797 13.7665 10.6315 14.2402 10.4097 14.492C10.1878 14.7438 9.92868 14.7654 9.76706 14.9962C9.60544 15.227 9.92182 15.6253 10.0575 15.8202C10.1933 16.0152 10.9088 16.9553 11.8326 17.7848C12.7564 18.6144 13.5924 18.9626 13.8711 19.0934C14.1498 19.2242 14.3463 19.1662 14.5434 18.9701C14.7404 18.774 15.0592 18.3763 15.2635 18.0976C15.4679 17.8189 15.6477 17.8362 15.8602 17.9252C16.0728 18.0142 17.1662 18.5552 17.3985 18.6862C17.6309 18.8171 17.7999 18.9142 17.8723 19.0282C17.9448 19.1422 17.9448 19.3429 17.8713 19.5374C17.7978 19.7319 17.5476 20.3773 17.2936 20.977C17.0395 21.5766 16.0583 22.1256 15.5661 22.1911C15.0739 22.2566 14.4559 22.1601 13.7974 21.911C13.1389 21.6619 11.999 21.137 10.8937 20.1248C9.78838 19.1127 8.70111 17.4478 8.50507 16.7893C8.30902 16.1308 8.62624 15.4502 8.83229 15.133C9.03834 14.8157 9.311 14.7321 9.49815 14.6741C9.68531 14.6161 9.92595 14.5905 10.1083 14.7866C10.2907 14.9826 10.7988 15.6153 10.9341 15.8109C11.0694 16.0065 11.1267 16.1755 11.0532 16.371C10.9797 16.5665 10.6315 17.0402 10.4097 17.292C10.1878 17.5438 9.92868 17.5654 9.76706 17.7962C9.60544 18.027 9.92182 18.4253 10.0575 18.6202C10.1933 18.8152 10.9088 19.7553 11.8326 20.5848C12.7564 21.4144 13.5924 21.7626 13.8711 21.8934C14.1498 22.0242 14.3463 21.9662 14.5434 21.7701C14.7404 21.574 15.0592 21.1763 15.2635 20.8976C15.4679 20.6189 15.6477 20.6362 15.8602 20.7252C16.0728 20.8142 17.1662 21.3552 17.3985 21.4862C17.6309 21.6171 17.7999 21.7142 17.8723 21.8282C17.9448 21.9422 17.9448 22.1429 17.8713 22.3374C17.7978 22.5319 17.5476 23.1773 17.2936 23.777V15.377Z"/>
                    </svg>
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
