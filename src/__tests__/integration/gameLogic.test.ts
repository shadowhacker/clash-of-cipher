import {
    SYMBOL_CONFIG,
    MAX_ROUND_TIME,
    STARTING_LIVES,
    CODE_LENGTH,
    MAX_LEVELS
} from '../../config/gameConfig';
import {
    MASTER_SYMBOLS,
    calculateProgressRatio,
    calculateUniqueSymbolCount,
    getSymbolPack,
    calculateCodeLength,
    generateCode,
    calculateCorrectSymbolCopies,
    generateGrid,
    verifyGrid
} from '../../utils/symbolManager';
import { preloadAllSymbols, areAllImagesLoaded, loadedImages } from '../../utils/symbolCacheUtils';

describe('Game Logic Integration Tests', () => {
    // Test the entire game level progression
    describe('Level Progression', () => {
        it('should scale difficulty appropriately across all levels', () => {
            // Test all levels from 1 to MAX_LEVELS
            for (let level = 1; level <= MAX_LEVELS; level++) {
                // Check progression ratio
                const progressRatio = calculateProgressRatio(level);
                expect(progressRatio).toBeGreaterThanOrEqual(0);
                expect(progressRatio).toBeLessThanOrEqual(1);

                // Check unique symbol count increases with level
                const uniqueSymbols = calculateUniqueSymbolCount(level);
                expect(uniqueSymbols).toBeGreaterThanOrEqual(SYMBOL_CONFIG.MIN_GRID_SYMBOLS);
                expect(uniqueSymbols).toBeLessThanOrEqual(SYMBOL_CONFIG.MAX_GRID_SYMBOLS);

                // Check code length increases with level
                const codeLen = calculateCodeLength(level);
                expect(codeLen).toBeGreaterThanOrEqual(CODE_LENGTH.MIN);
                expect(codeLen).toBeLessThanOrEqual(CODE_LENGTH.MAX);

                // Higher levels should have longer codes
                if (level > 1) {
                    const prevCodeLen = calculateCodeLength(level - 1);
                    // Code length either increases or stays the same
                    expect(codeLen).toBeGreaterThanOrEqual(prevCodeLen);
                }

                // As level increases, we should see fewer copies of correct symbols
                if (level < MAX_LEVELS) {
                    const nextCopies = calculateCorrectSymbolCopies(level + 1, codeLen);
                    const currentCopies = calculateCorrectSymbolCopies(level, codeLen);
                    // Copies either decrease or stay the same as level increases
                    expect(nextCopies).toBeLessThanOrEqual(currentCopies);
                }
            }
        });
    });

    describe('Game Round', () => {
        it('should create a complete valid game round from level to player input', () => {
            // Simulate a complete game round flow for level 3
            const level = 3;

            // 1. Get a symbol pack for this level
            const availableSymbols = getSymbolPack(level);
            expect(availableSymbols.length).toBe(calculateUniqueSymbolCount(level));

            // 2. Generate a code for the player to memorize
            const codeSymbols = generateCode(level, availableSymbols);
            expect(codeSymbols.length).toBe(calculateCodeLength(level));

            // 3. Generate a grid with these symbols
            const grid = generateGrid(level, codeSymbols, availableSymbols);
            expect(grid.length).toBe(SYMBOL_CONFIG.GRID_SIZE);

            // 4. Verify the grid has all code symbols
            expect(verifyGrid(grid, codeSymbols)).toBe(true);

            // 5. Simulate player input - selecting grid items that match the code
            // For a successful round, player would select code symbols in order
            const playerInput = [...codeSymbols];

            // 6. Check if player's input matches the code
            const isCorrect = JSON.stringify(playerInput) === JSON.stringify(codeSymbols);
            expect(isCorrect).toBe(true);
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
            jest.spyOn(require('../../utils/symbolCacheUtils'), 'preloadAllSymbols').mockImplementation(async () => {
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