/**
 * Calculate the flash time for a given level using an oscillating pattern
 * @param level The current game level
 * @returns The flash time in seconds
 */
export const getFlashTime = (level: number): number => {
  const phase = Math.floor((level - 1) / 20) % 2;       // 0 = down, 1 = up
  const index = (level - 1) % 20;
  const step = 0.8 / 19;

  return phase === 0
    ? 2.0 - (step * index)    // decreasing
    : 1.2 + (step * index);   // increasing
}; 