import { useState, useEffect } from 'react';
import { getMasterSymbols } from '../utils/symbolManager';
import logger from '../utils/logger';

// Create a global cache that persists across component mounts
const imageCache: Record<string, HTMLImageElement> = {};
// Export the caches for use in SymbolPreloader
export const dataUrlCache: Record<string, string> = {}; // Cache for data URLs
export const loadingPromises: Record<string, Promise<HTMLImageElement>> = {};
export const loadingStatus: Record<string, 'loading' | 'loaded' | 'error'> = {};

// Important UI images to preload - removing the deprecated images as requested
const CRITICAL_UI_IMAGES: string[] = [
    // The background and guide images have been removed as requested
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
    // Normalize the URL:
    // - If it's a full URL (starts with http/https or contains supabase), use it directly
    // - If it starts with /images/, use it directly (UI assets)
    // - Otherwise prepend /symbols/ for local symbol files
    const imageUrl = (src.startsWith('http') || src.includes('supabase') || src.startsWith('/images/')) 
        ? src 
        : `/symbols/${src}`;
    
    // If the image is already in cache, return immediately
    if (imageCache[imageUrl]) {
        loadingStatus[imageUrl] = 'loaded';
        return Promise.resolve(imageCache[imageUrl]);
    }

    // If this image is already loading, return the existing promise
    if (loadingPromises[imageUrl]) {
        return loadingPromises[imageUrl];
    }

    // Increment total count for progress tracking
    loadingProgress.total++;
    if (isCritical) {
        loadingProgress.criticalTotal++;
    }

    // Start loading the image
    loadingStatus[imageUrl] = 'loading';
    logger.debug(`Starting to load ${isCritical ? 'CRITICAL' : 'normal'} image: ${imageUrl}`);

    // Create and store the loading promise
    loadingPromises[imageUrl] = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            // Store the loaded image in cache
            imageCache[imageUrl] = img;

            // Also create a data URL for the image and cache it
            try {
                // Only for small images like symbols, not large backgrounds
                if (!imageUrl.includes('bg-')) {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        dataUrlCache[imageUrl] = canvas.toDataURL('image/png');
                    }
                }
            } catch (e) {
                logger.warn('Could not create data URL for', imageUrl);
            }

            loadingStatus[imageUrl] = 'loaded';
            // Update progress
            loadingProgress.loaded++;
            if (isCritical) {
                loadingProgress.criticalLoaded++;
                logger.debug(`Loaded CRITICAL image: ${imageUrl} (${loadingProgress.criticalLoaded}/${loadingProgress.criticalTotal})`);
            } else {
                logger.debug(`Loaded image: ${imageUrl} (${loadingProgress.percentage}%)`);
            }
            resolve(img);
        };

        img.onerror = () => {
            loadingStatus[imageUrl] = 'error';
            // Still increment loaded count to maintain progress
            loadingProgress.loaded++;
            if (isCritical) {
                loadingProgress.criticalLoaded++;
            }

            logger.error(`Failed to load ${isCritical ? 'CRITICAL' : ''} image: ${imageUrl}`);

            // Create a placeholder image to not break the game
            const placeholderImg = new Image();
            placeholderImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="%23fbbf24"%3E%3C/rect%3E%3C/svg%3E';
            imageCache[imageUrl] = placeholderImg;
            dataUrlCache[imageUrl] = placeholderImg.src;
            resolve(placeholderImg); // Resolve with placeholder instead of rejecting
        };

        // Start loading the image
        img.crossOrigin = 'anonymous'; // Enable creating data URLs from loaded images
        img.src = imageUrl;
    });

    return loadingPromises[imageUrl];
};

/**
 * Get a cached image URL or data URL if available
 * @param src Original image source
 * @returns Data URL if cached, or original source if not cached
 */
