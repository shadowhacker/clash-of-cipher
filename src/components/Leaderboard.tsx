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
import { Share2, Trophy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { getDeviceId } from '@/utils/deviceStorage';
import PlayerNameDialog from './PlayerNameDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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

  // Find user's position in the leaderboard
  const userRank = leaderboard?.findIndex(entry => entry?.device_id === deviceId) ?? -1;
  const userEntry = leaderboard?.find(entry => entry?.device_id === deviceId);
  const isUserBeyondTop50 = userRank >= 50;

  // Handle sharing a specific player's score
  const sharePlayerScore = (name: string, rank: number, best: number) => {
    const shareText = `${name} is #${rank + 1} on Cipher Clash with Round ${best}! Try: https://symbol-grid-sparkle-showdown.lovable.app/`;
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
            <DialogDescription className="text-center">
              See how your score compares with other players.
            </DialogDescription>
          </DialogHeader>
          
          {loading ? (
            <div className="text-center py-4">Loading leaderboard...</div>
          ) : (
            <>
              <ScrollArea className="h-[400px] w-full pr-4">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center sticky top-0 bg-background z-10 pb-2">
                  <div className="font-semibold text-sm">#</div>
                  <div className="font-semibold text-sm">🧑‍🚀 Name</div>
                  <div className="font-semibold text-sm">🎯 Best</div>
                  <div></div>
                </div>

                {Array.isArray(leaderboard) && leaderboard.slice(0, 50).map((entry, index) => {
                  if (!entry) return null;
                  const isCurrentPlayer = entry.device_id === deviceId;
                  return (
                    <div key={entry.id} className="contents">
                      <div className={`py-1 ${isCurrentPlayer ? 'bg-amber-100 rounded-l-md' : ''}`}>
                        {index + 1}
                      </div>
                      <div className={`py-1 ${isCurrentPlayer ? 'bg-amber-100' : ''}`}>
                        {entry.name} {isCurrentPlayer ? '(You)' : ''}
                      </div>
                      <div className={`py-1 ${isCurrentPlayer ? 'bg-amber-100' : ''}`}>
                        {entry.best}
                      </div>
                      <div className={`py-1 ${isCurrentPlayer ? 'bg-amber-100 rounded-r-md' : ''}`}>
                        {isCurrentPlayer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => sharePlayerScore(entry.name, index, entry.best)}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {(!Array.isArray(leaderboard) || leaderboard.length === 0) && (
                  <div className="col-span-4 text-center py-4 text-gray-500">
                    No scores yet! Be the first to claim your spot.
                  </div>
                )}

                {/* Show user's position if beyond top 50 */}
                {isUserBeyondTop50 && userEntry && (
                  <>
                    <Separator className="my-4" />
                    <div className="contents">
                      <div className="py-1 bg-amber-100 rounded-l-md">
                        {userRank + 1}
                      </div>
                      <div className="py-1 bg-amber-100">
                        {userEntry.name} (You)
                      </div>
                      <div className="py-1 bg-amber-100">
                        {userEntry.best}
                      </div>
                      <div className="py-1 bg-amber-100 rounded-r-md">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => sharePlayerScore(userEntry.name, userRank, userEntry.best)}
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </ScrollArea>
            </>
          )}
          
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