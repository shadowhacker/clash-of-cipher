import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Trophy, User } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { getDeviceId } from '@/utils/deviceStorage';
import PlayerNameDialog from './PlayerNameDialog';
import { Separator } from '@/components/ui/separator';
import GameButton from './GameButton';

interface LeaderboardProps {
  personalBest: number;
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ className = '', personalBest }) => {
  const [open, setOpen] = useState(false);
  const deviceId = getDeviceId();

  const {
    leaderboard,
    loading,
    playerName,
    showNamePrompt,
    setShowNamePrompt,
    submitPlayerName,
    playerRank,
    totalPlayers
  } = useLeaderboard(personalBest);

  // Find user's entry in the leaderboard
  const userEntry = leaderboard.find(entry => entry.device_id === deviceId);
  const isInTop10 = leaderboard.slice(0, 10).findIndex(entry => entry.device_id === deviceId) !== -1;

  // Handle sharing a specific player's score
  const sharePlayerScore = (name: string, rank: number, best: number) => {
    const shareText = `${name} is #${rank} on Cipher Clash with a score of ${best}! Try: https://clash-of-cipher.lovable.app/`;
    navigator.clipboard.writeText(shareText);
    toast("Copied to clipboard!", {
      description: "Share this achievement!",
    });
  };

  return (
    <>
      <GameButton
        onClick={() => setOpen(true)}
        icon={<Trophy className="h-5 w-5" />}
        label="Leaderboard"
        className={className}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              🏆 Hall of Heroes
            </DialogTitle>
            <DialogDescription className="text-center">
              See how your score compares with other players.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {loading ? (
              <div className="text-center py-4">Loading leaderboard...</div>
            ) : (
              <>
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center">
                  <div className="font-semibold text-sm">#</div>
                  <div className="font-semibold text-sm">🧑‍🚀 Name</div>
                  <div className="font-semibold text-sm">🎯 Best</div>
                  <div></div>

                  {leaderboard.slice(0, 10).map((entry, index) => {
                    const isCurrentPlayer = entry.device_id === deviceId;
                    return (
                      <div key={entry.id} className="contents">
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
                          {isCurrentPlayer && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => sharePlayerScore(entry.name, index + 1, entry.best)}
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {leaderboard.length === 0 && (
                    <div className="col-span-4 text-center py-4 text-gray-500">
                      No scores yet! Be the first to claim your spot.
                    </div>
                  )}
                </div>

                {/* Your position section - only shown if user has a best score but isn't in top 10 */}
                {!isInTop10 && userEntry && playerRank && (
                  <>
                    {/* Divider with indication that there are more players */}
                    <div className="mt-4 pt-2 border-t text-center text-gray-500 text-sm">
                      {playerRank > 10 && (
                        <div className="my-2 italic">
                          {playerRank - 10} more players...
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <div className="text-sm font-medium mb-2">Your Position</div>
                      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center bg-amber-50 rounded-md p-2">
                        <div className="font-medium">{playerRank}</div>
                        <div className="font-medium">{userEntry.name} (You)</div>
                        <div className="font-medium">{userEntry.best}</div>
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => sharePlayerScore(userEntry.name, playerRank, userEntry.best)}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {totalPlayers > 0 && (
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          Out of {totalPlayers} total players
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
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
        onClose={() => setShowNamePrompt(false)}
      />
    </>
  );
};

export default Leaderboard;
