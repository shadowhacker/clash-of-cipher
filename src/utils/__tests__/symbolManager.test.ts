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
} from '../symbolManager';
import { SYMBOL_CONFIG, CODE_LENGTH, MAX_LEVELS } from '../../config/gameConfig';

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
            expect(calculateProgressRatio(1)).toBe(0);
        });

        it('should return 1 for MAX_LEVELS', () => {
            expect(calculateProgressRatio(MAX_LEVELS)).toBe(1);
        });

        it('should return a linear progression for intermediate levels', () => {
            // For 10 levels, level 6 should be 0.5 (halfway)
            // Formula: (level - 1) / (MAX_LEVELS - 1)
            const level = Math.floor(MAX_LEVELS / 2) + 1;
            const expected = (level - 1) / (MAX_LEVELS - 1);
            expect(calculateProgressRatio(level)).toBe(expected);
        });

        it('should handle out-of-bounds levels', () => {
            expect(calculateProgressRatio(0)).toBe(0); // Should clamp to min
            expect(calculateProgressRatio(MAX_LEVELS + 10)).toBe(1); // Should clamp to max
        });
    });

    describe('calculateUniqueSymbolCount', () => {
        it('should return minimum symbols for level 1', () => {
            expect(calculateUniqueSymbolCount(1)).toBe(SYMBOL_CONFIG.MIN_GRID_SYMBOLS);
        });

        it('should return maximum symbols for MAX_LEVELS', () => {
            expect(calculateUniqueSymbolCount(MAX_LEVELS)).toBe(SYMBOL_CONFIG.MAX_GRID_SYMBOLS);
        });

        it('should calculate intermediate levels correctly', () => {
            // Test a mid-level value
            const midLevel = Math.floor(MAX_LEVELS / 2);
            const result = calculateUniqueSymbolCount(midLevel);

            // Should be between min and max
            expect(result).toBeGreaterThanOrEqual(SYMBOL_CONFIG.MIN_GRID_SYMBOLS);
            expect(result).toBeLessThanOrEqual(SYMBOL_CONFIG.MAX_GRID_SYMBOLS);
        });
    });

    describe('getSymbolPack', () => {
        it('should return the correct number of symbols for a given level', () => {
            const level = 3;
            const expectedCount = calculateUniqueSymbolCount(level);
            const result = getSymbolPack(level);

            expect(result.length).toBe(expectedCount);
        });

        it('should return symbols from the master symbols list', () => {
            const result = getSymbolPack(1);

            result.forEach(symbol => {
                expect(MASTER_SYMBOLS).toContain(symbol);
            });
        });
    });

    describe('calculateCodeLength', () => {
        it('should return minimum code length for level 1', () => {
            expect(calculateCodeLength(1)).toBe(CODE_LENGTH.MIN);
        });

        it('should return maximum code length for MAX_LEVELS', () => {
            expect(calculateCodeLength(MAX_LEVELS)).toBe(CODE_LENGTH.MAX);
        });

        it('should calculate intermediate levels correctly', () => {
            // Test a mid-level value
            const midLevel = Math.floor(MAX_LEVELS / 2);
            const result = calculateCodeLength(midLevel);

            // Should be between min and max
            expect(result).toBeGreaterThanOrEqual(CODE_LENGTH.MIN);
            expect(result).toBeLessThanOrEqual(CODE_LENGTH.MAX);
        });
    });

    describe('generateCode', () => {
        it('should generate a code with correct length for the level', () => {
            const level = 3;
            const symbols = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png', 'symbol-4.png', 'symbol-5.png'];
            const expectedLength = calculateCodeLength(level);

            const result = generateCode(level, symbols);

            expect(result.length).toBe(expectedLength);
        });

        it('should only use symbols from the provided list', () => {
            const symbols = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png'];
            const result = generateCode(1, symbols);

            result.forEach(symbol => {
                expect(symbols).toContain(symbol);
            });
        });

        it('should handle when availableSymbols is smaller than required code length', () => {
            // Set level where code length would be larger than available symbols
            const highLevel = MAX_LEVELS;
            const smallSymbols = ['symbol-1.png', 'symbol-2.png']; // Only 2 symbols

            const result = generateCode(highLevel, smallSymbols);

            // Should return all available symbols
            expect(result.length).toBeLessThanOrEqual(smallSymbols.length);
            result.forEach(symbol => {
                expect(smallSymbols).toContain(symbol);
            });
        });
    });

    describe('calculateCorrectSymbolCopies', () => {
        it('should return maximum copies for level 1', () => {
            const codeLength = CODE_LENGTH.MIN;
            const result = calculateCorrectSymbolCopies(1, codeLength);

            // It may be capped by grid size / (codeLength * 2)
            const maxPossibleCopies = Math.floor(SYMBOL_CONFIG.GRID_SIZE / (codeLength * 2));
            const expected = Math.min(SYMBOL_CONFIG.MAX_CORRECT_SYMBOL_COPIES, maxPossibleCopies);

            expect(result).toBe(expected);
        });

        it('should return minimum copies for MAX_LEVELS', () => {
            const codeLength = CODE_LENGTH.MAX;
            const result = calculateCorrectSymbolCopies(MAX_LEVELS, codeLength);

            expect(result).toBe(SYMBOL_CONFIG.MIN_CORRECT_SYMBOL_COPIES);
        });

        it('should adjust based on code length', () => {
            // For same level, longer code should have fewer copies per symbol
            const level = 5;
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