// Removed circular import
// import { MASTER_SYMBOLS } from '../hooks/useGame';
import { preloadAllGameSymbols, dataUrlCache, loadingStatus } from '../hooks/useImageCache';

// Array of all available symbol image filenames
export const MASTER_SYMBOLS = [
    'symbol-1.png',
    'symbol-2.png',
    'symbol-3.png',
    'symbol-4.png',
    'symbol-5.png',
    'symbol-6.png',
    'symbol-7.png',
    'symbol-8.png',
    'symbol-9.png',
    'symbol-10.png',
    'symbol-11.png',
    'symbol-12.png',
    'symbol-13.png',
    'symbol-14.png',
    'symbol-15.png',
    'symbol-16.png',
    'symbol-17.png',
    'symbol-18.png',
    'symbol-19.png',
    'symbol-20.png',
    'symbol-21.png',
    'symbol-22.png',
    'symbol-23.png',
    'symbol-24.png',
    'symbol-25.png',
    'symbol-26.png',
    'symbol-27.png',
    'symbol-28.png',
    'symbol-29.png',
    'symbol-30.png',
    'symbol-31.png',
    'symbol-32.png',
    'symbol-33.png',
    'symbol-34.png'
];

// Constants
export const CACHE_VERSION = 'v1';
export const CACHE_KEY_PREFIX = 'dhyanam-symbol-cache-';

// Global cache to track loaded images
export const loadedImages: Record<string, boolean> = {};

// Try to restore cached data URLs from localStorage
export const restoreCachedImages = (): void => {
    try {
        // Get cache version from localStorage
        const storedVersion = localStorage.getItem('dhyanam-cache-version');

        // Only restore if versions match
        if (storedVersion === CACHE_VERSION) {
            MASTER_SYMBOLS.forEach(symbol => {
                const key = `${CACHE_KEY_PREFIX}${symbol}`;
                const dataUrl = localStorage.getItem(key);

                if (dataUrl) {
                    // Restore to our in-memory cache
                    const path = `/symbols/${symbol}`;
                    dataUrlCache[path] = dataUrl;
                    loadingStatus[path] = 'loaded';
                    loadedImages[symbol] = true;

                    // Preload the image from data URL
                    const img = new Image();
                    img.src = dataUrl;
                }
            });
            console.log('Restored cached symbols from localStorage');
        } else {
            // Clear old cache if version mismatch
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(CACHE_KEY_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            localStorage.setItem('dhyanam-cache-version', CACHE_VERSION);
        }
    } catch (e) {
        console.warn('Failed to restore cached images:', e);
    }
};

// Function to save data URLs to localStorage
export const persistCachedImages = (): void => {
    try {
        // Set the cache version
        localStorage.setItem('dhyanam-cache-version', CACHE_VERSION);

        // Store each symbol's data URL
        MASTER_SYMBOLS.forEach(symbol => {
            const path = `/symbols/${symbol}`;
            if (dataUrlCache[path]) {
                const key = `${CACHE_KEY_PREFIX}${symbol}`;
                localStorage.setItem(key, dataUrlCache[path]);
            }
        });
        console.log('Persisted symbol cache to localStorage');
    } catch (e) {
        console.warn('Failed to persist cached images:', e);
    }
};

// Export a function to check if all images are loaded
export const areAllImagesLoaded = (): boolean => {
    return MASTER_SYMBOLS.every(symbol => loadedImages[symbol]);
};

// This function immediately marks all symbols as loaded
// We use this as a fallback when we can't wait for image loading
export const forceMarkAllLoaded = (): void => {
    MASTER_SYMBOLS.forEach(symbol => {
        loadedImages[symbol] = true;
    });
};

// Export a function to preload all images
export const preloadAllSymbols = async (): Promise<void> => {
    // First try to restore from localStorage
    restoreCachedImages();

    // If all are already loaded, return immediately
    if (areAllImagesLoaded()) return Promise.resolve();

    // Create a new preload promise
    return new Promise<void>((resolve) => {
        // Start with a short timeout to ensure we don't block the game
        const timeout = setTimeout(() => {
            console.warn("Symbol loading timed out - forcing game to continue");
            forceMarkAllLoaded();
            resolve();
        }, 2000);

        // Use the centralized image loading system
        preloadAllGameSymbols().then(() => {
            // After all symbols are loaded, persist to localStorage
            persistCachedImages();
            clearTimeout(timeout);
            resolve();
        });
    });
};

// Function to preload specific symbols
export const preloadSpecificSymbols = async (symbols: string[]): Promise<void> => {
    // If all images are already loaded, return immediately
    if (areAllImagesLoaded()) return Promise.resolve();

    // Create a filtered list of symbols that need loading
    const symbolsToLoad = symbols.filter(symbol => !loadedImages[symbol]);

    // If all requested symbols are already loaded, return immediately
    if (symbolsToLoad.length === 0) return Promise.resolve();

    return new Promise<void>((resolve) => {
        // Quick timeout to ensure we don't block the game for too long
        const timeout = setTimeout(() => {
            // Mark requested symbols as loaded
            symbols.forEach(symbol => {
                loadedImages[symbol] = true;
            });
            resolve();
        }, 500);

        // Load each symbol
        const promises = symbolsToLoad.map((symbol) => {
            return new Promise<void>((resolveImg) => {
                const img = new Image();
                img.onload = () => {
                    loadedImages[symbol] = true;
                    resolveImg();
                };
                img.onerror = () => {
                    console.error(`Failed to load symbol: ${symbol}`);
                    // Mark as loaded anyway to prevent infinite retries
                    loadedImages[symbol] = true;
                    resolveImg();
                };
                img.src = `/symbols/${symbol}`;
            });
        });

        Promise.all(promises).then(() => {
            clearTimeout(timeout);
            resolve();
        });
    });
}; 