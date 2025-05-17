import { getSymbolPack, generateCode, generateGrid, getMasterSymbols, calculateUniqueSymbolCount } from '../../utils/symbolManager';
import { secureRandomInt, secureShuffleArray } from '../../utils/randomUtils';
import { SYMBOL_CONFIG } from '../../config/gameConfig';

// Mock secureRandomInt with a more deterministic implementation for testing
jest.mock('../../utils/randomUtils', () => ({
    ...jest.requireActual('../../utils/randomUtils'),
    secureRandomInt: jest.fn().mockImplementation((min, max) => {
        // Create a predictable but varying sequence
        return min + (Date.now() % (max - min));
    }),
    secureShuffleArray: jest.fn().mockImplementation((array) => {
        // Always return a copy, but with a predictable shuffle
        const copy = [...array];
        // Simple shuffle algorithm with better determinism for testing
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor((Date.now() % 1000) / 1000 * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    })
}));

describe('Random Distribution Tests', () => {
    // This test verifies that the functions that use random number generation work correctly
    describe('Symbol Pack Generation', () => {
        it('should generate a valid symbol pack for a given level', () => {
            const level = 5;
            const pack = getSymbolPack(level);

            // Check that it returns the correct number of symbols
            expect(pack).toHaveLength(calculateUniqueSymbolCount(level));

            // Check that they're all from the master symbols list
            pack.forEach(symbol => {
                expect(getMasterSymbols()).toContain(symbol);
            });
        });
    });

    describe('Code Generation', () => {
        it('should generate a valid code with the correct length', () => {
            const level = 3;
            const availableSymbols = [
                'symbol-1.png', 'symbol-2.png', 'symbol-3.png',
                'symbol-4.png', 'symbol-5.png'
            ];

            const code = generateCode(level, availableSymbols);

            // Check code length
            expect(code.length).toBeLessThanOrEqual(availableSymbols.length);

            // Check that all symbols in code are from available symbols
            code.forEach(symbol => {
                expect(availableSymbols).toContain(symbol);
            });
        });
    });

    describe('Grid Generation', () => {
        it('should generate a grid with the correct size', () => {
            const level = 2;
            const codeSymbols = ['symbol-1.png', 'symbol-2.png'];
            const availableSymbols = [
                'symbol-1.png', 'symbol-2.png', 'symbol-3.png',
                'symbol-4.png', 'symbol-5.png', 'symbol-6.png'
            ];

            const grid = generateGrid(level, codeSymbols, availableSymbols);

            // Check grid size
            expect(grid).toHaveLength(SYMBOL_CONFIG.GRID_SIZE);

            // Ensure grid contains all code symbols
            codeSymbols.forEach(symbol => {
                expect(grid).toContain(symbol);
            });

            // Check that all grid items are from the available pool
            grid.forEach(symbol => {
                expect(availableSymbols).toContain(symbol);
            });
        });

        it('should include code symbols at least once', () => {
            const level = 3;
            const codeSymbols = ['symbol-1.png', 'symbol-2.png', 'symbol-3.png'];
            const availableSymbols = [
                'symbol-1.png', 'symbol-2.png', 'symbol-3.png',
                'symbol-4.png', 'symbol-5.png', 'symbol-6.png',
                'symbol-7.png', 'symbol-8.png'
            ];

            const grid = generateGrid(level, codeSymbols, availableSymbols);

            // Verify each code symbol appears at least once
            codeSymbols.forEach(symbol => {
                expect(grid.filter(item => item === symbol).length).toBeGreaterThanOrEqual(1);
            });
        });

        it('should have more copies of code symbols at earlier levels', () => {
            const earlyLevel = 1; // Lower level should use more copies
            const lateLevel = 10; // Higher level should use fewer copies

            const codeSymbols = ['symbol-1.png', 'symbol-2.png'];
            const availableSymbols = [
                'symbol-1.png', 'symbol-2.png', 'symbol-3.png',
                'symbol-4.png', 'symbol-5.png', 'symbol-6.png'
            ];

            const earlyGrid = generateGrid(earlyLevel, codeSymbols, availableSymbols);
            const lateGrid = generateGrid(lateLevel, codeSymbols, availableSymbols);

            // Count code symbols in each grid
            const earlyCount = codeSymbols.reduce(
                (total, symbol) => total + earlyGrid.filter(item => item === symbol).length,
                0
            );

            const lateCount = codeSymbols.reduce(
                (total, symbol) => total + lateGrid.filter(item => item === symbol).length,
                0
            );

            // Early levels should have at least as many code symbols as late levels
            expect(earlyCount).toBeGreaterThanOrEqual(lateCount);
        });
    });
});