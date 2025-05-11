import React from 'react';
import { motion } from 'framer-motion';

interface CountdownOverlayProps {
  count: number | string;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ count }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <motion.div
        key={count}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0 }}
        className="text-white text-6xl font-extrabold"
      >
        {count}
      </motion.div>
    </div>
  );
};

export default CountdownOverlay; 