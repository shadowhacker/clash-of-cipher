/**
 * Master Game Configuration File
 * Contains all configurable game parameters in one place
 */

// Game timing and progression
export const MAX_ROUND_TIME = 10; // Maximum time for each round in seconds
export const STARTING_LIVES = 2; // Number of lives player starts with

// Level progression
export const MAX_LEVELS = 100; // Theoretical maximum level (game continues indefinitely)
export const MILESTONE_INTERVALS = {
    COLOR_CHANGE: 10, // Every 10 levels, theme color changes
    SYMBOL_PACK_CHANGE: 7, // Every 7 levels, symbol pack changes
    CODE_LENGTH_INCREASE: 4, // Every 4 levels, code length increases
    JACKPOT_BONUS: 20, // Every 20 levels, player gets jackpot bonus
};

// Symbol distribution
export const SYMBOL_CONFIG = {
    TOTAL_SYMBOLS: 34, // Total number of available symbols
    MIN_GRID_SYMBOLS: 8, // Minimum unique symbols in grid (early levels)
    MAX_GRID_SYMBOLS: 16, // Maximum unique symbols in grid (later levels)
    INITIAL_DIFFICULTY: 4, // Starting difficulty level, lower means easier
    MAX_DIFFICULTY: 10, // Highest difficulty (at what level we reach maximum difficulty)
    GRID_SIZE: 16, // Number of cells in the grid (4x4)
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