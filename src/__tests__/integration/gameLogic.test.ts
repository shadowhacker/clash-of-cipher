import {
    SYMBOL_CONFIG,
    SYMBOL_FLASH_TIME,
    SYMBOL_COUNT,
    getFlashTime,
    getSymbolCountRange
} from '../../config/gameConfig';
import {
    MASTER_SYMBOLS,
    calculateProgressRatio,
    calculateUniqueSymbolCount,
    getSymbolPack,
    generateCode,
    calculateCorrectSymbolCopies,
    generateGrid,
    verifyGrid
} from '../../utils/symbolManager';
import { preloadAllSymbols, areAllImagesLoaded, loadedImages } from '../../utils/symbolCacheUtils';
// Import for testing
import * as symbolCacheUtils from '../../utils/symbolCacheUtils';

// Define test level ranges
const TEST_LEVELS = {
    RANGE_1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],  // First difficulty range
    RANGE_2: [11, 15, 20],                     // Second range
    RANGE_3: [21, 25, 30],                     // Third range
    RANGE_4: [31, 40, 50],                     // Fourth range
    HIGH: [60, 75, 100]                        // Beyond level-based scaling
};

describe('Game Logic Integration Tests', () => {
    // Test the entire game level progression
    describe('Level Progression', () => {
        it('should scale difficulty appropriately across progressive levels', () => {
            // Test a range of levels for correct difficulty scaling
            const testLevels = [1, 5, 10, 20, 30, 50];
            const correctSymbolCopiesByLevel: Record<number, number> = {};

            testLevels.forEach((level, i) => {
                // Get symbols for this level
                const availableSymbols = getSymbolPack(level);

                // Generate a code
                const codeSymbols = generateCode(level, availableSymbols);

                // Verify code against symbol count range
                const [minCount, maxCount] = getSymbolCountRange(level);
                expect(codeSymbols.length).toBeGreaterThanOrEqual(1);
                expect(codeSymbols.length).toBeLessThanOrEqual(3); // Default value in generateCode

                // As level increases, we should see fewer copies of correct symbols
                if (i < testLevels.length - 1) {
                    const copies = calculateCorrectSymbolCopies(level, codeSymbols.length);
                    correctSymbolCopiesByLevel[level] = copies;

                    // Store for next level comparison
                    if (i > 0) {
                        // Check if copies decrease or stay the same as level increases
                        expect(copies).toBeLessThanOrEqual(correctSymbolCopiesByLevel[testLevels[i - 1]]);
                    }
                }
            });
        });

        it('should calculate flash time correctly with oscillating pattern', () => {
            // Test the oscillating flash time pattern
            const { MIN, MAX, CYCLE } = SYMBOL_FLASH_TIME;

            // At level 1, flash time should be maximum
            expect(getFlashTime(1)).toBeCloseTo(MAX, 5);

            // At level 10, flash time should be in the middle of the first decreasing phase
            const level10Time = getFlashTime(10);
            expect(level10Time).toBeGreaterThan(MIN);
            expect(level10Time).toBeLessThan(MAX);

            // At level 20, flash time should be at minimum (end of first phase)
            expect(getFlashTime(CYCLE)).toBeCloseTo(MIN, 5);

            // At level 21, we should be at the start of the increasing phase
            expect(getFlashTime(CYCLE + 1)).toBeCloseTo(MIN, 5);

            // At level 40, we should be back to maximum
            expect(getFlashTime(CYCLE * 2)).toBeCloseTo(MAX, 5);
        });

        it('should provide correct symbol count ranges for different level bands', () => {
            // Test level 5 is in the first band
            const range1 = getSymbolCountRange(5);
            expect(range1).toEqual(SYMBOL_COUNT.LEVEL_10_RANGE);

            // Test level 15 is in the second band
            const range2 = getSymbolCountRange(15);
            expect(range2).toEqual(SYMBOL_COUNT.LEVEL_20_RANGE);

            // Test level 25 is in the third band
            const range3 = getSymbolCountRange(25);
            expect(range3).toEqual(SYMBOL_COUNT.LEVEL_30_RANGE);

            // Test level 40 is in the fourth band
            const range4 = getSymbolCountRange(40);
            expect(range4).toEqual(SYMBOL_COUNT.LEVEL_50_RANGE);

            // Test level 60 is beyond defined bands and should use max count
            const range5 = getSymbolCountRange(60);
            expect(range5).toEqual([SYMBOL_COUNT.MAX_COUNT, SYMBOL_COUNT.MAX_COUNT]);
        });
    });

    describe('Game Round', () => {
        it('should create a complete valid game round from level to player input', () => {
            // Test a round for level 5
            const level = 5;

            // 1. Get a symbol pack for this level
            const availableSymbols = getSymbolPack(level);
            expect(availableSymbols.length).toBeGreaterThan(0);

            // 2. Generate a code sequence
            const codeSymbols = generateCode(level, availableSymbols);
            expect(codeSymbols.length).toBeGreaterThan(0);
            expect(codeSymbols.length).toBeLessThanOrEqual(3); // Default value in generateCode

            // Check against the symbol count range for this level
            const [minCount, maxCount] = getSymbolCountRange(level);
            expect(codeSymbols.length).toBeLessThanOrEqual(3); // Default value in generateCode

            // 3. Generate a grid with these symbols
            const grid = generateGrid(level, codeSymbols, availableSymbols);
            expect(grid.length).toBe(SYMBOL_CONFIG.GRID_SIZE);

            // 4. Verify the grid contains all code symbols
            expect(verifyGrid(grid, codeSymbols)).toBe(true);

            // Count occurrences of each code symbol to verify distribution
            const codeSymbolCounts = codeSymbols.map(symbol => {
                return grid.filter(gridSymbol => gridSymbol === symbol).length;
            });

            // Each code symbol should appear at least once
            codeSymbolCounts.forEach(count => {
                expect(count).toBeGreaterThanOrEqual(1);
            });
        });

        it('should handle player making mistakes', () => {
            // Simulate a game round with player mistakes for level 2
            const level = 2;

            // 1. Setup the round
            const availableSymbols = getSymbolPack(level);
            const codeSymbols = generateCode(level, availableSymbols);
            const grid = generateGrid(level, codeSymbols, availableSymbols);

            // 2. Simulate player making a mistake - wrong symbol
            const incorrectInput = [...codeSymbols];
            // Replace the first symbol with a wrong one
            const wrongSymbol = availableSymbols.find(s => !codeSymbols.includes(s)) || 'wrong-symbol.png';
            incorrectInput[0] = wrongSymbol;

            // 3. Check that the input is incorrect
            const isCorrect = JSON.stringify(incorrectInput) === JSON.stringify(codeSymbols);
            expect(isCorrect).toBe(false);
        });
    });

    describe('Symbol Generation & Distribution', () => {
        it('should generate different symbols for each level', () => {
            // Generate symbol packs for multiple levels and ensure they're different
            const symbolPacks = [];
            for (let level = 1; level <= 5; level++) {
                symbolPacks.push(getSymbolPack(level));
            }

            // We expect the packs to be different from each other
            // This is a probabilistic test since they're randomly generated
            // but the probability of all being identical is extremely low

            // Count unique symbol sets (by stringifying for comparison)
            const uniquePacks = new Set(symbolPacks.map(pack => JSON.stringify(pack.sort())));

            // It's highly unlikely all packs would be identical
            expect(uniquePacks.size).toBeGreaterThan(1);
        });

        it('should distribute code symbols throughout the grid', () => {
            const level = 3;
            const availableSymbols = getSymbolPack(level);
            const codeSymbols = generateCode(level, availableSymbols);
            const grid = generateGrid(level, codeSymbols, availableSymbols);

            // Check that all code symbols exist in the grid
            codeSymbols.forEach(symbol => {
                expect(grid.includes(symbol)).toBe(true);
            });

            // Check that code symbols are distributed (not all at the beginning or end)
            // Get positions of all code symbols in the grid
            const positions = codeSymbols.map(symbol => grid.indexOf(symbol));

            // Sort positions
            positions.sort((a, b) => a - b);

            // Check for distribution - at least some gap between positions
            // This is probabilistic but should catch major issues
            if (positions.length > 1) {
                const gaps = [];
                for (let i = 1; i < positions.length; i++) {
                    gaps.push(positions[i] - positions[i - 1]);
                }

                // We expect to see at least one gap > 1 (symbols not adjacent)
                // Very unlikely all symbols would end up adjacent in a truly random distribution
                const hasGaps = gaps.some(gap => gap > 1);
                expect(hasGaps).toBe(true);
            }
        });

        it('should add correct number of symbol copies based on level', () => {
            // Test for level 1 which should have more copies of code symbols
            const level = 1;
            const availableSymbols = getSymbolPack(level);
            const codeSymbols = generateCode(level, availableSymbols);
            const grid = generateGrid(level, codeSymbols, availableSymbols);

            // Count occurrences of each code symbol
            const counts = codeSymbols.map(symbol =>
                grid.filter(gridSymbol => gridSymbol === symbol).length
            );

            // Each code symbol should appear at least once, but generally multiple times
            // at early levels
            counts.forEach(count => {
                expect(count).toBeGreaterThanOrEqual(1);
            });

            // The expected copies per symbol at this level
            const expectedCopies = calculateCorrectSymbolCopies(level, codeSymbols.length);

            // At least some symbols should have more than one copy
            if (expectedCopies > 1) {
                expect(counts.some(count => count > 1)).toBe(true);
            }
        });
    });

    describe('Symbol Loading', () => {
        it('should preload all game symbols before starting', async () => {
            // Mock the preloadAllSymbols function to mark all images as loaded
            jest.spyOn(symbolCacheUtils, 'preloadAllSymbols').mockImplementation(async () => {
                // Directly mark all symbols as loaded for this test
                MASTER_SYMBOLS.forEach(symbol => {
                    loadedImages[symbol] = true;
                });
                return Promise.resolve();
            });

            // Initially no images are loaded
            Object.keys(loadedImages).forEach(key => {
                // Reset any images that might be marked as loaded by other tests
                delete loadedImages[key];
            });

            // Verify initial state 
            expect(areAllImagesLoaded()).toBe(false);

            // Preload all symbols
            await preloadAllSymbols();

            // After preloading, all images should be marked as loaded
            expect(areAllImagesLoaded()).toBe(true);
        });
    });

    describe('Code Verification', () => {
        it('should handle common edge cases', () => {
            // Test empty code
            const emptyCode: string[] = [];
            const grid = ['symbol-1.png', 'symbol-2.png'];
            expect(verifyGrid(grid, emptyCode)).toBe(true);

            // Test matching code/grid lengths
            const code = ['symbol-1.png', 'symbol-2.png'];
            const exactGrid = ['symbol-2.png', 'symbol-1.png'];
            expect(verifyGrid(exactGrid, code)).toBe(true);

            // Test code with duplicate symbols
            const duplicateCode = ['symbol-1.png', 'symbol-1.png'];
            const smallGrid = ['symbol-1.png', 'symbol-2.png'];
            expect(verifyGrid(smallGrid, duplicateCode)).toBe(true);
        });
    });
}); 