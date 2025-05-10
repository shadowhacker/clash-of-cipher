
import React, { useEffect } from 'react';

interface ThemeManagerProps {
  currentTheme: string;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ currentTheme }) => {
  // Apply theme to body background
  useEffect(() => {
    document.body.className = `min-h-screen transition-colors duration-1000 ${currentTheme.replace('bg-', 'bg-')}`;
    
    return () => {
      document.body.className = '';
    };
  }, [currentTheme]);

  // Component doesn't render anything, just manages theme
  return null;
};

export default ThemeManager;
