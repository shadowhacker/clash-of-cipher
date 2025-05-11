import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface GuideScreenProps {
  open: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
  onStart?: () => void;
}

const GuideScreen: React.FC<GuideScreenProps> = ({ open, onClose, isFirstTime = false, onStart }) => {
  const rules = [
    'Symbols blink for 1 s',
    'Repeat them within 10 s',
    'You get 2 lives—each mistake costs 1',
    'Score climbs every correct round',
    '💎 Gems drop every 10 rounds, 🔥 Jackpot every 20'
  ];

  const points = [
    'Base = round number',
    '+ Speed — finish faster, earn up to ×2',
    '+ Streak — flawless rounds stack +25 % each'
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {isFirstTime ? 'Welcome to Cipher Clash!' : 'How to Play'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-8">
          {/* Rules Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">How to Play</h3>
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 text-lg"
                >
                  <span className="text-amber-500 font-bold">{index + 1}️⃣</span>
                  <p className="text-gray-700">{rule}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Points Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Points Cheat-Sheet</h3>
            <div className="space-y-2">
              {points.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + rules.length) * 0.1 }}
                  className="flex items-start gap-2 text-lg"
                >
                  <span className="text-gray-500">•</span>
                  <p className="text-gray-700">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Start Game Button */}
          {onStart && (
            <Button
              onClick={onStart}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white text-lg py-6"
            >
              Start Game
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuideScreen; 