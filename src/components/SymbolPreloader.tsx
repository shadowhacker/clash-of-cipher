import { useEffect } from 'react';
import { preloadAllGameSymbols } from '../hooks/useImageCache';
import { restoreCachedImages, persistCachedImages } from '../utils/symbolCacheUtils';
import logger from '../utils/logger';

interface SymbolPreloaderProps {
    onComplete?: () => void;
}

/**
 * A component that preloads all game symbols
 * This component doesn't render anything visible
 */
const SymbolPreloader: React.FC<SymbolPreloaderProps> = ({ onComplete }) => {
    useEffect(() => {
        // Immediately try to restore from localStorage
        restoreCachedImages();

        // Start preloading all symbols
        preloadAllGameSymbols()
            .then(() => {
                logger.info('All symbols preloaded successfully');
                // Save to localStorage for next session
                persistCachedImages();
                if (onComplete) onComplete();
            })
            .catch(error => {
                logger.error('Error preloading symbols:', error);
                if (onComplete) onComplete();
            });
    }, [onComplete]);

    return null; // This component doesn't render anything
};

export default SymbolPreloader;
