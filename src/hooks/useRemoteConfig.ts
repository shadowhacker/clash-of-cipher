import { useEffect, useState, useCallback } from 'react';
import { fetchGameConfig } from '../utils/supabaseConfig';
import { initializeConfig } from '../config/gameConfig';

export function useRemoteConfig() {
  const [gameConfig, setGameConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching remote config...');
      // Use the initialization function that centralizes config loading
      const config = await initializeConfig();
      setGameConfig(config);
      setError(null);
      console.log('Remote config loaded successfully:', config);
      return config;
    } catch (err) {
      console.error('Error loading remote config:', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Only fetch if not already initialized
    if (!isInitialized) {
      fetchConfig().then(() => {
        // This handles the unmounted case during the async operation
        if (!mounted) return;
      });
    }
      
    return () => { mounted = false; };
  }, [fetchConfig, isInitialized]);

  // Extract the roundLogic from the gameConfig for backward compatibility
  const roundLogic = gameConfig?.ROUND_LOGIC || null;

  return { 
    config: gameConfig, 
    roundLogic, 
    loading, 
    error, 
    refreshConfig: fetchConfig,
    isInitialized 
  };
} 