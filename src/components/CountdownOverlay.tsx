import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  onComplete: () => void;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete }) => {
  const [count, setCount] = useState<number | string>('Loading...');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Initial loading state
    const loadingTimer = setTimeout(() => {
      setCount(3);
    }, 3000);

    // Countdown sequence
    const countdownTimers = [3, 2, 1, 'GO!'].map((value, index) => {
      return setTimeout(() => {
        setCount(value);
        if (value === 'GO!') {
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Wait for fade out animation
          }, 1000);
        }
      }, (index + 1) * 1000 + 3000); // Add 3s for loading state
    });

    return () => {
      clearTimeout(loadingTimer);
      countdownTimers.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
        >
          <motion.div
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-white text-6xl font-extrabold"
          >
            {count}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CountdownOverlay; 