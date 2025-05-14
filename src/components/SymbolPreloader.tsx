import { useEffect } from 'react';
import { MASTER_SYMBOLS } from '../hooks/useGame';
import { preloadAllGameSymbols } from '../hooks/useImageCache';

// Global cache to track loaded images
const loadedImages: Record<string, boolean> = {};

// Global promise to ensure we only preload once
let preloadPromise: Promise<void> | null = null;

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
    // If we already have a preload promise in progress, return it
    if (preloadPromise) return preloadPromise;

    // If all images are already loaded, return immediately
    if (areAllImagesLoaded()) return Promise.resolve();

    // Create a new preload promise
    preloadPromise = new Promise<void>((resolve) => {
        // Start with a short timeout to ensure we don't block the game
        const timeout = setTimeout(() => {
            console.warn("Symbol loading timed out - forcing game to continue");
            forceMarkAllLoaded();
            resolve();
        }, 2000);

        const promises = MASTER_SYMBOLS.map((symbol) => {
            // Skip if already loaded
            if (loadedImages[symbol]) return Promise.resolve();

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

    return preloadPromise;
};

// Function to preload specific symbols - with a short timeout
export const preloadSpecificSymbols = async (symbols: string[]): Promise<void> => {
    // If all images are already loaded, return immediately
    if (areAllImagesLoaded()) return Promise.resolve();

    return new Promise<void>((resolve) => {
        // Quick timeout to ensure we don't block the game for too long
        const timeout = setTimeout(() => {
            // Mark requested symbols as loaded
            symbols.forEach(symbol => {
                loadedImages[symbol] = true;
            });
            resolve();
        }, 500);

        const promises = symbols.map((symbol) => {
            // Skip if already loaded
            if (loadedImages[symbol]) return Promise.resolve();

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
        // Start preloading all symbols immediately
        preloadAllGameSymbols()
            .then(() => {
                console.log('All symbols preloaded successfully');
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