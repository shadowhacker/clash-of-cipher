// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock the window.crypto functionality for random number generation
Object.defineProperty(window, 'crypto', {
    value: {
        getRandomValues: (buffer: Uint32Array) => {
            // Fill the buffer with deterministic values for testing
            for (let i = 0; i < buffer.length; i++) {
                // Use a predictable pattern for testing
                buffer[i] = i * 1000 + 12345;
            }
            return buffer;
        },
        subtle: {},
    },
});

// Create a minimal HTMLImageElement-like implementation
class MockImage {
    src: string = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    width: number = 50;
    height: number = 50;
    crossOrigin: string | null = null;

    constructor() {
        setTimeout(() => {
            this.onload && this.onload();
        }, 10);
    }
}

// Replace the global Image constructor
(global as any).Image = MockImage;

// Mock canvas methods
HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation(() => {
    return {
        drawImage: jest.fn(),
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn().mockReturnValue({
            data: new Uint8ClampedArray(0),
        }),
        putImageData: jest.fn(),
        createImageData: jest.fn(),
        setTransform: jest.fn(),
        transform: jest.fn(),
        fillText: jest.fn(),
        strokeText: jest.fn(),
        measureText: jest.fn().mockReturnValue({ width: 0 }),
    };
});

HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,mockDataUrl'); 