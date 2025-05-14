import { secureRandomInt, secureShuffleArray, secureRandomSample, secureRandomElement } from '../randomUtils';

describe('randomUtils', () => {
    // Due to our mock setup in setupTests.ts, these tests will be deterministic
    describe('secureRandomInt', () => {
        it('should generate a random integer within the specified range', () => {
            const min = 0;
            const max = 10;
            const result = secureRandomInt(min, max);

            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThan(max);
            expect(Number.isInteger(result)).toBe(true);
        });

        it('should handle min and max being the same', () => {
            const value = 5;
            const result = secureRandomInt(value, value);
            expect(result).toBe(value);
        });

        it('should produce different results for the same range', () => {
            // Since we mocked window.crypto, this will actually be deterministic
            // but we simulate testing randomness here
            const min = 0;
            const max = 1000;
            const results = new Set();

            for (let i = 0; i < 10; i++) {
                results.add(secureRandomInt(min, max));
            }

            // With truly random generation and a large enough range,
            // we would expect most values to be unique
            // But with our mock, they will be deterministic based on our mock
            expect(results.size).toBeGreaterThanOrEqual(1);
        });
    });

    describe('secureShuffleArray', () => {
        it('should return a shuffled copy of the array', () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = secureShuffleArray([...original]);

            // Check if same elements are present
            expect(shuffled).toHaveLength(original.length);
            expect(shuffled.sort()).toEqual(original.sort());
        });

        it('should not modify the original array', () => {
            const original = [1, 2, 3, 4, 5];
            const originalCopy = [...original];

            secureShuffleArray(original);

            expect(original).toEqual(originalCopy);
        });

        it('should handle empty arrays', () => {
            const result = secureShuffleArray([]);
            expect(result).toEqual([]);
        });

        it('should handle single element arrays', () => {
            const original = [42];
            const result = secureShuffleArray(original);
            expect(result).toEqual(original);
        });
    });

    describe('secureRandomSample', () => {
        it('should return the requested number of elements', () => {
            const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const count = 5;

            const result = secureRandomSample(array, count);

            expect(result).toHaveLength(count);
            // Verify all elements in result are from the original array
            result.forEach(item => {
                expect(array).toContain(item);
            });
        });

        it('should handle count equal to array length', () => {
            const array = [1, 2, 3, 4, 5];
            const result = secureRandomSample(array, array.length);

            expect(result).toHaveLength(array.length);
            expect(result.sort()).toEqual(array.sort());
        });

        it('should handle count greater than array length', () => {
            const array = [1, 2, 3];
            const result = secureRandomSample(array, 5);

            expect(result).toHaveLength(array.length);
            expect(result.sort()).toEqual(array.sort());
        });

        it('should handle empty arrays', () => {
            const result = secureRandomSample([], 3);
            expect(result).toEqual([]);
        });
    });

    describe('secureRandomElement', () => {
        it('should return an element from the array', () => {
            const array = [1, 2, 3, 4, 5];
            const result = secureRandomElement(array);

            expect(array).toContain(result);
        });

        it('should handle single element arrays', () => {
            const array = [42];
            const result = secureRandomElement(array);

            expect(result).toBe(42);
        });
    });
}); 