// Mock implementation of the useImageCache hook
import { loadedImages } from '../../utils/symbolCacheUtils';

export const dataUrlCache: Record<string, string> = {};
export const loadingStatus: Record<string, 'loading' | 'loaded' | 'error'> = {};

// Mock getMasterSymbols for tests
export const getMasterSymbols = async () => [
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//1.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//2.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//3.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//4.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//5.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//6.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//7.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//8.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//9.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//10.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//11.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//12.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//13.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//14.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//15.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//16.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//17.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//18.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//19.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//20.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//21.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//22.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//23.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//24.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//25.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//26.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//27.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//28.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//29.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//30.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//31.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//32.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//33.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//34.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//35.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//36.webp',
  'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/icons//37.webp'
];

// Improved preload function that actually marks the images as loaded
export const preloadAllGameSymbols = jest.fn().mockImplementation(async () => {
    // Mark all symbols as loaded in the loadedImages object
    const symbols = await getMasterSymbols();
    symbols.forEach(symbol => {
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