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

  const userRank = leaderboard?.findIndex(entry => entry?.device_id === deviceId) ?? -1;
  const userEntry = leaderboard?.find(entry => entry?.device_id === deviceId);
  const isUserBeyondTop50 = userRank >= 50;

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
            <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" /> Hall of Heroes
            </DialogTitle>
            <DialogDescription className="text-center">
              Top 50 players and their achievements
            </DialogDescription>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center sticky top-0 bg-background z-10 pb-2 border-b">
                  <div className="font-semibold text-sm">#</div>
                  <div className="font-semibold text-sm">Player</div>
                  <div className="font-semibold text-sm text-right">Best</div>
                  <div className="w-8"></div>
                </div>

                <div className="space-y-2 mt-2">
                  {Array.isArray(leaderboard) && leaderboard.slice(0, 50).map((entry, index) => {
                    if (!entry) return null;
                    const isCurrentPlayer = entry.device_id === deviceId;
                    return (
                      <div 
                        key={entry.id} 
                        className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center py-2 px-3 rounded-lg transition-colors ${
                          isCurrentPlayer ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`text-sm ${isCurrentPlayer ? 'font-semibold' : ''}`}>
                          {index + 1}
                        </div>
                        <div className={`text-sm truncate ${isCurrentPlayer ? 'font-semibold' : ''}`}>
                          {entry.name} {isCurrentPlayer && <span className="text-amber-600">(You)</span>}
                        </div>
                        <div className={`text-sm tabular-nums text-right ${isCurrentPlayer ? 'font-semibold' : ''}`}>
                          {entry.best}
                        </div>
                        <div>
                          {isCurrentPlayer && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
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
                    <div className="text-center py-8 text-gray-500">
                      No scores yet! Be the first to claim your spot.
                    </div>
                  )}

                  {isUserBeyondTop50 && userEntry && (
                    <>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center py-2 px-3 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="text-sm font-semibold">{userRank + 1}</div>
                        <div className="text-sm font-semibold truncate">
                          {userEntry.name} <span className="text-amber-600">(You)</span>
                        </div>
                        <div className="text-sm font-semibold tabular-nums text-right">
                          {userEntry.best}
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => sharePlayerScore(userEntry.name, userRank, userEntry.best)}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
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