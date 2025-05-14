// Mock implementation of the useImageCache hook
import { MASTER_SYMBOLS } from '../../utils/symbolManager';
import { loadedImages } from '../../utils/symbolCacheUtils';

export const dataUrlCache: Record<string, string> = {};
export const loadingStatus: Record<string, 'loading' | 'loaded' | 'error'> = {};

// Improved preload function that actually marks the images as loaded
export const preloadAllGameSymbols = jest.fn().mockImplementation(() => {
    // Mark all MASTER_SYMBOLS as loaded in the loadedImages object
    MASTER_SYMBOLS.forEach(symbol => {
        const path = `/symbols/${symbol}`;
        loadingStatus[path] = 'loaded';
        dataUrlCache[path] = `data:image/png;base64,mockDataUrl`;
        // This is the key step - mark each symbol as loaded in the loadedImages object
        loadedImages[symbol] = true;
    });

    console.log('✅ All game symbols successfully preloaded');
    return Promise.resolve();
});

// Hook implementation
export const useImageCache = jest.fn().mockImplementation((src) => {
    // Ensure the status and dataUrlCache are set for this src
    if (!loadingStatus[src]) {
        loadingStatus[src] = 'loaded';
        dataUrlCache[src] = `data:image/png;base64,mockDataUrl`;
    }

    return {
        status: loadingStatus[src],
        image: { src },
        cachedUrl: dataUrlCache[src] || src
    };
});

// Mock for preloadImage function
export const preloadImage = jest.fn().mockImplementation((src) => {
    loadingStatus[src] = 'loaded';
    dataUrlCache[src] = `data:image/png;base64,mockDataUrl`;

    // If this is a symbol, mark it as loaded in the loadedImages object
    const symbolMatch = src.match(/\/symbols\/(symbol-\d+\.png)$/);
    if (symbolMatch) {
        loadedImages[symbolMatch[1]] = true;
    }

    return Promise.resolve({ src });
}); 