export const getCachedImageUrl = (src: string): string => {
    // Normalize the URL the same way as preloadImage
    const imageUrl = (src.startsWith('http') || src.includes('supabase') || src.startsWith('/images/')) 
        ? src 
        : `/symbols/${src}`;
    
    // Return data URL if available
    if (dataUrlCache[imageUrl]) {
        return dataUrlCache[imageUrl];
    }

    // If image is cached but no data URL, trigger data URL creation
    if (imageCache[imageUrl] && !dataUrlCache[imageUrl]) {
        try {
            const img = imageCache[imageUrl];
            const canvas = document.createElement('canvas');
            canvas.width = img.width || 50;
            canvas.height = img.height || 50;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                dataUrlCache[imageUrl] = canvas.toDataURL('image/png');
                return dataUrlCache[imageUrl];
            }
        } catch (e) {
            logger.warn('Could not create data URL for', imageUrl);
        }
    }

    // Return normalized URL if not cached
    return imageUrl;
};

/**
 * Preloads critical UI images that are needed immediately
 * This will wait until ALL critical images are loaded, no timeout
 * @returns A promise that resolves when critical images are loaded
 */
export const preloadCriticalUIImages = async (): Promise<void> => {
    try {
        // If there are no critical images to load, just return immediately
        if (CRITICAL_UI_IMAGES.length === 0) {
            logger.info('No critical UI images to preload');
            return;
        }
        
        logger.info(`Starting to preload ${CRITICAL_UI_IMAGES.length} CRITICAL UI images...`);

        // Prioritize loading the intro background image - wait for ALL to complete
        // No timeout here, we MUST wait for critical images
        await Promise.all(
            CRITICAL_UI_IMAGES.map(url =>
                preloadImage(url, true) // Mark as critical
                    .catch(err => {
                        logger.error(`Error loading CRITICAL UI image ${url}:`, err);
                        return null;
                    })
            )
        );

        logger.info('✅ All critical UI images preloaded successfully');
    } catch (error) {
        logger.error("Error preloading critical UI images:", error);
    }
};

/**
 * Preloads all game symbols
 * @returns A promise that resolves only when all symbols are loaded
 */
export const preloadAllGameSymbols = async (): Promise<void> => {
    try {
        // Skip critical UI images loading since they've been removed
        // Just log for consistency
        logger.info('No critical UI images to preload, continuing to game symbols');

        // Continue with symbol loading
        const symbolUrls = await getMasterSymbols(); // Now these are full URLs
        logger.info(`Starting to preload ${symbolUrls.length} game symbols...`);

        // Start loading all symbols and wait for ALL to complete
        await Promise.all(
            symbolUrls.map(url =>
                preloadImage(url)
                    .catch(err => {
                        logger.error(`Error loading ${url}:`, err);
                        return null; // Continue despite errors
                    })
            )
        );

        logger.info('✅ All game symbols successfully preloaded');
    } catch (error) {
        logger.error("Error preloading game symbols:", error);
    }
};

/**
 * Hook to use cached images
 * @param src The image source URL
 * @returns The loading status and cached image element
 */
export const useImageCache = (src: string) => {
    // Normalize the URL consistently
    const imageUrl = (src.startsWith('http') || src.includes('supabase') || src.startsWith('/images/')) 
        ? src 
        : `/symbols/${src}`;
    
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
        loadingStatus[imageUrl] || 'loading'
    );

    useEffect(() => {
        if (!src) return;

        // If image is already in cache, update status immediately
        if (imageCache[imageUrl]) {
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
        image: imageCache[imageUrl],
        cachedUrl: dataUrlCache[imageUrl] || imageUrl
    };
};

/**
 * Get loading status of a specific image
 * @param src The image source URL
 * @returns The loading status
 */
export const getImageLoadingStatus = (src: string): 'loading' | 'loaded' | 'error' => {
    // Normalize URL consistently
    const imageUrl = (src.startsWith('http') || src.includes('supabase') || src.startsWith('/images/')) 
        ? src 
        : `/symbols/${src}`;
    return loadingStatus[imageUrl] || 'loading';
};

// If you need to export a helper:
export async function getAllSymbolUrls() {
  return await getMasterSymbols(); // Already full URLs
} 