
import React from 'react';
import AudioControls from './AudioControls';
import Leaderboard from './Leaderboard';
import { HelpCircle } from 'lucide-react';

interface HeaderControlsProps {
  onOpenGuide: () => void;
  personalBest: number;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({ 
  onOpenGuide,
  personalBest
}) => {
  return (
    <div className="flex items-center space-x-2">
      <AudioControls />
      <Leaderboard personalBest={personalBest} />
      <button
        onClick={onOpenGuide}
        className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
        aria-label="How to Play"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

export default HeaderControls;
