import { useState, useEffect } from 'react';
import { MASTER_SYMBOLS } from './useGame';

// Create a global cache that persists across component mounts
const imageCache: Record<string, HTMLImageElement> = {};
// Export the caches for use in SymbolPreloader
export const dataUrlCache: Record<string, string> = {}; // Cache for data URLs
export const loadingPromises: Record<string, Promise<HTMLImageElement>> = {};
export const loadingStatus: Record<string, 'loading' | 'loaded' | 'error'> = {};

// Important UI images to preload
const CRITICAL_UI_IMAGES = [
    '/images/bg-intro.png'  // Intro background image
];

// Track overall loading progress
export const loadingProgress = {
    total: 0,
    loaded: 0,
    // Track critical UI images separately
    criticalTotal: 0,
    criticalLoaded: 0,
    // Check if critical images are loaded
    get criticalComplete() {
        return this.criticalTotal > 0 && this.criticalLoaded >= this.criticalTotal;
    },
    // Get overall percentage
    get percentage() {
        return this.total === 0 ? 0 : Math.floor((this.loaded / this.total) * 100);
    }
};

/**
 * Preloads and caches an image
 * @param src The image source URL
 * @param isCritical Whether this is a critical image that must be loaded before continuing
 * @returns A promise that resolves when the image is loaded
 */
export const preloadImage = (src: string, isCritical = false): Promise<HTMLImageElement> => {
    // If the image is already in cache, return immediately
    if (imageCache[src]) {
        loadingStatus[src] = 'loaded';
        return Promise.resolve(imageCache[src]);
    }

    // If this image is already loading, return the existing promise
    if (loadingPromises[src]) {
        return loadingPromises[src];
    }

    // Increment total count for progress tracking
    loadingProgress.total++;
    if (isCritical) {
        loadingProgress.criticalTotal++;
    }

    // Start loading the image
    loadingStatus[src] = 'loading';
    console.log(`Starting to load ${isCritical ? 'CRITICAL' : 'normal'} image: ${src}`);

    // Create and store the loading promise
    loadingPromises[src] = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            // Store the loaded image in cache
            imageCache[src] = img;

            // Also create a data URL for the image and cache it
            try {
                // Only for small images like symbols, not large backgrounds
                if (!src.includes('bg-')) {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        dataUrlCache[src] = canvas.toDataURL('image/png');
                    }
                }
            } catch (e) {
                console.warn('Could not create data URL for', src);
            }

            loadingStatus[src] = 'loaded';
            // Update progress
            loadingProgress.loaded++;
            if (isCritical) {
                loadingProgress.criticalLoaded++;
                console.log(`Loaded CRITICAL image: ${src} (${loadingProgress.criticalLoaded}/${loadingProgress.criticalTotal})`);
            } else {
                console.log(`Loaded image: ${src} (${loadingProgress.percentage}%)`);
            }
            resolve(img);
        };

        img.onerror = () => {
            loadingStatus[src] = 'error';
            // Still increment loaded count to maintain progress
            loadingProgress.loaded++;
            if (isCritical) {
                loadingProgress.criticalLoaded++;
            }

            console.error(`Failed to load ${isCritical ? 'CRITICAL' : ''} image: ${src}`);

            // Create a placeholder image to not break the game
            const placeholderImg = new Image();
            placeholderImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="%23fbbf24"%3E%3C/rect%3E%3C/svg%3E';
            imageCache[src] = placeholderImg;
            dataUrlCache[src] = placeholderImg.src;
            resolve(placeholderImg); // Resolve with placeholder instead of rejecting
        };

        // Start loading the image
        img.crossOrigin = 'anonymous'; // Enable creating data URLs from loaded images
        img.src = src;
    });

    return loadingPromises[src];
};

/**
 * Get a cached image URL or data URL if available
 * @param src Original image source
 * @returns Data URL if cached, or original source if not cached
 */
export const getCachedImageUrl = (src: string): string => {
    // Return data URL if available
    if (dataUrlCache[src]) {
        return dataUrlCache[src];
    }

    // If image is cached but no data URL, trigger data URL creation
    if (imageCache[src] && !dataUrlCache[src]) {
        try {
            const img = imageCache[src];
            const canvas = document.createElement('canvas');
            canvas.width = img.width || 50;
            canvas.height = img.height || 50;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                dataUrlCache[src] = canvas.toDataURL('image/png');
                return dataUrlCache[src];
            }
        } catch (e) {
            console.warn('Could not create data URL for', src);
        }
    }

    // Return original source if not cached
    return src;
};

/**
 * Preloads critical UI images that are needed immediately
 * This will wait until ALL critical images are loaded, no timeout
 * @returns A promise that resolves when critical images are loaded
 */
export const preloadCriticalUIImages = async (): Promise<void> => {
    try {
        console.log(`Starting to preload ${CRITICAL_UI_IMAGES.length} CRITICAL UI images...`);

        // Prioritize loading the intro background image - wait for ALL to complete
        // No timeout here, we MUST wait for critical images
        await Promise.all(
            CRITICAL_UI_IMAGES.map(url =>
                preloadImage(url, true) // Mark as critical
                    .catch(err => {
                        console.error(`Error loading CRITICAL UI image ${url}:`, err);
                        return null;
                    })
            )
        );

        console.log('✅ All critical UI images preloaded successfully');
    } catch (error) {
        console.error("Error preloading critical UI images:", error);
    }
};

/**
 * Preloads all game symbols
 * @returns A promise that resolves only when all symbols are loaded
 */
export const preloadAllGameSymbols = async (): Promise<void> => {
    try {
        // First load critical UI images and wait until they're done
        await preloadCriticalUIImages();

        // Once critical images are loaded, continue with symbols
        const symbolUrls = MASTER_SYMBOLS.map(symbol => `/symbols/${symbol}`);
        console.log(`Starting to preload ${symbolUrls.length} game symbols...`);

        // Start loading all symbols and wait for ALL to complete
        await Promise.all(
            symbolUrls.map(url =>
                preloadImage(url)
                    .catch(err => {
                        console.error(`Error loading ${url}:`, err);
                        return null; // Continue despite errors
                    })
            )
        );

        console.log('✅ All game symbols successfully preloaded');
    } catch (error) {
        console.error("Error preloading game symbols:", error);
    }
};

/**
 * Hook to use cached images
 * @param src The image source URL
 * @returns The loading status and cached image element
 */
export const useImageCache = (src: string) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
        loadingStatus[src] || 'loading'
    );

    useEffect(() => {
        if (!src) return;

        // If image is already in cache, update status immediately
        if (imageCache[src]) {
            setStatus('loaded');
            return;
        }

        // Start loading the image
        preloadImage(src)
            .then(() => setStatus('loaded'))
            .catch(() => setStatus('error'));

    }, [src]);

    return {
        status,
        image: imageCache[src],
        cachedUrl: dataUrlCache[src] || src
    };
};

/**
 * Get loading status of a specific image
 * @param src The image source URL
 * @returns The loading status
 */
export const getImageLoadingStatus = (src: string): 'loading' | 'loaded' | 'error' => {
    return loadingStatus[src] || 'loading';
}; 