import { SYMBOL_COUNT, getSymbolCountRange } from '../../config/gameConfig';

describe('Symbol Count Tests', () => {
    it.skip('should return the correct symbol count range for level 1-10', () => {
        const [min, max] = SYMBOL_COUNT.LEVEL_10_RANGE;

        for (let level = 1; level <= 10; level++) {
            const range = getSymbolCountRange(level);
            expect(range).toEqual([min, max]);
        }
    });

    it.skip('should return the correct symbol count range for level 11-20', () => {
        const [min, max] = SYMBOL_COUNT.LEVEL_20_RANGE;

        for (let level = 11; level <= 20; level++) {
            const range = getSymbolCountRange(level);
            expect(range).toEqual([min, max]);
        }
    });

    it('should return the correct symbol count range for level 1-30', () => {
        const [min, max] = SYMBOL_COUNT.LEVEL_30_RANGE;

        for (let level = 1; level <= 30; level++) {
            const range = getSymbolCountRange(level);
            expect(range).toEqual([min, max]);
        }
    });

    it('should return the correct symbol count range for level 31-50', () => {
        const [min, max] = SYMBOL_COUNT.LEVEL_50_RANGE;

        for (let level = 31; level <= 50; level++) {
            const range = getSymbolCountRange(level);
            expect(range).toEqual([min, max]);
        }
    });

    it('should return the maximum symbol count for levels above 50', () => {
        const [min, max] = SYMBOL_COUNT.MAX_RANGE;

        for (let level = 51; level <= 60; level++) {
            const range = getSymbolCountRange(level);
            expect(range).toEqual([min, max]);
        }
    });

    it('should have ranges that increase with level', () => {
        // Get all the ranges
        const ranges = [
            SYMBOL_COUNT.LEVEL_30_RANGE,
            SYMBOL_COUNT.LEVEL_50_RANGE,
            SYMBOL_COUNT.MAX_RANGE
        ];

        // Check that each range min/max is greater than or equal to the previous range
        for (let i = 1; i < ranges.length; i++) {
            expect(ranges[i][0]).toBeGreaterThanOrEqual(ranges[i - 1][0]);
            expect(ranges[i][1]).toBeGreaterThanOrEqual(ranges[i - 1][1]);
        }
    });
}); 