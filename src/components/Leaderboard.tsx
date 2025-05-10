
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Trophy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { getDeviceId } from '@/utils/deviceStorage';
import PlayerNameDialog from './PlayerNameDialog';

interface LeaderboardProps {
  personalBest: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ personalBest }) => {
  const [open, setOpen] = useState(false);
  const deviceId = getDeviceId();
  
  const {
    leaderboard,
    loading,
    playerName,
    showNamePrompt,
    setShowNamePrompt,
    submitPlayerName
  } = useLeaderboard(personalBest);

  // Handle sharing a specific player's score
  const sharePlayerScore = (name: string, rank: number, best: number) => {
    const shareText = `${name} is #${rank} on Cipher Clash with Round ${best}! Try: https://symbol-grid-sparkle-showdown.lovable.app/`;
    navigator.clipboard.writeText(shareText);
    toast("Copied to clipboard!", {
      description: "Share this achievement!",
    });
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setOpen(true)} 
        className="rounded-full"
      >
        <Trophy className="h-4 w-4" />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              🏆 Hall of Heroes
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {loading ? (
              <div className="text-center py-4">Loading leaderboard...</div>
            ) : (
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center">
                <div className="font-semibold text-sm">#</div>
                <div className="font-semibold text-sm">🧑‍🚀 Name</div>
                <div className="font-semibold text-sm">🎯 Best</div>
                <div></div>
                
                {leaderboard.map((entry, index) => {
                  const isCurrentPlayer = entry.device_id === deviceId;
                  return (
                    <React.Fragment key={entry.id}>
                      <div className={`py-1 ${isCurrentPlayer ? 'bg-amber-100' : ''}`}>
                        {index + 1}
                      </div>
                      <div className={`py-1 ${isCurrentPlayer ? 'bg-amber-100 font-medium' : ''}`}>
                        {entry.name} {isCurrentPlayer ? '(You)' : ''}
                      </div>
                      <div className={`py-1 ${isCurrentPlayer ? 'bg-amber-100 font-medium' : ''}`}>
                        {entry.best}
                      </div>
                      <div className={`py-1 ${isCurrentPlayer ? 'bg-amber-100' : ''}`}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => sharePlayerScore(entry.name, index + 1, entry.best)}
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </React.Fragment>
                  );
                })}
                
                {leaderboard.length === 0 && (
                  <div className="col-span-4 text-center py-4 text-gray-500">
                    No scores yet! Be the first to claim your spot.
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PlayerNameDialog 
        open={showNamePrompt} 
        onSubmit={submitPlayerName} 
      />
    </>
  );
};

export default Leaderboard;
