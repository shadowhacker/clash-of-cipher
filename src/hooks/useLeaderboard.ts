
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId, getPlayerName, savePlayerName } from '@/utils/deviceStorage';

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
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  
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
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('best', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error('Error fetching leaderboard:', error);
      } else {
        setLeaderboard(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update or create a leaderboard entry
  const updateLeaderboardEntry = async (name: string, score: number) => {
    const deviceId = getDeviceId();
    
    try {
      // First, check if an entry already exists for this device
      const { data: existingEntries } = await supabase
        .from('leaderboard')
        .select('id, best')
        .eq('device_id', deviceId)
        .limit(1);
      
      if (existingEntries && existingEntries.length > 0) {
        const currentEntry = existingEntries[0];
        
        // Only update if the new score is higher than the existing one
        if (score > currentEntry.best) {
          await supabase
            .from('leaderboard')
            .update({ 
              name, 
              best: score,
              updated_at: new Date().toISOString()
            })
            .eq('device_id', deviceId);
          
          // Refresh the leaderboard
          fetchLeaderboard();
        }
      } else {
        // No existing entry for this device, create a new one
        await supabase
          .from('leaderboard')
          .insert([{ 
            name, 
            best: score,
            device_id: deviceId
          }]);
        
        // Refresh the leaderboard
        fetchLeaderboard();
      }
    } catch (err) {
      console.error('Failed to update leaderboard:', err);
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
    fetchLeaderboard
  };
};
