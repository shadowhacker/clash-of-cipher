import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadingProgress } from '../hooks/useImageCache';

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

            // If fully loaded or if we've reached 100%, start fade out
            if (loadingProgress.percentage >= 100) {
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
        // show loading screen for at least 1.5 seconds
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
        }, 1500);

        // Failsafe - if loading takes too long (over 15s), proceed anyway
        const failsafeTimeout = setTimeout(() => {
            clearInterval(updateProgress);
            setProgress(100);
            setMessage('Begin your tapasya...');
            setFadeOut(true);

            setTimeout(() => {
                setIsLoading(false);
                if (onComplete) onComplete();
            }, 1000);
        }, 15000);

        return () => {
            clearInterval(updateProgress);
            clearTimeout(minLoadingTimeout);
            clearTimeout(failsafeTimeout);
        };
    }, [onComplete]);

    if (!isLoading) return null;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{
                background: 'radial-gradient(circle, #1a0d05 0%, #0e0817 100%)',
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
            <div className="flex flex-col items-center max-w-md px-6 py-8">
                <h1 className="text-4xl font-bold text-amber-400 mb-6">Dhyanam</h1>
                <p className="text-amber-300/80 text-center mb-8">
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