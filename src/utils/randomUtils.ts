/**
 * Utilities for cryptographically secure random operations
 */

/**
 * Generate a cryptographically secure random number within a range
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns A random number between min and max
 */
export function secureRandomInt(min: number, max: number): number {
    // Get cryptographically strong random values
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);

    // Convert to decimal between 0 and 1
    const randomNumber = randomBuffer[0] / (0xffffffff + 1);

    // Scale to our range and return
    return Math.floor(randomNumber * (max - min)) + min;
}

/**
 * Shuffle an array using the Fisher-Yates algorithm with cryptographically secure randomness
 * @param array - Array to shuffle
 * @returns A new shuffled array (original remains unchanged)
 */
export function secureShuffleArray<T>(array: T[]): T[] {
    // Create a copy of the array to avoid modifying the original
    const shuffled = [...array];

    // Fisher-Yates shuffle with crypto random
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = secureRandomInt(0, i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Randomly select n elements from an array without replacement
 * @param array - Array to select from
 * @param count - Number of elements to select
 * @returns A new array with randomly selected elements
 */
export function secureRandomSample<T>(array: T[], count: number): T[] {
    if (count >= array.length) return secureShuffleArray(array);
    return secureShuffleArray(array).slice(0, count);
}

/**
 * Select one random element from an array
 * @param array - Array to select from
 * @returns A randomly selected element
 */
export function secureRandomElement<T>(array: T[]): T {
    return array[secureRandomInt(0, array.length)];
} 