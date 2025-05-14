import { useEffect } from 'react';
import { MASTER_SYMBOLS } from '../hooks/useGame';
import { preloadAllGameSymbols, dataUrlCache, loadingStatus } from '../hooks/useImageCache';

// Constants
const CACHE_VERSION = 'v1';
const CACHE_KEY_PREFIX = 'dhyanam-symbol-cache-';

// Global cache to track loaded images
const loadedImages: Record<string, boolean> = {};

// Try to restore cached data URLs from localStorage
const restoreCachedImages = (): void => {
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

// Create image elements for all symbols - this forces them into browser cache
const preloadSymbols = (): void => {
    MASTER_SYMBOLS.forEach(symbol => {
        const img = new Image();
        img.src = `/symbols/${symbol}`;
        img.onload = () => {
            loadedImages[symbol] = true;
        };
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

interface SymbolPreloaderProps {
    onComplete?: () => void;
}

/**
 * A component that preloads all game symbols
 * This component doesn't render anything visible
 */
const SymbolPreloader: React.FC<SymbolPreloaderProps> = ({ onComplete }) => {
    useEffect(() => {
        // Immediately try to restore from localStorage
        restoreCachedImages();

        // Start preloading all symbols
        preloadAllGameSymbols()
            .then(() => {
                console.log('All symbols preloaded successfully');
                // Save to localStorage for next session
                persistCachedImages();
                if (onComplete) onComplete();
            })
            .catch(error => {
                console.error('Error preloading symbols:', error);
                if (onComplete) onComplete();
            });
    }, [onComplete]);

    return null; // This component doesn't render anything
};

export default SymbolPreloader; 