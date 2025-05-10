
import React from 'react';
import { Button } from '@/components/ui/button';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900 bg-opacity-95">
      <div className="w-full max-w-sm p-6 text-center">
        <h1 className="text-3xl font-bold mb-6 text-white">🧠 How to Play</h1>
        <ul className="mb-8 text-white space-y-3 text-lg">
          <li>• Watch symbols flash (1 second)</li>
          <li>• Tap them in order within 10 seconds</li>
          <li>• Survive 10 rounds to level-up</li>
          <li>• You have 2 lives. Good luck!</li>
        </ul>
        <div className="border-t border-indigo-300 pt-4 mb-6">
          <p className="text-indigo-200">Built by ShadowHacker</p>
        </div>
        <Button 
          onClick={onStart}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-lg py-6"
        >
          Lesss Go
        </Button>
      </div>
    </div>
  );
};

export default StartScreen;
