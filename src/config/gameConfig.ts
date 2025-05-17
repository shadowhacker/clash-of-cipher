/**
 * Master Game Configuration File
 * Contains all configurable game parameters in one place
 */
import defaultConfig from './gameConfig.json';
import { fetchGameConfig } from '../utils/supabaseConfig';

// Store the config that will be used
let activeConfig = defaultConfig;

// Function to initialize config from Supabase
export async function initializeConfig() {
  try {
    // Attempt to fetch from Supabase
    const remoteConfig = await fetchGameConfig();
    if (remoteConfig) {
      // Update the active config with the remote data
      // Use type assertion to tell TypeScript this has the same structure as defaultConfig
      activeConfig = remoteConfig as typeof defaultConfig;
      console.log('Using remote config from Supabase:', remoteConfig);
      return remoteConfig;
    }
  } catch (error) {
    console.error('Error initializing remote config, using default:', error);
  }
  return defaultConfig;
}

// Call initialization (the result can be awaited elsewhere if needed)
initializeConfig();

// Export the active config as a function to always get the latest
export const getConfig = () => activeConfig;

// Export static values as functions to always get the latest values
export const getMaxRoundTime = () => activeConfig.MAX_ROUND_TIME;
export const getStartingLives = () => activeConfig.STARTING_LIVES;
export const getThemeColors = () => activeConfig.THEME_COLORS;
export const getMilestoneIntervals = () => activeConfig.MILESTONE_INTERVALS;
export const getScoring = () => activeConfig.SCORING;
export const getSymbolConfig = () => activeConfig.SYMBOL_CONFIG;
export const getMaxReferenceLevel = () => activeConfig.MAX_REFERENCE_LEVEL;
export const getRoundLogic = () => activeConfig.ROUND_LOGIC;
export const getInitialCountdown = () => activeConfig.INITIAL_COUNTDOWN; // Default to 5 if not set

// For backward compatibility, export direct references too
// These won't update when remote config loads
export const MAX_ROUND_TIME = defaultConfig.MAX_ROUND_TIME;
export const STARTING_LIVES = defaultConfig.STARTING_LIVES;
export const THEME_COLORS = defaultConfig.THEME_COLORS;
export const MILESTONE_INTERVALS = defaultConfig.MILESTONE_INTERVALS;
export const SCORING = defaultConfig.SCORING;
export const SYMBOL_CONFIG = defaultConfig.SYMBOL_CONFIG;
export const MAX_REFERENCE_LEVEL = defaultConfig.MAX_REFERENCE_LEVEL;

// For backward compatibility, we alias CONFIG_DEFAULTS to the getter
export const CONFIG_DEFAULTS = activeConfig;

/**
 * Utility functions for game mechanics using the new ROUND_LOGIC structure
 */

// Get the appropriate round logic bracket for a given level
export function getRoundLogicBracket(level: number, roundLogic: any[] | null) {
  // If explicit roundLogic is provided, use it
  if (roundLogic && roundLogic.length) {
    return roundLogic.find((r) =>
      level >= r.level_start && level <= r.level_end
    );
  }

  // Otherwise use the active config
  const currentRoundLogic = activeConfig.ROUND_LOGIC;
  return currentRoundLogic.find((r) =>
    level >= r.level_start && level <= r.level_end
  );
}

// Calculate flash time based on level and round logic
export const getFlashTime = (level: number): number => {
  // Use local config when no remote config is available
  const bracket = getRoundLogicBracket(level, null);
  if (!bracket) return 1.5; // fallback

  // Get random value in the flash_time range
  const [min, max] = bracket.flash_time;
  return min + Math.random() * (max - min);
};

// Get symbol count range based on level
export const getSymbolCountRange = (level: number): [number, number] => {
  // Use local config when no remote config is available
  const bracket = getRoundLogicBracket(level, null);
  if (!bracket) return [1, 2]; // fallback

  return bracket.icon_count;
};

// Utility to get flash time for a level from remote roundLogic
export function getRemoteFlashTime(level: number, roundLogic: any[]): number {
  // Find the matching round logic bracket
  const bracket = getRoundLogicBracket(level, roundLogic);
  if (!bracket) return 1.5; // fallback

  // Use a random value in the flash_time range
  const [min, max] = bracket.flash_time;
  return min + Math.random() * (max - min);
}

// Utility to get symbol count range for a level from remote roundLogic
export function getRemoteSymbolCountRange(level: number, roundLogic: any[]): [number, number] {
  const bracket = getRoundLogicBracket(level, roundLogic);
  if (!bracket) return [1, 2]; // fallback
  return bracket.icon_count;
}

// Get repeat copies range for a level from round logic
export function getRepeatCopiesRange(level: number, roundLogic: any[] | null): [number, number] {
  const bracket = getRoundLogicBracket(level, roundLogic);
  if (!bracket) return [1, 3]; // fallback
  return bracket.repeat_copies;
}