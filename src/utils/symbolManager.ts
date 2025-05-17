import { SYMBOL_CONFIG, MAX_REFERENCE_LEVEL } from '../config/gameConfig';
import { secureShuffleArray, secureRandomSample } from './randomUtils';
import logger from './logger';

// Array of all available symbol image filenames
export const MASTER_SYMBOLS = [
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

// Validate that MASTER_SYMBOLS.length matches SYMBOL_CONFIG.TOTAL_SYMBOLS
if (MASTER_SYMBOLS.length !== SYMBOL_CONFIG.TOTAL_SYMBOLS) {
    logger.warn(`Warning: MASTER_SYMBOLS.length (${MASTER_SYMBOLS.length}) does not match SYMBOL_CONFIG.TOTAL_SYMBOLS (${SYMBOL_CONFIG.TOTAL_SYMBOLS}). This may cause issues with symbol distribution.`);
}

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
export function getSymbolPack(level: number): string[] {
    // Each level uses a rotating selection from the master symbols
    // Always use a fresh random selection for variety
    return secureRandomSample(MASTER_SYMBOLS, calculateUniqueSymbolCount(level));
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
 * @returns Number of copies of each correct symbol
 */
export function calculateCorrectSymbolCopies(level: number, codeLength: number): number {
    const { MAX_CORRECT_SYMBOL_COPIES, MIN_CORRECT_SYMBOL_COPIES, GRID_SIZE } = SYMBOL_CONFIG;
    const progressRatio = calculateProgressRatio(level);

    // Calculate ideal maximum copies based on grid size and code length
    // This ensures we don't try to add too many copies at early levels
    const maxPossibleCopies = Math.floor(GRID_SIZE / (codeLength * 2));
    const adjustedMaxCopies = Math.min(MAX_CORRECT_SYMBOL_COPIES, maxPossibleCopies);

    // For levels 1-30, keep the original logic with more copies
    if (level <= 30) {
        // Linear reduction from max copies to min copies as difficulty increases
        const rawCopies = adjustedMaxCopies - ((adjustedMaxCopies - MIN_CORRECT_SYMBOL_COPIES) * progressRatio * 0.6);
        // Round to nearest integer and ensure at least minimum copies
        return Math.max(Math.round(rawCopies), MIN_CORRECT_SYMBOL_COPIES);
    } 
    // For levels 31-50, start reducing copies more aggressively
    else if (level <= 50) {
        // Faster reduction rate for these levels
        const rawCopies = adjustedMaxCopies - ((adjustedMaxCopies - MIN_CORRECT_SYMBOL_COPIES) * progressRatio * 0.8);
        return Math.max(Math.round(rawCopies), MIN_CORRECT_SYMBOL_COPIES);
    }
    // For levels 51+, make it much harder by reducing copies significantly
    else {
        // For high levels, use minimum copies plus a small chance of an extra copy
        // This makes the game significantly harder
        const extraCopyChance = Math.random() < 0.3 ? 1 : 0; // 30% chance of an extra copy
        return MIN_CORRECT_SYMBOL_COPIES + extraCopyChance;
    }
}

/**
 * Generate a grid with strategically distributed symbols
 * @param level - Current game level
 * @param codeSymbols - Symbols that must appear in the grid
 * @param availableSymbols - All symbols available for this level
 * @returns Grid of symbols
 */
export function generateGrid(
    level: number,
    codeSymbols: string[],
    availableSymbols: string[]
): string[] {
    const { GRID_SIZE } = SYMBOL_CONFIG;

    // 1. Create a set of remaining available symbols (excluding code symbols)
    const remainingSymbols = availableSymbols.filter(sym => !codeSymbols.includes(sym));

    // 2. Calculate how many copies of each code symbol to include
    const copiesPerSymbol = calculateCorrectSymbolCopies(level, codeSymbols.length);

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