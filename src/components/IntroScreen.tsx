import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface IntroScreenProps {
  onStart: () => void;
  onShowGuide: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, onShowGuide }) => {
  const [livePlayers, setLivePlayers] = useState<string>('—');
  const [hasSeenGuide, setHasSeenGuide] = useState(false);

  useEffect(() => {
    // Check if user has seen the guide
    const seenGuide = localStorage.getItem('hasSeenGuide');
    setHasSeenGuide(!!seenGuide);

    // TODO: Implement Firestore live players count
    // This is a placeholder for the Firestore implementation
    setLivePlayers('—');
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-2">🔮 Cipher Clash</h1>
        <p className="text-indigo-200 mb-8">👥 {livePlayers} players online</p>

        <div className="space-y-4">
          {hasSeenGuide ? (
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={onStart}
                className="bg-amber-500 hover:bg-amber-600 text-lg px-8 py-6"
              >
                Start Game
              </Button>
              <Button 
                variant="ghost" 
                onClick={onShowGuide}
                className="text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                How to Play
              </Button>
            </div>
          ) : (
            <Button 
              onClick={onShowGuide}
              className="bg-amber-500 hover:bg-amber-600 text-lg px-8 py-6"
            >
              How to Play
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default IntroScreen; 