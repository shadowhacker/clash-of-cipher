import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Score {
  name: string;
  bestScore: number;
  fastest: number;
  ts: any;
}

interface LeaderboardProps {
  personalBest: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ personalBest }) => {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef, orderBy('bestScore', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const scoreData = querySnapshot.docs.map(doc => doc.data() as Score);
        setScores(scoreData);
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchScores();
    }
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
        aria-label="Leaderboard"
      >
        🏆
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">🏆 Leaderboard</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="py-4 text-center">Loading...</div>
          ) : (
            <div className="py-4">
              <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-500 mb-2">
                <div>#</div>
                <div>Player</div>
                <div>Score</div>
                <div className="flex items-center gap-1">
                  ⏱ Fastest
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>ℹ️</TooltipTrigger>
                      <TooltipContent>
                        <p>Your quickest round completion (does not affect rank).</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="space-y-2">
                {scores.map((score, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 items-center">
                    <div className="font-medium">{index + 1}</div>
                    <div className="flex items-center gap-1">
                      🧑 {score.name}
                    </div>
                    <div className="flex items-center gap-1">
                      🎯 {score.bestScore.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      ⏱ {score.fastest.toFixed(1)}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Leaderboard;
