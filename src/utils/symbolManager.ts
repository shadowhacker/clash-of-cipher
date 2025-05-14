import { SYMBOL_CONFIG, MILESTONE_INTERVALS } from '../config/gameConfig';
import { secureRandomInt, secureShuffleArray, secureRandomSample } from './randomUtils';

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

/**
 * Calculate the target difficulty based on current level
 * @param level - Current game level
 * @returns Difficulty value (higher means more difficult)
 */
export function calculateDifficulty(level: number): number {
    const { INITIAL_DIFFICULTY, MAX_DIFFICULTY } = SYMBOL_CONFIG;

    // Linear progression from initial to max difficulty
    const difficulty = INITIAL_DIFFICULTY + ((MAX_DIFFICULTY - INITIAL_DIFFICULTY) * (level - 1) / 50);

    // Clamp to max difficulty
    return Math.min(difficulty, MAX_DIFFICULTY);
}

/**
 * Calculate the number of unique symbols to use based on level and difficulty
 * @param level - Current game level 
 * @returns Number of unique symbols to use
 */
export function calculateUniqueSymbolCount(level: number): number {
    const { MIN_GRID_SYMBOLS, MAX_GRID_SYMBOLS } = SYMBOL_CONFIG;
    const difficulty = calculateDifficulty(level);

    // Calculate how many unique symbols to use (more at higher difficulty)
    const ratio = (difficulty - SYMBOL_CONFIG.INITIAL_DIFFICULTY) /
        (SYMBOL_CONFIG.MAX_DIFFICULTY - SYMBOL_CONFIG.INITIAL_DIFFICULTY);

    const uniqueCount = MIN_GRID_SYMBOLS + Math.floor((MAX_GRID_SYMBOLS - MIN_GRID_SYMBOLS) * ratio);

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
    // Calculate code length based on level (longer at higher levels)
    const codeLength = 2 + Math.floor((level - 1) / MILESTONE_INTERVALS.CODE_LENGTH_INCREASE);
    // Cap at 10 symbols max for playability
    const cappedLength = Math.min(codeLength, 10);

    // Always use a fresh random code
    return secureRandomSample(availableSymbols, cappedLength);
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

    // 2. Calculate difficulty-based distribution
    const difficulty = calculateDifficulty(level);
    const codeSymbolFrequency = Math.max(1, Math.floor(GRID_SIZE / codeSymbols.length / difficulty));

    // 3. Create initial grid with proper code symbol frequency
    let initialGrid: string[] = [];

    // Add each code symbol at least once
    initialGrid = [...codeSymbols];

    // Add additional copies of code symbols based on difficulty (easier levels get more)
    if (codeSymbolFrequency > 1) {
        for (let i = 0; i < codeSymbolFrequency - 1; i++) {
            initialGrid = [...initialGrid, ...secureRandomSample(codeSymbols, Math.min(codeSymbols.length, 2))];
        }
    }

    // 4. Fill remaining grid slots with other available symbols
    const remainingSlots = GRID_SIZE - initialGrid.length;

    if (remainingSlots > 0) {
        // If we have enough remaining symbols, use a sample
        // Otherwise, allow repeats from the same set by using more random samples
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