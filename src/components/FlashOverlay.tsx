import React from 'react';
import { motion } from 'framer-motion';

interface FlashOverlayProps {
  symbols: string[];
}

const FlashOverlay: React.FC<FlashOverlayProps> = ({ symbols }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      <p className="text-sm uppercase tracking-wide text-amber-400 mb-2">
        Memorise these!
      </p>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        {symbols.map((symbol, index) => (
          <span key={index} className="text-4xl text-white">{symbol}</span>
        ))}
      </motion.div>
    </div>
  );
};

export default FlashOverlay; 