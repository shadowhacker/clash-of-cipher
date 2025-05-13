
import React from 'react';
import { Button } from '@/components/ui/button';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-indigo-950 to-amber-950">
      <div className="w-full max-w-sm p-6 text-center relative">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/f24a658f-3a8a-4ef1-88ca-0ea1e57c865b.png')] bg-center bg-contain bg-no-repeat opacity-20"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-6 text-amber-500">🧘 How to Play</h1>
          <ul className="mb-8 text-amber-200 space-y-3 text-lg">
            <li>• Meditate on the symbols (flash 1s)</li>
            <li>• Recall them in order within 10 seconds</li>
            <li>• Earn spiritual points based on round, speed, and focus</li>
            <li>• Higher rounds = more base points</li>
            <li>• Finish faster = x1-x2 speed bonus</li>
            <li>• Perfect focus = +25% per flawless round</li>
            <li>• You have 2 lives. May wisdom guide you!</li>
          </ul>
          <div className="border-t border-amber-700 pt-6 mt-6">
            <Button 
              onClick={onStart}
              className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-6 rounded-2xl font-semibold"
            >
              Begin Your Tapasya
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
