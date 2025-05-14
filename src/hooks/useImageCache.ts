import { useState, useEffect } from 'react';
import { MASTER_SYMBOLS } from './useGame';

// Create a global cache that persists across component mounts
const imageCache: Record<string, HTMLImageElement> = {};
const loadingPromises: Record<string, Promise<HTMLImageElement>> = {};
const loadingStatus: Record<string, 'loading' | 'loaded' | 'error'> = {};

// Important UI images to preload
const CRITICAL_UI_IMAGES = [
    '/images/bg-intro.png'  // Intro background image
];

/**
 * Preloads and caches an image
 * @param src The image source URL
 * @returns A promise that resolves when the image is loaded
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
    // If the image is already in cache, return immediately
    if (imageCache[src]) {
        loadingStatus[src] = 'loaded';
        return Promise.resolve(imageCache[src]);
    }

    // If this image is already loading, return the existing promise
    if (loadingPromises[src]) {
        return loadingPromises[src];
    }

    // Start loading the image
    loadingStatus[src] = 'loading';

    // Create and store the loading promise
    loadingPromises[src] = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            // Store the loaded image in cache
            imageCache[src] = img;
            loadingStatus[src] = 'loaded';
            resolve(img);
        };

        img.onerror = () => {
            loadingStatus[src] = 'error';
            reject(new Error(`Failed to load image: ${src}`));
        };

        // Start loading the image
        img.src = src;
    });

    return loadingPromises[src];
};

/**
 * Preloads critical UI images that are needed immediately
 * @returns A promise that resolves when critical images are loaded
 */
export const preloadCriticalUIImages = async (): Promise<void> => {
    try {
        // Prioritize loading the intro background image
        await Promise.all(
            CRITICAL_UI_IMAGES.map(url =>
                preloadImage(url).catch(err => {
                    console.error(`Error loading UI image ${url}:`, err);
                    return null;
                })
            )
        );
        console.log('Critical UI images preloaded');
    } catch (error) {
        console.error("Error preloading critical UI images:", error);
    }
};

/**
 * Preloads all game symbols at once
 * @returns A promise that resolves when all symbols are loaded or after timeout
 */
export const preloadAllGameSymbols = async (): Promise<void> => {
    try {
        // First load critical UI images
        await preloadCriticalUIImages();

        // Create an array of all symbol URLs
        const symbolUrls = MASTER_SYMBOLS.map(symbol => `/symbols/${symbol}`);

        // Start loading all symbols with a timeout
        const loadingPromise = Promise.all(
            symbolUrls.map(url => preloadImage(url).catch(err => {
                console.error(`Error loading ${url}:`, err);
                return null; // Continue despite errors
            }))
        );

        // Create a timeout promise
        const timeoutPromise = new Promise<null>(resolve =>
            setTimeout(() => resolve(null), 5000) // 5-second timeout
        );

        // Race between loading all images and timeout
        await Promise.race([loadingPromise, timeoutPromise]);

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
        image: imageCache[src]
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