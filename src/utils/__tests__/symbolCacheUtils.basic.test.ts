import {
    CACHE_VERSION,
    loadedImages,
    forceMarkAllLoaded,
    areAllImagesLoaded
} from '../symbolCacheUtils';
import { MASTER_SYMBOLS } from '../symbolManager';

// Simple test with minimal dependencies
describe('symbolCacheUtils basic tests', () => {
    beforeEach(() => {
        // Reset loadedImages state
        Object.keys(loadedImages).forEach(key => {
            delete loadedImages[key];
        });
    });

    test('areAllImagesLoaded should return false when no images are loaded', () => {
        // Ensure none are loaded initially
        Object.keys(loadedImages).forEach(key => {
            delete loadedImages[key];
        });

        // Test
        const result = areAllImagesLoaded();

        // Assertion
        if (result !== false) {
            throw new Error(`Expected areAllImagesLoaded() to return false, but got ${result}`);
        }
    });

    test('areAllImagesLoaded should return true when all images are loaded', () => {
        // Mark all images as loaded
        MASTER_SYMBOLS.forEach(symbol => {
            loadedImages[symbol] = true;
        });

        // Test
        const result = areAllImagesLoaded();

        // Assertion
        if (result !== true) {
            throw new Error(`Expected areAllImagesLoaded() to return true, but got ${result}`);
        }
    });

    test('forceMarkAllLoaded should mark all images as loaded', () => {
        // Ensure none are loaded initially
        Object.keys(loadedImages).forEach(key => {
            delete loadedImages[key];
        });

        // Initial state check
        const initialResult = areAllImagesLoaded();
        if (initialResult !== false) {
            throw new Error(`Expected initial areAllImagesLoaded() to be false, but got ${initialResult}`);
        }

        // Test the function
        forceMarkAllLoaded();

        // Check result
        const finalResult = areAllImagesLoaded();
        if (finalResult !== true) {
            throw new Error(`Expected areAllImagesLoaded() to be true after forceMarkAllLoaded(), but got ${finalResult}`);
        }
    });
}); 