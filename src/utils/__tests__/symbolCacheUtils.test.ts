import {
    CACHE_VERSION,
    CACHE_KEY_PREFIX,
    loadedImages,
    restoreCachedImages,
    persistCachedImages,
    areAllImagesLoaded,
    forceMarkAllLoaded,
    preloadAllSymbols,
    preloadSpecificSymbols
} from '../symbolCacheUtils';
import { getMasterSymbols } from '../symbolManager';

// Mock dataUrlCache from useImageCache hook
jest.mock('../../hooks/useImageCache', () => ({
    dataUrlCache: {},
    preloadAllGameSymbols: jest.fn().mockImplementation(() => {
        // Mark all symbols as loaded in loadedImages
        getMasterSymbols().forEach(symbol => {
            loadedImages[symbol] = true;
        });
        return Promise.resolve();
    }),
    preloadImage: jest.fn().mockImplementation(() => {
        return Promise.resolve({});
    })
}));

describe('symbolCacheUtils', () => {
    // Mock localStorage for testing
    let mockLocalStorage: {
        getItem: jest.Mock;
        setItem: jest.Mock;
        removeItem: jest.Mock;
        clear: jest.Mock;
        data: Record<string, string>;
    };

    beforeEach(() => {
        // Reset mocks and state
        jest.clearAllMocks();

        // Reset loadedImages state
        Object.keys(loadedImages).forEach(key => {
            delete loadedImages[key];
        });

        // Setup localStorage mock
        mockLocalStorage = {
            data: {},
            getItem: jest.fn((key) => mockLocalStorage.data[key] || null),
            setItem: jest.fn((key, value) => {
                mockLocalStorage.data[key] = value;
            }),
            removeItem: jest.fn((key) => {
                delete mockLocalStorage.data[key];
            }),
            clear: jest.fn(() => {
                mockLocalStorage.data = {};
            })
        };

        // Override global localStorage
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });
    });

    describe('areAllImagesLoaded', () => {
        it('should return false when no images are loaded', async () => {
            const result = await areAllImagesLoaded();
            if (result !== false) {
                throw new Error(`Expected areAllImagesLoaded() to return false, but got ${result}`);
            }
        });

        it('should return true when all images are loaded', async () => {
            // Mark all images as loaded
            const symbols = await getMasterSymbols();
            symbols.forEach(symbol => {
                loadedImages[symbol] = true;
            });

            const result = await areAllImagesLoaded();
            if (result !== true) {
                throw new Error(`Expected areAllImagesLoaded() to return true, but got ${result}`);
            }
        });
    });

    describe('forceMarkAllLoaded', () => {
        it('should mark all images as loaded', async () => {
            // Initially none are loaded
            if (await areAllImagesLoaded() !== false) {
                throw new Error('Expected initial areAllImagesLoaded() to be false');
            }

            // Call function
            await forceMarkAllLoaded();

            // All should be marked as loaded
            if (await areAllImagesLoaded() !== true) {
                throw new Error('Expected areAllImagesLoaded() to be true after forceMarkAllLoaded()');
            }
        });
    });

    describe('basic cache functions', () => {
        it('should restore cached images when version matches', async () => {
            // Setup mock data
            const symbols = await getMasterSymbols();
            const testSymbol = symbols[0];
            mockLocalStorage.data['clash-cache-version'] = CACHE_VERSION;
            mockLocalStorage.data[`${CACHE_KEY_PREFIX}${testSymbol}`] = 'mock-data-url';

            // Call function
            await restoreCachedImages();

            // Image should be marked as loaded
            if (loadedImages[testSymbol] !== true) {
                throw new Error(`Expected ${testSymbol} to be marked as loaded`);
            }
        });

        it('should clear old cache on version mismatch', async () => {
            // Setup mock data with old version
            const symbols = await getMasterSymbols();
            const testSymbol = symbols[0];
            mockLocalStorage.data['clash-cache-version'] = 'old-version';
            mockLocalStorage.data[`${CACHE_KEY_PREFIX}${testSymbol}`] = 'mock-data-url';

            // Mock Object.keys to return the keys we expect
            const originalKeys = Object.keys;
            const mockKeys = ['clash-cache-version', `${CACHE_KEY_PREFIX}${testSymbol}`];

            jest.spyOn(Object, 'keys').mockImplementation(() => mockKeys);

            // Call function
            await restoreCachedImages();

            // Should have attempted to remove items
            if (mockLocalStorage.removeItem.mock.calls.length === 0) {
                throw new Error('Expected localStorage.removeItem to be called');
            }

            // And should have set the new version
            let versionSet = false;
            for (const call of mockLocalStorage.setItem.mock.calls) {
                if (call[0] === 'clash-cache-version' && call[1] === CACHE_VERSION) {
                    versionSet = true;
                    break;
                }
            }

            if (!versionSet) {
                throw new Error('Expected new cache version to be set');
            }

            // Restore original
            jest.spyOn(Object, 'keys').mockRestore();
        });

        it('should persist data URLs to localStorage', async () => {
            // Setup mock dataUrlCache
            const { dataUrlCache } = require('../../hooks/useImageCache');
            const symbols = await getMasterSymbols();
            const testSymbol = symbols[0];
            dataUrlCache[`/symbols/${testSymbol}`] = 'mock-data-url';

            // Call function
            await persistCachedImages();

            // Should have saved to localStorage
            let versionSet = false;
            let symbolSet = false;

            for (const call of mockLocalStorage.setItem.mock.calls) {
                if (call[0] === 'clash-cache-version' && call[1] === CACHE_VERSION) {
                    versionSet = true;
                }
                if (call[0] === `${CACHE_KEY_PREFIX}${testSymbol}` && call[1] === 'mock-data-url') {
                    symbolSet = true;
                }
            }

            if (!versionSet) {
                throw new Error('Expected cache version to be set');
            }
            if (!symbolSet) {
                throw new Error('Expected symbol to be cached');
            }
        });
    });

    describe('async preloading functions', () => {
        it('preloadAllSymbols should load all symbols', async () => {
            // Get the mock function
            const { preloadAllGameSymbols } = require('../../hooks/useImageCache');
            const initialCallCount = preloadAllGameSymbols.mock.calls.length;

            // Call function and wait for completion
            await preloadAllSymbols();

            // Should have called the preload function
            const finalCallCount = preloadAllGameSymbols.mock.calls.length;
            if (finalCallCount <= initialCallCount) {
                throw new Error('Expected preloadAllGameSymbols to be called');
            }

            // All symbols should be marked as loaded
            if (await areAllImagesLoaded() !== true) {
                throw new Error('Expected all images to be marked as loaded');
            }
        });

        it('preloadSpecificSymbols should load only specified symbols', async () => {
            // Setup
            const symbols = [getMasterSymbols()[0], getMasterSymbols()[1]];

            // Get the mock function
            const { preloadImage } = require('../../hooks/useImageCache');
            const initialCallCount = preloadImage.mock.calls.length;

            // Call function
            await preloadSpecificSymbols(symbols);

            // Verify preloadImage was called for each symbol
            const finalCallCount = preloadImage.mock.calls.length;
            if (finalCallCount - initialCallCount !== symbols.length) {
                throw new Error(`Expected preloadImage to be called ${symbols.length} times but was called ${finalCallCount - initialCallCount} times`);
            }

            // Verify symbols are marked as loaded
            for (const symbol of symbols) {
                if (loadedImages[symbol] !== true) {
                    throw new Error(`Expected ${symbol} to be marked as loaded`);
                }
            }
        });
    });
}); 