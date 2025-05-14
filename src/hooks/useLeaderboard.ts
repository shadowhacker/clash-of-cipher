
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId, getPlayerName, savePlayerName } from '@/utils/deviceStorage';
import logger from '../utils/logger';

interface LeaderboardEntry {
  id: string;
  name: string;
  best: number;
  device_id: string;
  created_at?: string;
  updated_at?: string;
}

export const useLeaderboard = (personalBest: number) => {
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
    const deviceId = getDeviceId();

    try {
      // Get top 10 scores
      const { data: topScores, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('best', { ascending: false })
        .limit(10);

      if (error) {
        logger.error('Error fetching leaderboard:', error);
        setLoading(false);
        return;
      }

      setLeaderboard(topScores || []);

      // Check if player is in top 10
      const playerInTopTen = topScores?.some(entry => entry.device_id === deviceId);

      if (!playerInTopTen) {
        // Get player rank if not in top 10
        const { data: userEntry } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('device_id', deviceId)
          .limit(1);

        if (userEntry && userEntry.length > 0) {
          // Get player's rank
          const { count: playersAbove } = await supabase
            .from('leaderboard')
            .select('*', { count: 'exact', head: true })
            .gt('best', userEntry[0].best);

          if (playersAbove !== null) {
            setPlayerRank(playersAbove + 1);

            // Get total player count
            const { count: total } = await supabase
              .from('leaderboard')
              .select('*', { count: 'exact', head: true });

            setTotalPlayers(total || 0);

            // Add player entry to the leaderboard for display
            setLeaderboard(prev => {
              // Don't add if already in the list
              if (prev.some(e => e.device_id === deviceId)) return prev;
              return [...prev, userEntry[0]];
            });
          }
        }
      } else {
        // Player is in top 10, find their rank
        const playerRank = topScores.findIndex(entry => entry.device_id === deviceId) + 1;
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
  const updateLeaderboardEntry = async (name: string, score: number) => {
    const deviceId = getDeviceId();
    setUpdating(true);
    setError(null); // Clear any previous errors

    try {
      logger.info(`Attempting to update leaderboard for ${name} with score ${score}`);
      
      // First, check if an entry already exists for this device
      const { data: existingEntries, error: fetchError } = await supabase
        .from('leaderboard')
        .select('id, best')
        .eq('device_id', deviceId)
        .limit(1);

      if (fetchError) {
        logger.error('Error checking existing leaderboard entry:', fetchError);
        setUpdating(false);
        setError("Failed to check leaderboard records. Please try again later.");
        return;
      }

      logger.debug('Existing entries found:', existingEntries);
      let updated = false;

      if (existingEntries && existingEntries.length > 0) {
        const currentEntry = existingEntries[0];
        logger.debug(`Current best score: ${currentEntry.best}, New score: ${score}`);

        // Only update if the new score is higher than the existing one
        if (score > currentEntry.best) {
          logger.info(`New high score detected! Updating from ${currentEntry.best} to ${score}`);
          
          const updateData = {
            name,
            best: score,
            updated_at: new Date().toISOString()
          };
          
          logger.debug('Update data:', updateData);
          logger.debug('Updating entry ID:', currentEntry.id);
          
          const { data: updateResult, error: updateError } = await supabase
            .from('leaderboard')
            .update(updateData)
            .eq('id', currentEntry.id)
            .select();

          if (updateError) {
            logger.error('Error updating leaderboard entry:', updateError);
            setUpdating(false);
            setError("Failed to update your score. Please try again later.");
            return;
          }

          logger.info('Update successful:', updateResult);
          updated = true;
        } else {
          logger.info(`Score ${score} is not higher than current best ${currentEntry.best}. No update needed.`);
        }
      } else {
        // No existing entry for this device, create a new one
        logger.info(`No existing entry found for device ${deviceId}. Creating new entry.`);
        
        const newEntry = {
          name,
          best: score,
          device_id: deviceId
        };
        
        logger.debug('New entry data:', newEntry);
        
        const { data: insertResult, error: insertError } = await supabase
          .from('leaderboard')
          .insert([newEntry])
          .select();

        if (insertError) {
          logger.error('Error creating leaderboard entry:', insertError);
          setUpdating(false);
          setError("Failed to create leaderboard entry. Please try again later.");
          return;
        }

        logger.info('Insert successful:', insertResult);
        updated = true;
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
