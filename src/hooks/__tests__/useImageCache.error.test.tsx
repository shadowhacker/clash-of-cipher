import { render, screen, waitFor } from '@testing-library/react';
import {
    preloadImage,
    useImageCache,
    loadingStatus,
    loadingProgress,
    dataUrlCache,
    loadingPromises
} from '../useImageCache';

// Create a failing Image mock for error testing
class FailingImage {
    onload: () => void = () => { };
    onerror: () => void = () => { };
    src: string = '';
    width: number = 50;
    height: number = 50;
    crossOrigin: string | null = null;

    constructor() {
        // Simulate an image loading error
        setTimeout(() => {
            this.onerror();
        }, 0);
    }
}

// Test component that uses the hook
const TestComponent = ({ src }: { src: string }) => {
    const { status, cachedUrl } = useImageCache(src);
    return (
        <div>
            <div data-testid="status">{status}</div>
            <div data-testid="url">{cachedUrl}</div>
        </div>
    );
};

describe('useImageCache Error Handling', () => {
    const originalImage = global.Image;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    beforeEach(() => {
        // Mock console.error to prevent noise in test output
        console.error = jest.fn();
        console.warn = jest.fn();

        // Clear caches before each test
        Object.keys(dataUrlCache).forEach(key => delete dataUrlCache[key]);
        Object.keys(loadingStatus).forEach(key => delete loadingStatus[key]);
        Object.keys(loadingPromises).forEach(key => delete loadingPromises[key]);

        // Reset loading progress
        loadingProgress.total = 0;
        loadingProgress.loaded = 0;
        loadingProgress.criticalTotal = 0;
        loadingProgress.criticalLoaded = 0;

        // Set failing Image mock with proper type assertion
        global.Image = FailingImage as unknown as typeof Image;
    });

    afterEach(() => {
        // Restore original Image constructor
        global.Image = originalImage;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
    });

    test('preloadImage should handle image loading errors', async () => {
        // Attempt to preload an image that will fail
        const promise = preloadImage('/failing-image.png');

        // Wait for the error status to be set
        await waitFor(() => {
            expect(loadingStatus['/failing-image.png']).toBe('error');
        });

        // Even with error, the promise should resolve with a placeholder
        const result = await promise;
        expect(result).toBeDefined();

        // Progress counters should still increment
        expect(loadingProgress.loaded).toBe(1);
        expect(loadingProgress.total).toBe(1);

        // Console error should be called
        expect(console.error).toHaveBeenCalled();
    });

    test('preloadImage should handle critical image errors', async () => {
        // Attempt to preload a critical image that will fail
        await preloadImage('/failing-critical.png', true);

        // Critical counters should still increment
        expect(loadingProgress.criticalLoaded).toBe(1);
        expect(loadingProgress.criticalTotal).toBe(1);

        // Error status should be set
        expect(loadingStatus['/failing-critical.png']).toBe('error');
    });

    test('useImageCache hook handles image loading errors', async () => {
        render(<TestComponent src="/hook-error.png" />);

        // Initially loading
        expect(screen.getByTestId('status').textContent).toBe('loading');

        // After error occurs
        await waitFor(() => {
            expect(screen.getByTestId('status').textContent).toBe('error');
        });
    });
}); 