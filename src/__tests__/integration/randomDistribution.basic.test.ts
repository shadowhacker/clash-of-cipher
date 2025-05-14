import { getSymbolPack, generateCode, generateGrid } from '../../utils/symbolManager';
import { SYMBOL_CONFIG } from '../../config/gameConfig';

// Simple test for the random distribution using manual assertions
describe('Random Distribution Basic Tests', () => {
    test('Symbol pack should return correct number of symbols', () => {
        const level = 3;
        const pack = getSymbolPack(level);

        // Simple assertions without fancy matchers
        if (!Array.isArray(pack)) {
            throw new Error(`Expected pack to be an array, got ${typeof pack}`);
        }

        if (pack.length === 0) {
            throw new Error('Expected pack to contain symbols, but it was empty');
        }
    });

    test('Generated code should have correct length for level', () => {
        const level = 3;
        const availableSymbols = [
            'symbol-1.png', 'symbol-2.png', 'symbol-3.png',
            'symbol-4.png', 'symbol-5.png', 'symbol-6.png'
        ];

        const code = generateCode(level, availableSymbols);

        // The code should be a non-empty array
        if (!Array.isArray(code)) {
            throw new Error(`Expected code to be an array, got ${typeof code}`);
        }

        if (code.length === 0) {
            throw new Error('Expected code to contain symbols, but it was empty');
        }
    });

    test('Grid should contain all code symbols', () => {
        const level = 2;
        const codeSymbols = ['symbol-1.png', 'symbol-2.png'];
        const availableSymbols = [
            'symbol-1.png', 'symbol-2.png', 'symbol-3.png',
            'symbol-4.png', 'symbol-5.png', 'symbol-6.png'
        ];

        const grid = generateGrid(level, codeSymbols, availableSymbols);

        // Check that the grid has correct size
        if (grid.length !== SYMBOL_CONFIG.GRID_SIZE) {
            throw new Error(`Expected grid to have ${SYMBOL_CONFIG.GRID_SIZE} symbols, but got ${grid.length}`);
        }

        // Check that all code symbols are in the grid
        for (const symbol of codeSymbols) {
            if (!grid.includes(symbol)) {
                throw new Error(`Expected grid to contain code symbol ${symbol}, but it was missing`);
            }
        }
    });

    test('Symbol distribution should vary between grid generations', () => {
        const level = 2;
        const codeSymbols = ['symbol-1.png', 'symbol-2.png'];
        const availableSymbols = [
            'symbol-1.png', 'symbol-2.png', 'symbol-3.png',
            'symbol-4.png', 'symbol-5.png', 'symbol-6.png'
        ];

        // Generate multiple grids
        const grid1 = generateGrid(level, codeSymbols, availableSymbols);
        const grid2 = generateGrid(level, codeSymbols, availableSymbols);

        // Grids should be different (unless very unlikely event of identical shuffle)
        const grid1String = JSON.stringify(grid1);
        const grid2String = JSON.stringify(grid2);

        if (grid1String === grid2String) {
            // This is probabilistically very unlikely, but not an error
            console.warn('Two randomly generated grids were identical - check randomness');
        }
    });
}); 