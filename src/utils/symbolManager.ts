import { SYMBOL_CONFIG, MAX_REFERENCE_LEVEL, getRepeatCopiesRange } from '../config/gameConfig';
import { secureShuffleArray, secureRandomSample } from './randomUtils';
import logger from './logger';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { supabase } from '@/integrations/supabase/client';

// --- Auto-updating master symbols logic ---
let cachedSymbols: string[] | null = null;
let symbolsPromise: Promise<string[]> | null = null;
const subscribers: ((symbols: string[]) => void)[] = [];

async function fetchSymbolsFromSupabase(): Promise<string[]> {
  // Try to fetch from Supabase symbols table
  try {
    const { data, error } = await supabase
      .from('symbols')
      .select('symbols_json')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error || !data || !data.symbols_json?.symbols) throw error;
    
    // Return the symbols directly - they already have full URLs
    return data.symbols_json.symbols;
  } catch (err) {
    // Fallback to local default if fetch fails
    return [
    'symbol-1.png', 'symbol-2.png', 'symbol-3.png', 'symbol-4.png',
    'symbol-5.png', 'symbol-6.png', 'symbol-7.png', 'symbol-8.png',
    'symbol-9.png', 'symbol-10.png', 'symbol-11.png', 'symbol-12.png',
    'symbol-13.png', 'symbol-14.png', 'symbol-15.png', 'symbol-16.png',
    'symbol-17.png', 'symbol-18.png', 'symbol-19.png', 'symbol-20.png',
    'symbol-21.png', 'symbol-22.png', 'symbol-23.png', 'symbol-24.png',
    'symbol-25.png', 'symbol-26.png', 'symbol-27.png', 'symbol-28.png',
    'symbol-29.png', 'symbol-30.png', 'symbol-31.png', 'symbol-32.png',
    'symbol-33.png', 'symbol-34.png'
];
  }
}

export async function getMasterSymbols(forceRefresh = false): Promise<string[]> {
  if (cachedSymbols && !forceRefresh) return cachedSymbols;
  if (symbolsPromise && !forceRefresh) return symbolsPromise;
  symbolsPromise = (async () => {
    const symbols = await fetchSymbolsFromSupabase();
    cachedSymbols = symbols;
    // Notify subscribers
    subscribers.forEach(fn => fn(symbols));
    return symbols;
  })();
  return symbolsPromise;
}

export function subscribeMasterSymbols(cb: (symbols: string[]) => void) {
  subscribers.push(cb);
  // Immediately call with cached if available
  if (cachedSymbols) cb(cachedSymbols);
  // Return unsubscribe
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx !== -1) subscribers.splice(idx, 1);
  };
}

// Optionally, poll for updates every X seconds (auto-update)
const AUTO_UPDATE_INTERVAL = 60 * 1000; // 1 minute
setInterval(() => {
  getMasterSymbols(true);
}, AUTO_UPDATE_INTERVAL);

/**
 * Calculate a progress ratio (0.0 to 1.0) based on current level
 * This is the core difficulty scaling function used throughout the game
 * @param level - Current game level
 * @returns Difficulty ratio from 0.0 (easiest) to 1.0 (hardest)
 */
export function calculateProgressRatio(level: number): number {
    // With infinite levels, we'll use a logarithmic scale that approaches 1.0
    // This ensures difficulty still scales but more gradually at higher levels
    // We'll use level 50 as the reference point for "maximum" difficulty

    // Ensure level is at least 1
    const boundedLevel = Math.max(1, level);

    // For levels 1-20, use linear scaling
    if (boundedLevel <= 20) {
        return (boundedLevel - 1) / 19;
    }

    // For levels above 20, use logarithmic scaling that approaches 1.0
    // This formula gives ~0.95 at level 20 and approaches 1.0 asymptotically
    const ratio = 0.95 + ((Math.log(boundedLevel / 20) / Math.log(MAX_REFERENCE_LEVEL / 20)) * 0.05);

    // Clamp to 0.0-1.0 range for safety
    return Math.min(Math.max(ratio, 0), 1);
}

/**
 * Calculate the number of unique symbols to use based on level
 * @param level - Current game level 
 * @returns Number of unique symbols to use
 */
export function calculateUniqueSymbolCount(level: number): number {
    const { MIN_GRID_SYMBOLS, MAX_GRID_SYMBOLS } = SYMBOL_CONFIG;
    const progressRatio = calculateProgressRatio(level);

    // Linear progression from min to max symbols as level increases
    const uniqueCount = MIN_GRID_SYMBOLS + Math.floor((MAX_GRID_SYMBOLS - MIN_GRID_SYMBOLS) * progressRatio);

    // Ensure we always have at least the minimum count
    return Math.max(uniqueCount, MIN_GRID_SYMBOLS);
}

/**
 * Get a symbol pack based on the current level
 * @param level - Current game level
 * @returns Array of symbols for this level
 */
export async function getSymbolPack(level: number): Promise<string[]> {
    const masterSymbols = await getMasterSymbols();
    // Each level uses a rotating selection from the master symbols
    // Always use a fresh random selection for variety
    return secureRandomSample(masterSymbols, calculateUniqueSymbolCount(level));
}

