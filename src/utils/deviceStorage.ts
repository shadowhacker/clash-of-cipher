// Generate a UUID v4 compatible with all browsers
const generateUUID = (): string => {
  // Use crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for browsers without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Store and retrieve leaderboard UUID from localStorage
export const getUserId = (): string | null => {
  return localStorage.getItem('cipher-clash-device-id');
};

export const setUserId = (id: string): void => {
  localStorage.setItem('cipher-clash-device-id', id);
};

// Save player name to local storage
export const savePlayerName = (name: string): void => {
  localStorage.setItem('cipher-clash-player-name', name);
};

// Get player name from local storage
export const getPlayerName = (): string | null => {
  return localStorage.getItem('cipher-clash-player-name');
};
