import React from 'react';
import { useImageCache, getCachedImageUrl } from '../hooks/useImageCache';

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
    const imagePath = `${symbol}`;
    const { status, cachedUrl } = useImageCache(imagePath);

    // Ensure we have something to display even if path is incorrect
    const symbolDisplayName = symbol.replace(/^symbol-/, '').replace(/\.\w+$/, '');

    // Get a color based on the symbol to use as a placeholder
    const getSymbolColor = () => {
        // Simple hash function to generate a consistent color from a string
        const hash = symbol.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);

        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 70%, 40%)`;
    };

    // Create an SVG placeholder with the symbol number
    const getPlaceholderSvg = () => {
        const color = getSymbolColor();
        const textColor = 'white';

        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='4' fill='${color.replace('#', '%23')}'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='16' fill='${textColor.replace('#', '%23')}' text-anchor='middle'%3E${symbolDisplayName}%3C/text%3E%3C/svg%3E`;
    };

    // Use inline CSS variables for better animation
    const styleVars = {
        '--symbol-color': getSymbolColor(),
    } as React.CSSProperties;

    return (
        <div
            className={`w-10 h-10 flex items-center justify-center rounded-md ${className}`}
            style={{
                ...styleVars,
                backgroundColor: status === 'loading' ? 'var(--symbol-color)' : 'transparent',
                transition: 'background-color 0.3s ease',
            }}
        >
            {status === 'error' ? (
                // Error state - show a meaningful fallback
                <div
                    className="w-full h-full flex items-center justify-center text-white text-xs font-bold rounded-md"
                    style={{
                        background: getSymbolColor(),
                        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.2)'
                    }}
                >
                    {symbolDisplayName}
                </div>
            ) : status === 'loading' ? (
                // Loading state - show a pulsing placeholder with the symbol number
                <div
                    className="w-full h-full rounded-md bg-opacity-80 animate-pulse flex items-center justify-center"
                    style={{
                        backgroundImage: `url("${getPlaceholderSvg()}")`,
                        backgroundSize: 'cover'
                    }}
                >
                </div>
            ) : (
                // Loaded state - show the cached image with fade-in effect
                <img
                    src={cachedUrl} // Use cached URL (data URI) if available
                    alt={`Symbol ${symbolDisplayName}`}
                    className="w-10 h-10 object-contain"
                    style={{
                        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                        animation: 'fadeIn 0.3s ease-in',
                    }}
                    onError={(e) => {
                        // If image fails to load at runtime, switch to placeholder
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite error loop
                        target.src = getPlaceholderSvg();
                    }}
                />
            )}
        </div>
    );
};

export default CachedSymbol; 