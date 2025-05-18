// Removed circular import
// import { MASTER_SYMBOLS } from '../hooks/useGame';
import { preloadImage, dataUrlCache, preloadAllGameSymbols as rawPreloadAllGameSymbols } from '../hooks/useImageCache';
import { getMasterSymbols } from './symbolManager';
import logger from './logger';

// Cache version - update when structure changes
export const CACHE_VERSION = 'v1.0.0';
export const CACHE_KEY_PREFIX = 'clash-symbol-';

// Store loaded state for all symbols
export const loadedImages: Record<string, boolean> = {};

/**
 * Helper function to get a consistent cache key for a URL
 * This ensures both local paths and full URLs are stored consistently
 */
function getCacheKey(url: string): string {
  // Extract just the filename from the URL for consistency
  const filename = url.split('/').pop() || url;
  return `${CACHE_KEY_PREFIX}${filename}`;
}

/**
 * Restore cached image data from localStorage
 */
export async function restoreCachedImages(): Promise<void> {
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

    logger.info('Restored cached symbols from localStorage');

    // For any cached symbols, mark them as loaded
    const symbols = await getMasterSymbols();
    await Promise.all(symbols.map(async (url) => {
        const key = getCacheKey(url);
        const cachedDataUrl = localStorage.getItem(key);
        if (cachedDataUrl) {
            // Cache the dataUrl
            dataUrlCache[url] = cachedDataUrl;
            // Mark as loaded
            loadedImages[url] = true;
        }
    }));
}

/**
 * Persist cached image data to localStorage
 */
export async function persistCachedImages(): Promise<void> {
    // Store current version
    localStorage.setItem('clash-cache-version', CACHE_VERSION);
    const symbols = await getMasterSymbols();
    await Promise.all(symbols.map(async (url) => {
        if (dataUrlCache[url]) {
            const key = getCacheKey(url);
            localStorage.setItem(key, dataUrlCache[url]);
        }
    }));
    logger.info('Persisted symbol cache to localStorage');
}

/**
 * Check if all game symbols are loaded
 */
export async function areAllImagesLoaded(): Promise<boolean> {
    const symbols = await getMasterSymbols();
    return symbols.every(url => loadedImages[url] === true);
}

/**
 * Force mark all images as loaded (useful for fast testing)
 */
export async function forceMarkAllLoaded(): Promise<void> {
    const symbols = await getMasterSymbols();
    symbols.forEach(url => {
        loadedImages[url] = true;
    });
}

/**
 * Preload all game symbols with progress callback
 * @param onProgress Optional callback(progress: number) where progress is 0.0-1.0
 */
export async function preloadAllSymbols(onProgress?: (progress: number) => void): Promise<void> {
    // First load critical UI images (background, etc)
    await rawPreloadAllGameSymbols();
    let loadedCount = 0;
    const symbols = await getMasterSymbols();
    const total = symbols.length;
    await Promise.allSettled(
        symbols.map(async (url) => {
            try {
                await preloadImage(url);
                loadedImages[url] = true;
            } catch (err) {
                // Mark as loaded to avoid blocking
                loadedImages[url] = true;
            }
            loadedCount++;
            if (onProgress) onProgress(loadedCount / total);
        })
    );
    // Store in localStorage
    await persistCachedImages();
}

/**
 * Preload specific symbols
 * @param symbols Array of symbol filenames to preload
 */
export async function preloadSpecificSymbols(symbols: string[]): Promise<void> {
    try {
        await Promise.all(
            symbols.map(async (url) => {
                await preloadImage(url);
                loadedImages[url] = true;
                    })
        );
    } catch (error) {
        logger.error('Error preloading specific symbols:', error);
    }
} 