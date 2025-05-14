import { render, screen, waitFor, act } from '@testing-library/react';
import {
    preloadImage,
    getCachedImageUrl,
    preloadCriticalUIImages,
    preloadAllGameSymbols,
    useImageCache,
    getImageLoadingStatus,
    loadingProgress,
    dataUrlCache,
    loadingStatus,
    loadingPromises
} from '../useImageCache';

// Mock canvas and Image
class MockImage {
    onload: () => void = () => { };
    onerror: () => void = () => { };
    src: string = '';
    width: number = 50;
    height: number = 50;
    crossOrigin: string | null = null;

    constructor() {
        setTimeout(() => {
            this.onload();
        }, 0);
    }
}

// Use type assertion to avoid TypeScript errors
global.Image = MockImage as unknown as typeof Image;

// Mock canvas and context
const mockCtx = {
    drawImage: jest.fn(),
};

const mockToDataURL = jest.fn().mockReturnValue('data:image/png;base64,mockData');

// Store the original createElement to avoid infinite recursion
const originalCreateElement = global.document.createElement;

// Mock canvas creation only, use original implementation for other elements
global.document.createElement = jest.fn((tagName) => {
    if (tagName === 'canvas') {
        return {
            getContext: jest.fn().mockReturnValue(mockCtx),
            width: 0,
            height: 0,
            toDataURL: mockToDataURL,
        };
    }
    // Use the original implementation for other elements
    return originalCreateElement.call(document, tagName);
});

// Test component to test the hook
const TestComponent = ({ src }: { src: string }) => {
    const { status, cachedUrl } = useImageCache(src);
    return (
        <div>
            <div data-testid="status">{status}</div>
            <div data-testid="url">{cachedUrl}</div>
        </div>
    );
};

describe('useImageCache', () => {
    beforeEach(() => {
        // Clear caches before each test
        Object.keys(dataUrlCache).forEach(key => delete dataUrlCache[key]);
        Object.keys(loadingStatus).forEach(key => delete loadingStatus[key]);
        Object.keys(loadingPromises).forEach(key => delete loadingPromises[key]);

        // Reset loading progress
        loadingProgress.total = 0;
        loadingProgress.loaded = 0;
        loadingProgress.criticalTotal = 0;
        loadingProgress.criticalLoaded = 0;

        // Clear mocks
        jest.clearAllMocks();
    });

    test('preloadImage should load and cache an image', async () => {
        // Test preloading a regular image
        const promise = preloadImage('/test.png');

        await waitFor(() => {
            expect(loadingStatus['/test.png']).toBe('loaded');
        });

        const img = await promise;
        expect(img).toBeDefined();
        expect(loadingProgress.loaded).toBe(1);
        expect(loadingProgress.total).toBe(1);
    });

    test('preloadImage should handle critical images', async () => {
        // Test with critical flag
        await preloadImage('/critical.png', true);

        expect(loadingProgress.criticalLoaded).toBe(1);
        expect(loadingProgress.criticalTotal).toBe(1);
    });

    test('getCachedImageUrl should return data URL if available', () => {
        // Add a mock data URL to the cache
        dataUrlCache['/cached.png'] = 'data:image/png;base64,test';

        const url = getCachedImageUrl('/cached.png');
        expect(url).toBe('data:image/png;base64,test');
    });

    test('preloadCriticalUIImages loads all critical images', async () => {
        await preloadCriticalUIImages();

        expect(loadingProgress.criticalLoaded).toBeGreaterThan(0);
        expect(loadingProgress.criticalTotal).toBeGreaterThan(0);
        expect(loadingProgress.criticalComplete).toBe(true);
    });

    test('preloadAllGameSymbols loads all game symbols', async () => {
        await preloadAllGameSymbols();

        expect(loadingProgress.loaded).toBeGreaterThan(0);
    });

    test('useImageCache hook returns loading status and cached URL', async () => {
        // Prepare cache for test
        dataUrlCache['/test-hook.png'] = 'data:image/png;base64,hooked';
        loadingStatus['/test-hook.png'] = 'loaded';

        render(<TestComponent src="/test-hook.png" />);

        expect(screen.getByTestId('status').textContent).toBe('loaded');
        expect(screen.getByTestId('url').textContent).toBe('data:image/png;base64,hooked');
    });

    test('useImageCache handles uncached images', async () => {
        render(<TestComponent src="/uncached.png" />);

        // Initially loading
        expect(screen.getByTestId('status').textContent).toBe('loading');

        // After loading completes
        await waitFor(() => {
            expect(screen.getByTestId('status').textContent).toBe('loaded');
        });
    });

    test('getImageLoadingStatus returns correct status', () => {
        loadingStatus['/status-test.png'] = 'loaded';

        const status = getImageLoadingStatus('/status-test.png');
        expect(status).toBe('loaded');

        const unknownStatus = getImageLoadingStatus('/unknown.png');
        expect(unknownStatus).toBe('loading');
    });

    test('loadingProgress calculates percentages correctly', () => {
        loadingProgress.total = 10;
        loadingProgress.loaded = 5;

        expect(loadingProgress.percentage).toBe(50);

        loadingProgress.total = 0;
        expect(loadingProgress.percentage).toBe(0);
    });
}); 