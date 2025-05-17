import { SYMBOL_FLASH_TIME, getFlashTime } from '../../config/gameConfig';

describe('Symbol Flash Time Tests', () => {
    const { MIN_LOW: MIN, MAX_HIGH: MAX, CYCLE } = SYMBOL_FLASH_TIME;

    it.skip('should start at maximum flash time for level 1', () => {
        expect(getFlashTime(1)).toBe(MAX);
    });

    it.skip('should decrease flash time linearly through the first cycle phase', () => {
        // In the first phase (levels 1-20), flash time should decrease from MAX to MIN
        const step = (MAX - MIN) / (CYCLE - 1);

        // Check several points in the cycle
        for (let level = 1; level <= CYCLE; level++) {
            const expectedTime = MAX - (step * (level - 1));
            expect(getFlashTime(level)).toBeCloseTo(expectedTime, 5);
        }

        // At the end of cycle (level 20), should be at MIN
        expect(getFlashTime(CYCLE)).toBeCloseTo(MIN, 5);
    });

    it.skip('should increase flash time linearly through the second cycle phase', () => {
        // In the second phase (levels 21-40), flash time should increase from MIN to MAX
        const step = (MAX - MIN) / (CYCLE - 1);

        // Check several points in the second cycle
        for (let level = CYCLE + 1; level <= CYCLE * 2; level++) {
            const cycleIndex = (level - 1) % CYCLE;
            const expectedTime = MIN + (step * cycleIndex);
            expect(getFlashTime(level)).toBeCloseTo(expectedTime, 5);
        }

        // At the end of second cycle (level 40), should be at MAX
        expect(getFlashTime(CYCLE * 2)).toBeCloseTo(MAX, 5);
    });

    it.skip('should repeat the oscillation pattern for multiple cycles', () => {
        // Phase 0 cycles (decreasing from MAX to MIN)
        expect(getFlashTime(1)).toBeCloseTo(MAX, 5); // Start of cycle 1 (phase 0)
        expect(getFlashTime(CYCLE)).toBeCloseTo(MIN, 5); // End of cycle 1 (phase 0)

        // Phase 1 cycles (increasing from MIN to MAX)
        expect(getFlashTime(CYCLE + 1)).toBeCloseTo(MIN, 5); // Start of cycle 2 (phase 1)
        expect(getFlashTime(CYCLE * 2)).toBeCloseTo(MAX, 5); // End of cycle 2 (phase 1)

        // Back to phase 0
        expect(getFlashTime(CYCLE * 2 + 1)).toBeCloseTo(MAX, 5); // Start of cycle 3 (phase 0)
        expect(getFlashTime(CYCLE * 3)).toBeCloseTo(MIN, 5); // End of cycle 3 (phase 0)
    });

    it('should use correct time ranges for different level brackets', () => {
        // First bracket (levels 1-20) should use MAX_HIGH to MIN_HIGH
        expect(getFlashTime(1)).toBeCloseTo(SYMBOL_FLASH_TIME.MAX_HIGH, 5);
        expect(getFlashTime(20)).toBeCloseTo(SYMBOL_FLASH_TIME.MIN_HIGH, 5);
        
        // Second bracket (levels 21-40) should use MAX_LOW to MIN_LOW
        expect(getFlashTime(21)).toBeCloseTo(SYMBOL_FLASH_TIME.MAX_LOW, 5);
        expect(getFlashTime(40)).toBeCloseTo(SYMBOL_FLASH_TIME.MIN_LOW, 5);
        
        // Third bracket (levels 41-60) should use MAX_HIGH to MIN_HIGH again
        expect(getFlashTime(41)).toBeCloseTo(SYMBOL_FLASH_TIME.MAX_HIGH, 5);
        expect(getFlashTime(60)).toBeCloseTo(SYMBOL_FLASH_TIME.MIN_HIGH, 5);
    });
}); 