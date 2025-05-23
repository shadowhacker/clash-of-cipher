import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { loadingProgress } from '../hooks/useImageCache';
import logger from '../utils/logger';

interface InitialLoadingScreenProps {
    onComplete?: () => void;
}

/**
 * A component that shows a loading screen when the game first loads
 * Shows actual loading progress of game images
 */
const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [message, setMessage] = useState('Preparing your spiritual journey...');

    useEffect(() => {
        // Use a real progress tracker based on actual image loading
        const updateProgress = setInterval(() => {
            // Get the actual loading percentage from our tracker
            setProgress(loadingProgress.percentage);

            // Update loading message based on progress
                if (loadingProgress.percentage <= 30) {
                    setMessage('Awakening ancient symbols...');
                } else if (loadingProgress.percentage <= 70) {
                    setMessage('Aligning spiritual energies...');
                } else if (loadingProgress.percentage < 100) {
                    setMessage('Preparing your path to enlightenment...');
                } else {
                    setMessage('Your meditation journey awaits...');
            }

            // Check if we've loaded enough assets to proceed
            const readyToComplete = loadingProgress.percentage >= 100;

            if (readyToComplete) {
                logger.info('All images loaded, moving to fade-out phase');
                clearInterval(updateProgress);

                // Show 100% for at least half a second before fading
                setTimeout(() => setFadeOut(true), 500);

                // Complete and remove from DOM after fade out
                setTimeout(() => {
                    setIsLoading(false);
                    if (onComplete) onComplete();
                }, 1500);
            }
        }, 100);

        // Minimum loading time - even if assets load quickly, 
        // show loading screen for at least 2 seconds
        const minLoadingTimeout = setTimeout(() => {
            if (loadingProgress.percentage >= 100) {
                clearInterval(updateProgress);
                setProgress(100);
                setFadeOut(true);

                setTimeout(() => {
                    setIsLoading(false);
                    if (onComplete) onComplete();
                }, 1000);
            }
        }, 2000);

        // Extended failsafe - if loading takes more than 30s, proceed anyway
        const extendedFailsafeTimeout = setTimeout(() => {
                logger.info('Extended loading timeout reached, proceeding with available images');
                clearInterval(updateProgress);
                setProgress(100);
                setMessage('Begin your tapasya...');
                setFadeOut(true);

                setTimeout(() => {
                    setIsLoading(false);
                    if (onComplete) onComplete();
                }, 1000);
        }, 30000);

        return () => {
            clearInterval(updateProgress);
            clearTimeout(minLoadingTimeout);
            clearTimeout(extendedFailsafeTimeout);
        };
    }, [onComplete]);

    if (!isLoading) return null;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{
                backgroundImage: 'url(/images/gameover.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#0e0817', // Fallback color
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: fadeOut ? 0 : 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Overlay to ensure text is readable against the background image */}
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
            
            <div className="flex flex-col items-center max-w-md px-6 py-8 relative z-10">
                <h1 className="text-4xl font-bold text-amber-400 mb-6" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, letterSpacing: '-0.03em' }}>Dhyanam</h1>
                <p className="text-amber-300/80 text-center mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {message}
                </p>

                {/* Loading bar */}
                <div className="w-64 h-2 bg-amber-900/50 rounded-full overflow-hidden mb-4">
                    <motion.div
                        className="h-full bg-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{
                            type: "spring",
                            stiffness: 50,
                            damping: 10
                        }}
                    />
                </div>

                <p className="text-amber-300/60 text-sm">{progress}%</p>
            </div>
        </motion.div>
    );
};

export default InitialLoadingScreen; 