import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  onComplete: () => void;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'loading' | 'countdown'>('loading');
  const [count, setCount] = useState<number | string>(3);

  useEffect(() => {
    // Phase 1: Loading
    const loadingTimer = setTimeout(() => {
      setPhase('countdown');
    }, 3000);

    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    if (phase === 'countdown') {
      const countdown = [3, 2, 1, 'GO!'];
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex < countdown.length) {
          setCount(countdown[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(interval);
          onComplete();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <AnimatePresence mode="wait">
        {phase === 'loading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-6xl font-extrabold text-white"
          >
            Loading...
          </motion.div>
        ) : (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-8xl font-extrabold text-white"
          >
            {count}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountdownOverlay; 