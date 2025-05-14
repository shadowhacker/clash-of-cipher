// Removed circular import
// import { MASTER_SYMBOLS } from '../hooks/useGame';
import { preloadImage, dataUrlCache, preloadAllGameSymbols as rawPreloadAllGameSymbols } from '../hooks/useImageCache';
import { MASTER_SYMBOLS } from './symbolManager';

// Cache version - update when structure changes
export const CACHE_VERSION = 'v1.0.0';
export const CACHE_KEY_PREFIX = 'clash-symbol-';

// Store loaded state for all symbols
export const loadedImages: Record<string, boolean> = {};

/**
 * Restore cached image data from localStorage
 */
export function restoreCachedImages(): void {
    // Get stored cache version
    const storedVersion = localStorage.getItem('clash-cache-version');

    // If version mismatch, clear the cache
    if (storedVersion !== CACHE_VERSION) {
        // Clear all cached items
        Object.keys(localStorage)
            .filter(key => key.startsWith(CACHE_KEY_PREFIX) || key === 'clash-cache-version')
            .forEach(key => {
                localStorage.removeItem(key);
            });

        // Set new version
        localStorage.setItem('clash-cache-version', CACHE_VERSION);
        return;
    }

    console.log('Restored cached symbols from localStorage');

    // For any cached symbols, mark them as loaded
    MASTER_SYMBOLS.forEach(symbol => {
        const key = `${CACHE_KEY_PREFIX}${symbol}`;
        const cachedDataUrl = localStorage.getItem(key);
        if (cachedDataUrl) {
            // Cache the dataUrl
            dataUrlCache[`/symbols/${symbol}`] = cachedDataUrl;
            // Mark as loaded
            loadedImages[symbol] = true;
        }
    });
}

/**
 * Persist cached image data to localStorage
 */
export function persistCachedImages(): void {
    // Store current version
    localStorage.setItem('clash-cache-version', CACHE_VERSION);

    // Store all cached symbols
    MASTER_SYMBOLS.forEach(symbol => {
        const src = `/symbols/${symbol}`;
        if (dataUrlCache[src]) {
            localStorage.setItem(`${CACHE_KEY_PREFIX}${symbol}`, dataUrlCache[src]);
        }
    });

    console.log('Persisted symbol cache to localStorage');
}

/**
 * Check if all game symbols are loaded
 */
export function areAllImagesLoaded(): boolean {
    return MASTER_SYMBOLS.every(symbol => loadedImages[symbol] === true);
}

/**
 * Force mark all images as loaded (useful for fast testing)
 */
export function forceMarkAllLoaded(): void {
    MASTER_SYMBOLS.forEach(symbol => {
        loadedImages[symbol] = true;
    });
}

/**
 * Preload all game symbols
 */
export async function preloadAllSymbols(): Promise<void> {
    await rawPreloadAllGameSymbols();

    // Ensure all symbols are marked as loaded in our loadedImages object
    MASTER_SYMBOLS.forEach(symbol => {
        loadedImages[symbol] = true;
    });

    // Store in localStorage
    persistCachedImages();
}

/**
 * Preload specific symbols
 * @param symbols Array of symbol filenames to preload
 */
export async function preloadSpecificSymbols(symbols: string[]): Promise<void> {
    try {
        await Promise.all(
            symbols.map(symbol =>
                preloadImage(`/symbols/${symbol}`)
                    .then(() => {
                        loadedImages[symbol] = true;
                        return true;
                    })
                    .catch(() => false)
            )
        );
    } catch (error) {
        console.error('Error preloading specific symbols:', error);
    }
} 