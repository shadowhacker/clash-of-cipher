import React from 'react';
import { HelpCircle } from 'lucide-react';
import GameButton from './GameButton';

interface HelpButtonProps {
    onClick: () => void;
    className?: string;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onClick, className = '' }) => {
    return (
        <GameButton
            onClick={onClick}
            icon={<HelpCircle className="w-5 h-5" />}
            label="How to Play"
            className={className}
        />
    );
};

export default HelpButton; 