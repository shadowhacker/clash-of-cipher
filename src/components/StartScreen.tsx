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
          <li>• Memorise the symbols as they flash</li>
          <li>• Tap them in order within 10 seconds</li>
          <li>• Earn points based on level, speed, and streak</li>
          <li>• Higher levels have more symbols and shorter viewing time</li>
          <li>• Finish faster = x1-x2 speed bonus</li>
          <li>• Perfect streak = +25% per flawless round</li>
          <li>• You have 2 lives. Good luck!</li>
        </ul>
        <div className="border-t border-indigo-300 pt-6 mt-6">
          <Button
            onClick={onStart}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-lg py-6"
          >
            Let's Go!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
