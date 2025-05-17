/**
 * Master Game Configuration File
 * Contains all configurable game parameters in one place
 */

// Game timing and progression
export const MAX_ROUND_TIME = 10; // Maximum time for each round in seconds
export const STARTING_LIVES = 2; // Number of lives player starts with

// Flash/Show code time configuration
export const SYMBOL_FLASH_TIME = {
    MAX_HIGH: 2.0,    // Maximum flash time for easier rounds (seconds)
    MIN_HIGH: 1.5,    // Minimum flash time for easier rounds (seconds)
    MAX_LOW: 1.5,     // Maximum flash time for harder rounds (seconds)
    MIN_LOW: 1.2,     // Minimum flash time for harder rounds (seconds)
    CYCLE: 20,        // Level cycle for flash time oscillation
};

// Symbol count progression by level
export const SYMBOL_COUNT = {
    LEVEL_30_RANGE: [1, 2] as [number, number],   // Symbol count range for levels 1-30
    LEVEL_50_RANGE: [2, 3] as [number, number],   // Symbol count range for levels 31-50
    MAX_RANGE: [3, 4] as [number, number],        // Symbol count range for levels 51+
};

// Symbol distribution
export const SYMBOL_CONFIG = {
    TOTAL_SYMBOLS: 34,     // Total number of available symbols (must match MASTER_SYMBOLS.length)
    MIN_GRID_SYMBOLS: 8,   // Minimum unique symbols in grid (early levels)
    MAX_GRID_SYMBOLS: 16,  // Maximum unique symbols in grid (later levels)
    GRID_SIZE: 16,         // Number of cells in the grid (4x4)

    // Correct symbol distribution
    // At level 1, there will be this many copies of each correct symbol
    MAX_CORRECT_SYMBOL_COPIES: 6,

    // At max level, ensure at least this many copies of each correct symbol
    MIN_CORRECT_SYMBOL_COPIES: 1
};

// Color themes for level milestones
export const MILESTONE_INTERVALS = {
    COLOR_CHANGE: 10,      // Every 10 levels, theme color changes
    SYMBOL_PACK_CHANGE: 7, // Every 7 levels, symbol pack changes
    JACKPOT_BONUS: 20      // Every 20 levels, player gets jackpot bonus
};

// Color themes for different level milestones
export const THEME_COLORS = [
    'bg-amber-500',
    'bg-emerald-500',
    'bg-sky-500',
    'bg-fuchsia-500',
    'bg-rose-500',
];

// Scoring system
export const SCORING = {
    BASE_MULTIPLIER: 1.25, // Flawless streak multiplier
    SPEED_BONUS_FACTOR: 0.1, // Speed bonus per second remaining
    JACKPOT_BONUS: 1000, // Bonus points for jackpot rounds
};

export const MAX_REFERENCE_LEVEL = 50;

/**
 * Utility functions for game mechanics
 */

// Calculate flash time based on level with oscillating pattern
export const getFlashTime = (level: number): number => {
    // Determine which 20-level bracket we're in (0-indexed)
    const bracket = Math.floor((level - 1) / SYMBOL_FLASH_TIME.CYCLE);
    
    // Determine if we're in an "easy" or "hard" bracket
    // Even brackets (0, 2, 4...) use higher times (1.5-2.0s)
    // Odd brackets (1, 3, 5...) use lower times (1.2-1.5s)
    const isEasyBracket = bracket % 2 === 0;
    
    // Position within the current 20-level bracket (0-19)
    const positionInBracket = (level - 1) % SYMBOL_FLASH_TIME.CYCLE;
    
    if (isEasyBracket) {
        // Easy bracket: oscillate between 1.5-2.0 seconds
        const step = (SYMBOL_FLASH_TIME.MAX_HIGH - SYMBOL_FLASH_TIME.MIN_HIGH) / (SYMBOL_FLASH_TIME.CYCLE - 1);
        // Start high (2.0s), gradually decrease to low (1.5s)
        return SYMBOL_FLASH_TIME.MAX_HIGH - (step * positionInBracket);
    } else {
        // Hard bracket: oscillate between 1.2-1.5 seconds
        const step = (SYMBOL_FLASH_TIME.MAX_LOW - SYMBOL_FLASH_TIME.MIN_LOW) / (SYMBOL_FLASH_TIME.CYCLE - 1);
        // Start high (1.5s), gradually decrease to low (1.2s)
        return SYMBOL_FLASH_TIME.MAX_LOW - (step * positionInBracket);
    }
};

// Get symbol count range based on level
export const getSymbolCountRange = (level: number): [number, number] => {
    if (level <= 30) return SYMBOL_COUNT.LEVEL_30_RANGE;
    if (level <= 50) return SYMBOL_COUNT.LEVEL_50_RANGE;
    return SYMBOL_COUNT.MAX_RANGE;
}; 