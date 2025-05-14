import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface InitialLoadingScreenProps {
    onComplete?: () => void;
}

/**
 * A component that shows a loading screen when the game first loads
 * Improves the perceived performance and user experience
 */
const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Simulate loading progress for better UX
        const startTime = Date.now();
        const maxLoadTime = 5000; // Maximum loading time of 5 seconds

        // Update progress every 100ms
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min(Math.round((elapsed / maxLoadTime) * 100), 99);
            setProgress(newProgress);
        }, 100);

        // Show loading animation for at least 1.5 seconds
        const minLoadingTimeout = setTimeout(() => {
            clearInterval(interval);

            // Complete the loading
            setProgress(100);

            // Start fade out animation
            setTimeout(() => setFadeOut(true), 500);

            // Complete and remove from DOM after fade out
            setTimeout(() => {
                setIsLoading(false);
                if (onComplete) onComplete();
            }, 1000);
        }, 1500);

        return () => {
            clearInterval(interval);
            clearTimeout(minLoadingTimeout);
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
                    Preparing your meditation journey...
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