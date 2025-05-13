
import React, { useEffect } from 'react';

interface ThemeManagerProps {
  currentTheme: string;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ currentTheme }) => {
  // Apply theme to body background
  useEffect(() => {
    document.body.className = `min-h-screen transition-colors duration-1000 bg-gradient-to-b from-indigo-950 to-amber-950`;
    
    return () => {
      document.body.className = '';
    };
  }, [currentTheme]);

  // Component doesn't render anything, just manages theme
  return null;
};

export default ThemeManager;
