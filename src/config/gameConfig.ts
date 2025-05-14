/**
 * Master Game Configuration File
 * Contains all configurable game parameters in one place
 */

// Game timing and progression
export const MAX_ROUND_TIME = 10; // Maximum time for each round in seconds
export const STARTING_LIVES = 2; // Number of lives player starts with

// Flash/Show code time configuration
export const SYMBOL_FLASH_TIME = {
    MAX: 2.0,    // Maximum flash time (seconds)
    MIN: 1.2,    // Minimum flash time (seconds)
    CYCLE: 20,   // Level cycle for flash time oscillation
};

// Symbol count progression by level
export const SYMBOL_COUNT = {
    LEVEL_10_RANGE: [1, 2] as [number, number],   // Symbol count range for levels 1-10
    LEVEL_20_RANGE: [2, 3] as [number, number],   // Symbol count range for levels 11-20
    LEVEL_30_RANGE: [3, 4] as [number, number],   // Symbol count range for levels 21-30
    LEVEL_50_RANGE: [4, 5] as [number, number],   // Symbol count range for levels 31-50
    MAX_COUNT: 5,             // Maximum symbol count (after level 50)
};

// Symbol distribution
export const SYMBOL_CONFIG = {
    TOTAL_SYMBOLS: 34,     // Total number of available symbols (must match MASTER_SYMBOLS.length)
    MIN_GRID_SYMBOLS: 8,   // Minimum unique symbols in grid (early levels)
    MAX_GRID_SYMBOLS: 16,  // Maximum unique symbols in grid (later levels)
    GRID_SIZE: 16,         // Number of cells in the grid (4x4)

    // Correct symbol distribution
    // At level 1, there will be this many copies of each correct symbol
    MAX_CORRECT_SYMBOL_COPIES: 3,

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

/**
 * Utility functions for game mechanics
 */

// Calculate flash time based on level with oscillating pattern
export const getFlashTime = (level: number): number => {
    const phase = Math.floor((level - 1) / SYMBOL_FLASH_TIME.CYCLE) % 2;  // 0 = down, 1 = up
    const index = (level - 1) % SYMBOL_FLASH_TIME.CYCLE;
    const step = (SYMBOL_FLASH_TIME.MAX - SYMBOL_FLASH_TIME.MIN) / (SYMBOL_FLASH_TIME.CYCLE - 1);

    return phase === 0
        ? SYMBOL_FLASH_TIME.MAX - (step * index)  // decreasing
        : SYMBOL_FLASH_TIME.MIN + (step * index); // increasing
};

// Get symbol count range based on level
export const getSymbolCountRange = (level: number): [number, number] => {
    if (level <= 10) return SYMBOL_COUNT.LEVEL_10_RANGE;
    if (level <= 20) return SYMBOL_COUNT.LEVEL_20_RANGE;
    if (level <= 30) return SYMBOL_COUNT.LEVEL_30_RANGE;
    if (level <= 50) return SYMBOL_COUNT.LEVEL_50_RANGE;
    return [SYMBOL_COUNT.MAX_COUNT, SYMBOL_COUNT.MAX_COUNT];
}; 