import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserId, getPlayerName, savePlayerName } from '@/utils/deviceStorage';
import logger from '../utils/logger';

interface LeaderboardEntry {
  id: string;
  nickname: string;
  best_score: number;
}

export const useLeaderboard = (personalBest: number) => {
  // Helper: get leaderboard UUID from localStorage
  const getUserId = (): string | null => {
    return localStorage.getItem('cipher-clash-device-id');
  };

  // Helper: set leaderboard UUID in localStorage
  const setUserId = (id: string) => {
    localStorage.setItem('cipher-clash-device-id', id);
  };

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Load player name and leaderboard on initial render
  useEffect(() => {
    const storedName = getPlayerName();
    setPlayerName(storedName);

    // If no name is stored, we'll need to prompt for one
    if (!storedName && personalBest > 0) {
      setShowNamePrompt(true);
    }

    fetchLeaderboard();
  }, []);

  // Update the leaderboard entry when personal best changes
  useEffect(() => {
    if (personalBest > 0 && playerName) {
      updateLeaderboardEntry(playerName, personalBest);
    }
  }, [personalBest, playerName]);

  // Fetch leaderboard data from Supabase
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const userId = getUserId();

    try {
      // Get top 100 scores instead of 10
      const { data: topScores, error } = await supabase
        .from('leaderboard_v2')
        .select('*')
        .order('best_score', { ascending: false })
        .limit(100);

      if (error) {
        logger.error('Error fetching leaderboard:', error);
        setLoading(false);
        return;
      }

      setLeaderboard(topScores || []);

      // Check if player is in top 100
      const playerInTopEntries = topScores?.some(entry => entry.id === userId);

      if (!playerInTopEntries) {
        // Get player rank if not in top 100
        const { data: userEntry } = await supabase
          .from('leaderboard_v2')
          .select('*')
          .eq('id', userId)
          .limit(1);

        if (userEntry && userEntry.length > 0) {
          // Get player's rank
          const { count: playersAbove } = await supabase
            .from('leaderboard_v2')
            .select('*', { count: 'exact', head: true })
            .gt('best_score', userEntry[0].best_score);

          if (playersAbove !== null) {
            setPlayerRank(playersAbove + 1);

            // Get total player count
            const { count: total } = await supabase
              .from('leaderboard_v2')
              .select('*', { count: 'exact', head: true });

            setTotalPlayers(total || 0);

            // Add player entry to the leaderboard for display
            setLeaderboard(prev => {
              // Don't add if already in the list
              if (prev.some(e => e.id === userId)) return prev;
              return [...prev, userEntry[0]];
            });
          }
        }
      } else {
        // Player is in top 100, find their rank
        const playerRank = topScores.findIndex(entry => entry.id === userId) + 1;
        setPlayerRank(playerRank);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Failed to fetch leaderboard. Please try again later.");
      logger.error('Failed to fetch leaderboard:', err);
    }
  }, []);

  // Update or create a leaderboard entry
  const updateLeaderboardEntry = async (nickname: string, score: number) => {
    setUpdating(true);
    setError(null); // Clear any previous errors

    try {
      logger.info(`Attempting to update leaderboard for ${nickname} with score ${score}`);
      
      // Check if we have a userId stored
      let userId = getUserId();
      let updated = false;

      if (!userId) {
        // No id, so create a new entry and store the returned id
        const { data, error } = await supabase
          .from('leaderboard_v2')
          .insert([{ nickname, best_score: score }])
          .select();
        if (error) {
          logger.error('Error creating leaderboard entry:', error);
          setUpdating(false);
          setError("Failed to create leaderboard entry. Please try again later.");
          return;
        }
        if (data && data[0]?.id) {
          userId = data[0].id;
          setUserId(userId);
          logger.info('Leaderboard entry created:', data[0]);
          updated = true;
        }
      } else {
        // We have an id, so update by nickname
        const { data, error } = await supabase
          .from('leaderboard_v2')
          .update({ best_score: score })
          .match({ nickname })
          .select();
        if (error) {
          logger.error('Error updating leaderboard entry:', error);
          setUpdating(false);
          setError("Failed to update leaderboard entry. Please try again later.");
          return;
        }
        if (data && data.length > 0) {
          logger.info('Leaderboard entry updated:', data[0]);
          updated = true;
        }
      }

      // Only fetch leaderboard if we updated something
      if (updated) {
        logger.info('Refreshing leaderboard after update');
        // Fetch immediately to show updated results
        await fetchLeaderboard();
      }
      
      setUpdating(false);
    } catch (err) {
      logger.error('Failed to update leaderboard:', err);
      setUpdating(false);
      setError("Failed to update leaderboard. Please try again later.");
    }
  };

  // Save player name
  const submitPlayerName = (name: string) => {
    if (name && name.trim()) {
      const trimmedName = name.trim();
      savePlayerName(trimmedName);
      setPlayerName(trimmedName);
      setShowNamePrompt(false);

      // Update the leaderboard with the new name and current score
      if (personalBest > 0) {
        updateLeaderboardEntry(trimmedName, personalBest);
      }
    }
  };

  return {
    leaderboard,
    loading,
    playerName,
    showNamePrompt,
    setShowNamePrompt,
    submitPlayerName,
    updateLeaderboardEntry,
    fetchLeaderboard,
    playerRank,
    totalPlayers,
    error
  };
};
