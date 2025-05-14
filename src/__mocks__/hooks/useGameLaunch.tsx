import React from 'react';

export const useGameLaunch = jest.fn().mockImplementation(({ onLaunchComplete }) => {
    // Simple mock that immediately calls onLaunchComplete
    setTimeout(onLaunchComplete, 0);

    return {
        launchRun: jest.fn().mockImplementation(() => {
            setTimeout(onLaunchComplete, 0);
        }),
        Overlay: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-overlay">{children}</div>,
    };
}); 