/**
 * Generate a code sequence for the player to memorize
 * @param level - Current game level
 * @param availableSymbols - Symbols available for this level
 * @returns Array of symbol filenames forming the code
 */
export function generateCode(level: number, availableSymbols: string[]): string[] {
    // Always use a fresh random code, length is determined by the caller
    return secureRandomSample(availableSymbols, Math.min(3, availableSymbols.length));
}

/**
 * Calculate the number of copies of each correct symbol to include in the grid
 * @param level - Current game level
 * @param codeLength - Length of the code sequence
 * @param roundLogic - Optional round logic from remote config
 * @returns Number of copies of each correct symbol
 */
export function calculateCorrectSymbolCopies(level: number, codeLength: number, roundLogic: any[] | null = null): number {
    const { GRID_SIZE } = SYMBOL_CONFIG;

    // Calculate ideal maximum copies based on grid size and code length
    // This ensures we don't try to add too many copies at early levels
    const maxPossibleCopies = Math.floor(GRID_SIZE / (codeLength * 2));
    
    // Get copy range from the round logic if available
    const [minCopies, maxCopies] = getRepeatCopiesRange(level, roundLogic);
    
    // Adjust max copies to not exceed what's physically possible
    const adjustedMaxCopies = Math.min(maxCopies, maxPossibleCopies);
    
    // For early levels, use more copies (closer to max)
    // For later levels, use fewer copies (closer to min)
    const progressRatio = calculateProgressRatio(level);
    const rawCopies = adjustedMaxCopies - ((adjustedMaxCopies - minCopies) * progressRatio);
    
    // Round to nearest integer and ensure at least minimum copies
    return Math.max(Math.round(rawCopies), minCopies);
}

/**
 * Generate a grid with strategically distributed symbols
 * @param level - Current game level
 * @param codeSymbols - Symbols that must appear in the grid
 * @param availableSymbols - All symbols available for this level
 * @param roundLogic - Optional round logic from remote config
 * @returns Grid of symbols
 */
export function generateGrid(
    level: number,
    codeSymbols: string[],
    availableSymbols: string[],
    roundLogic: any[] | null = null
): string[] {
    const { GRID_SIZE } = SYMBOL_CONFIG;

    // Safety check - ensure availableSymbols is a valid array
    if (!Array.isArray(availableSymbols) || availableSymbols.length === 0) {
        console.error("Invalid availableSymbols in generateGrid:", availableSymbols);
        // Return a safe fallback grid of just code symbols repeated
        const safeGrid = [...codeSymbols];
        while (safeGrid.length < GRID_SIZE) {
            safeGrid.push(codeSymbols[Math.floor(Math.random() * codeSymbols.length)]);
        }
        return safeGrid;
    }

    // 1. Create a set of remaining available symbols (excluding code symbols)
    const remainingSymbols = availableSymbols.filter(sym => !codeSymbols.includes(sym));

    // 2. Calculate how many copies of each code symbol to include
    const copiesPerSymbol = calculateCorrectSymbolCopies(level, codeSymbols.length, roundLogic);

    // 3. Create initial grid with guaranteed code symbols
    let initialGrid: string[] = [];

    // First, add at least one copy of each code symbol to guarantee its presence
    initialGrid = [...codeSymbols];

    // Add additional copies of code symbols based on the calculated copies
    if (copiesPerSymbol > 1) {
        // For each additional copy needed beyond the first one
        for (let i = 1; i < copiesPerSymbol; i++) {
            // Take a subset of code symbols to add more copies of
            const extraSymbols = secureRandomSample(codeSymbols, Math.min(codeSymbols.length,
                Math.floor(GRID_SIZE / 4))); // Limit to 1/4 of grid size for balance
            initialGrid = [...initialGrid, ...extraSymbols];
        }
    }

    // 4. Fill remaining grid slots with other available symbols
    const remainingSlots = GRID_SIZE - initialGrid.length;

    if (remainingSlots > 0) {
        // If we have enough remaining symbols, use a sample
        // Otherwise, allow repeats from the same set
        if (remainingSymbols.length >= remainingSlots) {
            initialGrid = [...initialGrid, ...secureRandomSample(remainingSymbols, remainingSlots)];
        } else {
            // Fill with repeats if necessary
            let fillerSymbols = [];
            while (fillerSymbols.length < remainingSlots) {
                fillerSymbols = [
                    ...fillerSymbols,
                    ...secureRandomSample(remainingSymbols, Math.min(remainingSlots - fillerSymbols.length, remainingSymbols.length))
                ];
            }
            initialGrid = [...initialGrid, ...fillerSymbols];
        }
    }

    // 5. Shuffle final grid to distribute symbols randomly
    return secureShuffleArray(initialGrid);
}

/**
 * Verify the generated grid contains all code symbols
 * @param grid - The generated grid
 * @param code - The code sequence
 * @returns True if grid contains all code symbols
 */
export function verifyGrid(grid: string[], code: string[]): boolean {
    // Check that each code symbol appears at least once in the grid
    return code.every(symbol => grid.includes(symbol));
} 