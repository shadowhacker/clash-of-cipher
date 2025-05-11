
import { useState, useEffect } from 'react';

export interface GameLayoutState {
  showHeader: boolean;
  showFooter: boolean;
}

export const useGameLayout = () => {
  const [layoutState, setLayoutState] = useState<GameLayoutState>({
    showHeader: true,
    showFooter: true,
  });

  const setHeaderVisibility = (visible: boolean) => {
    setLayoutState(prev => ({ ...prev, showHeader: visible }));
  };

  const setFooterVisibility = (visible: boolean) => {
    setLayoutState(prev => ({ ...prev, showFooter: visible }));
  };

  return {
    ...layoutState,
    setHeaderVisibility,
    setFooterVisibility,
  };
};
