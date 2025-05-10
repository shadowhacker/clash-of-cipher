
// Generate or retrieve device ID from local storage
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('cipher-clash-device-id');
  
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('cipher-clash-device-id', deviceId);
  }
  
  return deviceId;
};

// Save player name to local storage
export const savePlayerName = (name: string): void => {
  localStorage.setItem('cipher-clash-player-name', name);
};

// Get player name from local storage
export const getPlayerName = (): string | null => {
  return localStorage.getItem('cipher-clash-player-name');
};
