import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameButtonProps {
    onClick: () => void;
    icon: ReactNode;
    label: string;
    className?: string;
}

/**
 * A reusable game button component for sound, leaderboard, and help buttons
 */
const GameButton: React.FC<GameButtonProps> = ({
    onClick,
    icon,
    label,
    className = '',
}) => {
    return (
        <Button
            onClick={onClick}
            size="icon"
            className={cn(
                "p-2 rounded-full bg-amber-800/50 hover:bg-amber-700/60 text-amber-400 transition-colors",
                className
            )}
            aria-label={label}
            title={label}
        >
            {icon}
        </Button>
    );
};

export default GameButton; 