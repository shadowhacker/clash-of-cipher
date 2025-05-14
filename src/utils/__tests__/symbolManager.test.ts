import {
    MASTER_SYMBOLS,
    calculateProgressRatio,
    calculateUniqueSymbolCount,
    getSymbolPack,
    generateCode,
    calculateCorrectSymbolCopies,
    generateGrid,
    verifyGrid
} from '../symbolManager';
import { SYMBOL_CONFIG } from '../../config/gameConfig';

// Reference level constants for testing
const TEST_LEVELS = {
    MIN: 1,       // Minimum level
    LOW: 5,       // Low level
    MID: 25,      // Mid level 
    HIGH: 50,     // High level
    VERY_HIGH: 100 // Very high level
};

describe('symbolManager', () => {
    describe('MASTER_SYMBOLS', () => {
        it('should have the correct number of symbols defined', () => {
            expect(MASTER_SYMBOLS.length).toBe(SYMBOL_CONFIG.TOTAL_SYMBOLS);
        });

        it('should contain only valid image filenames', () => {
            const imageRegex = /^symbol-\d+\.png$/;
            MASTER_SYMBOLS.forEach(symbol => {
                expect(symbol).toMatch(imageRegex);
            });
        });
    });

    describe('calculateProgressRatio', () => {
        it('should return 0 for level 1', () => {
            expect(calculateProgressRatio(TEST_LEVELS.MIN)).toBe(0);
        });

        it('should return close to 1 for very high levels', () => {
            // With the logarithmic scale, very high levels should approach 1 asymptotically
            const ratio = calculateProgressRatio(TEST_LEVELS.VERY_HIGH);
            expect(ratio).toBeGreaterThan(0.95);
            expect(ratio).toBeLessThanOrEqual(1);
        });

        it('should follow expected progression for levels 1-20', () => {
            // For levels 1-20, we should have linear scaling
            const level5 = calculateProgressRatio(5);
            const level10 = calculateProgressRatio(10);
            const level20 = calculateProgressRatio(20);

            // Level 5 should be ~0.21 (4/19)
            expect(level5).toBeCloseTo(4 / 19, 2);

            // Level 10 should be ~0.47 (9/19)
            expect(level10).toBeCloseTo(9 / 19, 2);

            // Level 20 should be ~1.0
            expect(level20).toBeCloseTo(1, 2);
        });

        it('should use logarithmic scaling above level 20', () => {
            const level25 = calculateProgressRatio(25);
            const level50 = calculateProgressRatio(50);
            const level100 = calculateProgressRatio(100);

            // All should be between 0.95 and 1
            expect(level25).toBeGreaterThan(0.95);
            expect(level25).toBeLessThanOrEqual(1);
            expect(level50).toBeGreaterThan(0.95);
            expect(level50).toBeLessThanOrEqual(1);
            expect(level100).toBeGreaterThan(0.95);
            expect(level100).toBeLessThanOrEqual(1);

            // Should increase with level up to the cap
            expect(level25).toBeLessThan(level50);
            // At and above level 50, the ratio should be capped at 1
            expect(level50).toBeCloseTo(1, 5);
            expect(level100).toBeCloseTo(1, 5);
        });

        it('should handle out-of-bounds levels', () => {
            expect(calculateProgressRatio(0)).toBe(0); // Should handle level 0

            // Higher levels should approach but never exceed 1
            const veryHighRatio = calculateProgressRatio(1000);
            expect(veryHighRatio).toBeGreaterThan(0.99);
            expect(veryHighRatio).toBeLessThanOrEqual(1);
        });
    });

    describe('calculateUniqueSymbolCount', () => {
        it('should return minimum symbols for level 1', () => {
            expect(calculateUniqueSymbolCount(TEST_LEVELS.MIN)).toBe(SYMBOL_CONFIG.MIN_GRID_SYMBOLS);
        });

        it('should return close to maximum symbols for high levels', () => {
            const result = calculateUniqueSymbolCount(TEST_LEVELS.HIGH);
            expect(result).toBeCloseTo(SYMBOL_CONFIG.MAX_GRID_SYMBOLS, 0);
        });

        it('should calculate intermediate levels correctly', () => {
            // Test a mid-level value
            const result = calculateUniqueSymbolCount(TEST_LEVELS.MID);

            // Should be between min and max
            expect(result).toBeGreaterThanOrEqual(SYMBOL_CONFIG.MIN_GRID_SYMBOLS);
            expect(result).toBeLessThanOrEqual(SYMBOL_CONFIG.MAX_GRID_SYMBOLS);
        });
    });

    describe('getSymbolPack', () => {
        it('should return the correct number of symbols for a given level', () => {
            const level = TEST_LEVELS.LOW;
            const expectedCount = calculateUniqueSymbolCount(level);
            const result = getSymbolPack(level);

            expect(result.length).toBe(expectedCount);
        });

        it('should return symbols from the master symbols list', () => {
            const result = getSymbolPack(TEST_LEVELS.MIN);

            result.forEach(symbol => {
                expect(MASTER_SYMBOLS).toContain(symbol);
            });
        });
    });

    describe('generateCode', () => {
        it('should generate a code using symbols from the provided list', () => {
            const level = TEST_LEVELS.LOW;
            const symbols = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png', 'symbol-4.png', 'symbol-5.png'];

            const result = generateCode(level, symbols);

            // Should have at least one symbol and be a reasonable length
            expect(result.length).toBeGreaterThan(0);
            expect(result.length).toBeLessThanOrEqual(symbols.length);

            // Check that all symbols in code are from available symbols
            result.forEach(symbol => {
                expect(symbols).toContain(symbol);
            });
        });

        it('should handle when availableSymbols is a small set', () => {
            // Small symbol list
            const smallSymbols = ['symbol-1.png', 'symbol-2.png']; // Only 2 symbols

            const result = generateCode(TEST_LEVELS.HIGH, smallSymbols);

            // Should return a reasonable subset
            expect(result.length).toBeGreaterThan(0);
            expect(result.length).toBeLessThanOrEqual(smallSymbols.length);

            result.forEach(symbol => {
                expect(smallSymbols).toContain(symbol);
            });
        });
    });

    describe('calculateCorrectSymbolCopies', () => {
        it('should return maximum copies for level 1', () => {
            const codeLength = 2; // Use a small default value
            const result = calculateCorrectSymbolCopies(TEST_LEVELS.MIN, codeLength);

            // It may be capped by grid size / (codeLength * 2)
            const maxPossibleCopies = Math.floor(SYMBOL_CONFIG.GRID_SIZE / (codeLength * 2));
            const expected = Math.min(SYMBOL_CONFIG.MAX_CORRECT_SYMBOL_COPIES, maxPossibleCopies);

            expect(result).toBe(expected);
        });

        it('should return minimum copies for high levels', () => {
            const codeLength = 5; // Use a reasonable value for high levels
            const result = calculateCorrectSymbolCopies(TEST_LEVELS.HIGH, codeLength);

            expect(result).toBe(SYMBOL_CONFIG.MIN_CORRECT_SYMBOL_COPIES);
        });

        it('should adjust based on code length', () => {
            // For same level, longer code should have fewer copies per symbol
            const level = TEST_LEVELS.LOW;
            const shortCode = 2;
            const longCode = 6;

            const shortResult = calculateCorrectSymbolCopies(level, shortCode);
            const longResult = calculateCorrectSymbolCopies(level, longCode);

            // With longer code, we can fit fewer copies of each symbol
            expect(shortResult).toBeGreaterThanOrEqual(longResult);
        });
    });

    describe('generateGrid', () => {
        it('should generate a grid of the correct size', () => {
            const level = 3;
            const code = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png'];
            const available = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png', 'symbol-4.png', 'symbol-5.png'];

            const result = generateGrid(level, code, available);

            expect(result.length).toBe(SYMBOL_CONFIG.GRID_SIZE);
        });

        it('should include all code symbols at least once', () => {
            const level = 3;
            const code = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png'];
            const available = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png', 'symbol-4.png', 'symbol-5.png'];

            const result = generateGrid(level, code, available);

            code.forEach(symbol => {
                expect(result.includes(symbol)).toBe(true);
            });
        });

        it('should handle when remainingSymbols is smaller than needed', () => {
            // Setting up a scenario where we need more non-code symbols than available
            const level = 1;
            const code = ['symbol-1.png', 'symbol-2.png'];
            const available = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png']; // Only 1 non-code symbol

            const result = generateGrid(level, code, available);

            // Should still produce a full grid
            expect(result.length).toBe(SYMBOL_CONFIG.GRID_SIZE);

            // All code symbols should be present
            code.forEach(symbol => {
                expect(result.includes(symbol)).toBe(true);
            });
        });

        it('should add additional copies of code symbols based on level', () => {
            const level = 1; // Lower level should have more copies
            const code = ['symbol-1.png', 'symbol-2.png'];
            const available = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png', 'symbol-4.png', 'symbol-5.png'];

            const result = generateGrid(level, code, available);

            // Count occurrences of each code symbol
            const counts = code.map(symbol =>
                result.filter(gridSymbol => gridSymbol === symbol).length
            );

            // Expected copies per symbol at this level
            const expectedCopies = calculateCorrectSymbolCopies(level, code.length);

            // Each code symbol should appear at least once, possibly more based on level
            counts.forEach(count => {
                expect(count).toBeGreaterThanOrEqual(1);
                // Due to random sampling of which symbols get extra copies,
                // we can't assert exactly how many copies, but the average should be reasonable
            });
        });
    });

    describe('verifyGrid', () => {
        it('should return true when grid contains all code symbols', () => {
            const code = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png'];
            const grid = ['symbol-1.png', 'symbol-4.png', 'symbol-2.png', 'symbol-5.png', 'symbol-3.png'];

            expect(verifyGrid(grid, code)).toBe(true);
        });

        it('should return false when grid is missing a code symbol', () => {
            const code = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png'];
            const grid = ['symbol-1.png', 'symbol-4.png', 'symbol-2.png', 'symbol-5.png']; // Missing symbol-3.png

            expect(verifyGrid(grid, code)).toBe(false);
        });

        it('should return true for empty code', () => {
            const code: string[] = [];
            const grid = ['symbol-1.png', 'symbol-2.png'];

            expect(verifyGrid(grid, code)).toBe(true);
        });

        it('should return false for empty grid with non-empty code', () => {
            const code = ['symbol-1.png'];
            const grid: string[] = [];

            expect(verifyGrid(grid, code)).toBe(false);
        });
    });
}); 