
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

// Since we can't integrate Firebase yet, we'll use mock data
interface LeaderboardEntry {
  id: string;
  name: string;
  best: number;
  ts: number;
}

interface LeaderboardProps {
  personalBest: number;
  currentPlayerName?: string; // Optional, could be anonymous
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  personalBest,
  currentPlayerName = "You" 
}) => {
  const [open, setOpen] = useState(false);
  // Mock leaderboard data - in a real app this would come from Firestore
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { id: '1', name: 'ShadowHacker', best: 37, ts: Date.now() },
    { id: '2', name: 'CryptoDegen', best: 34, ts: Date.now() },
    { id: '3', name: 'NeuralNinja', best: 32, ts: Date.now() },
    { id: '4', name: 'ByteMaster', best: 29, ts: Date.now() },
    { id: '5', name: 'QuantumQuester', best: 27, ts: Date.now() },
    { id: '6', name: 'GitWizard', best: 25, ts: Date.now() },
    { id: '7', name: 'DataDrifter', best: 24, ts: Date.now() },
    { id: '8', name: 'CodeCrusher', best: 23, ts: Date.now() },
    { id: '9', name: 'AlgoAce', best: 22, ts: Date.now() },
    // The current player would be inserted here based on their score
  ]);

  // Handle sharing a specific player's score
  const sharePlayerScore = (name: string, rank: number, best: number) => {
    const shareText = `${name} is #${rank} on Cipher Clash with Round ${best}! Try: https://cipherclash.com`;
    navigator.clipboard.writeText(shareText);
    toast("Copied to clipboard!", {
      description: "Share this achievement!",
    });
  };

  // Calculate player's rank and add them to the leaderboard
  useEffect(() => {
    // Create a copy of the leaderboard without the current player
    let newLeaderboard = leaderboard.filter(entry => entry.name !== currentPlayerName);
    
    // Add the current player with their personal best
    const playerEntry: LeaderboardEntry = {
      id: 'current-player', 
      name: currentPlayerName, 
      best: personalBest,
      ts: Date.now()
    };
    
    // Add the player and sort the leaderboard
    newLeaderboard = [...newLeaderboard, playerEntry]
      .sort((a, b) => b.best - a.best)
      .slice(0, 10); // Keep only top 10
      
    setLeaderboard(newLeaderboard);
  }, [personalBest, currentPlayerName]);

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
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center">
              <div className="font-semibold text-sm">#</div>
              <div className="font-semibold text-sm">🧑‍🚀 Name</div>
              <div className="font-semibold text-sm">🎯 Best</div>
              <div></div>
              
              {leaderboard.map((entry, index) => {
                const isCurrentPlayer = entry.name === currentPlayerName;
                return (
                  <React.Fragment key={entry.id}>
                    <div className={`py-1 ${isCurrentPlayer ? 'bg-amber-100' : ''}`}>
                      {index + 1}
                    </div>
                    <div className={`py-1 ${isCurrentPlayer ? 'bg-amber-100 font-medium' : ''}`}>
                      {entry.name}
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
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Leaderboard;
