import {
    CACHE_VERSION,
    loadedImages,
    forceMarkAllLoaded,
    areAllImagesLoaded
} from '../symbolCacheUtils';
import { getMasterSymbols } from '../symbolManager';

// Simple test with minimal dependencies
describe('symbolCacheUtils basic tests', () => {
    beforeEach(() => {
        // Reset loadedImages state
        Object.keys(loadedImages).forEach(key => {
            delete loadedImages[key];
        });
    });

    test('areAllImagesLoaded should return false when no images are loaded', async () => {
        // Ensure none are loaded initially
        Object.keys(loadedImages).forEach(key => {
            delete loadedImages[key];
        });

        // Test
        const result = await areAllImagesLoaded();

        // Assertion
        if (result !== false) {
            throw new Error(`Expected areAllImagesLoaded() to return false, but got ${result}`);
        }
    });

    test('areAllImagesLoaded should return true when all images are loaded', async () => {
        // Mark all images as loaded
        const symbols = await getMasterSymbols();
        symbols.forEach(symbol => {
            loadedImages[symbol] = true;
        });

        // Test
        const result = await areAllImagesLoaded();

        // Assertion
        if (result !== true) {
            throw new Error(`Expected areAllImagesLoaded() to return true, but got ${result}`);
        }
    });

    test('forceMarkAllLoaded should mark all images as loaded', async () => {
        // Ensure none are loaded initially
        Object.keys(loadedImages).forEach(key => {
            delete loadedImages[key];
        });

        // Initial state check
        const initialResult = await areAllImagesLoaded();
        if (initialResult !== false) {
            throw new Error(`Expected initial areAllImagesLoaded() to be false, but got ${initialResult}`);
        }

        // Test the function
        await forceMarkAllLoaded();

        // Check result
        const finalResult = await areAllImagesLoaded();
        if (finalResult !== true) {
            throw new Error(`Expected areAllImagesLoaded() to be true after forceMarkAllLoaded(), but got ${finalResult}`);
        }
    });
}); 