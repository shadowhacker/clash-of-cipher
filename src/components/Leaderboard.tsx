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
import { Share2, Trophy, User, ChevronLeft, ChevronRight, Medal, Crown } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { getDeviceId } from '@/utils/deviceStorage';
import PlayerNameDialog from './PlayerNameDialog';
import { Separator } from '@/components/ui/separator';
import GameButton from './GameButton';
import { copyToClipboard } from '@/utils/clipboardUtils';
import useBackButton from '../hooks/useBackButton';

interface LeaderboardProps {
  personalBest: number;
  className?: string;
}

const ENTRIES_PER_PAGE = 10;

const Leaderboard: React.FC<LeaderboardProps> = ({ className = '', personalBest }) => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const deviceId = getDeviceId();

  // Use the back button hook to handle mobile back button presses
  useBackButton(open, () => setOpen(false));

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

  // Reset to first page when opening the leaderboard
  useEffect(() => {
    if (open) {
      setCurrentPage(0);
    }
  }, [open]);

  // Calculate total pages
  const totalPages = Math.ceil(leaderboard.length / ENTRIES_PER_PAGE);

  // Get current page entries
  const currentEntries = leaderboard.slice(
    currentPage * ENTRIES_PER_PAGE,
    (currentPage + 1) * ENTRIES_PER_PAGE
  );

  // Find user's entry in the leaderboard
  const userEntry = leaderboard.find(entry => entry.device_id === deviceId);

  // Check if user is on the current page
  const userEntryIndex = leaderboard.findIndex(entry => entry.device_id === deviceId);
  const userEntryPage = Math.floor(userEntryIndex / ENTRIES_PER_PAGE);
  const isUserOnCurrentPage = userEntryPage === currentPage;

  // Handle sharing a specific player's score
  const sharePlayerScore = (name: string, rank: number, best: number) => {
    const shareText = `${name} is #${rank} on Dhyanam with a score of ${best.toLocaleString()}! Try: https://clash-of-cipher.lovable.app/`;

    copyToClipboard(shareText)
      .then(success => {
        if (success) {
          toast("Copied to clipboard!", {
            description: "Share this achievement!",
          });
        } else {
          toast("Failed to copy", {
            description: "Please try again or copy manually",
          });
        }
      });
  };

  // Navigate to the page containing the user's entry
  const goToUserPage = () => {
    if (userEntryIndex !== -1) {
      setCurrentPage(userEntryPage);
    }
  };

  // Get medal for top 3 ranks
  const getRankMedal = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return null;
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
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              Hall of Heroes
            </DialogTitle>
            <DialogDescription className="text-center">
              Top 100 meditation masters
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-amber-700">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="py-2">
              {/* Pagination controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages || 1}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {userEntry && !isUserOnCurrentPage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToUserPage}
                      className="text-xs"
                    >
                      Go to your rank
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Leaderboard table */}
              <div className="rounded-lg overflow-hidden border border-amber-200 bg-amber-50/50">
                {/* Table header */}
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center bg-amber-100 p-3 border-b border-amber-200">
                  <div className="font-bold text-amber-900 text-sm">#</div>
                  <div className="font-bold text-amber-900 text-sm">Player</div>
                  <div className="font-bold text-amber-900 text-sm text-right">Score</div>
                  <div></div>
                </div>

                {/* Table body */}
                <div className="divide-y divide-amber-100">
                  {currentEntries.length > 0 ? (
                    currentEntries.map((entry, index) => {
                      const globalRank = currentPage * ENTRIES_PER_PAGE + index + 1;
                      const isCurrentPlayer = entry.device_id === deviceId;
                      const isTopThree = globalRank <= 3;

                      return (
                        <div
                          key={entry.id}
                          className={`grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center p-3 ${isCurrentPlayer ? 'bg-amber-100/70' : ''
                            } hover:bg-amber-50 transition-colors`}
                        >
                          <div className="font-medium flex items-center">
                            <span className={`mr-1 ${isTopThree ? 'text-amber-700' : ''}`}>
                              {globalRank}
                            </span>
                            {isTopThree && getRankMedal(globalRank)}
                          </div>

                          <div className={`${isCurrentPlayer ? 'font-medium text-amber-900' : ''} flex items-center`}>
                            {entry.name}
                            {isCurrentPlayer && (
                              <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>

                          <div className={`${isCurrentPlayer ? 'font-medium text-amber-900' : ''} text-right`}>
                            {entry.best.toLocaleString()}
                          </div>

                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-amber-700 hover:text-amber-900 hover:bg-amber-200/50"
                              onClick={() => sharePlayerScore(entry.name, globalRank, entry.best)}
                              title="Share score"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-amber-700">
                      No scores yet! Be the first to claim your spot.
                    </div>
                  )}
                </div>
              </div>

              {/* Total players info */}
              {totalPlayers > 0 && (
                <div className="mt-4 text-sm text-center text-muted-foreground">
                  {totalPlayers} total players on the leaderboard
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button
              onClick={() => setOpen(false)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
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
