import React from 'react';
import { useImageCache } from '../hooks/useImageCache';

interface CachedSymbolProps {
    symbol: string;
    index: number;
    className?: string;
}

/**
 * A component that displays a symbol with loading states
 * Uses the image cache to avoid reloading images
 */
const CachedSymbol: React.FC<CachedSymbolProps> = ({ symbol, index, className = '' }) => {
    const { status } = useImageCache(`/symbols/${symbol}`);

    // Get a color based on the symbol to use as a placeholder
    const getSymbolColor = () => {
        // Simple hash function to generate a consistent color from a string
        const hash = symbol.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);

        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 70%, 40%)`;
    };

    return (
        <div
            className={`w-10 h-10 flex items-center justify-center rounded-md ${className}`}
            style={{
                backgroundColor: status === 'loading' ? getSymbolColor() : 'transparent',
                transition: 'background-color 0.3s ease'
            }}
        >
            {status === 'error' ? (
                // Error state - show a fallback
                <div className="text-amber-400 text-xs">
                    Symbol {index + 1}
                </div>
            ) : status === 'loading' ? (
                // Loading state - show a pulsing placeholder
                <div className="w-6 h-6 rounded-md bg-amber-500/30 animate-pulse"></div>
            ) : (
                // Loaded state - show the actual image
                <img
                    src={`/symbols/${symbol}`}
                    alt={`Symbol ${index + 1}`}
                    className="w-10 h-10 object-contain"
                    style={{
                        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                        animationName: 'fadeIn',
                        animationDuration: '0.3s'
                    }}
                />
            )}
        </div>
    );
};

export default CachedSymbol; 