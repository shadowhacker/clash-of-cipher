
import React from 'react';
import { Button } from '@/components/ui/button';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950">
      <div className="w-full max-w-sm p-6 text-center relative">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/d1a23847-43b7-49a4-9a33-7ca331ec75c8.png')] bg-center bg-cover bg-no-repeat opacity-50"></div>
        
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
            <button 
              onClick={onStart}
              className="w-full py-3 rounded-md font-bold uppercase tracking-wider text-amber-300 text-lg transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(to bottom, #8B4513, #5D2906)',
                border: '2px solid #C9852A',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                textShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)'
              }}
            >
              Begin Your Tapasya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
