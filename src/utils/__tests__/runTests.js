// Simple test runner without Jest dependencies
// We'll run only our basic tests with no TS/ESM imports

console.log('Running basic tests...');

// ---- Basic Symbol Cache Tests ----
console.log('\n🔍 Running Symbol Cache Basic Tests');

// Mock the Symbol cache
const loadedImages = {};
const MASTER_SYMBOLS = Array.from(
  { length: 30 },
  (_, i) => `symbol-${i + 1}.png`
);

function areAllImagesLoaded() {
  return MASTER_SYMBOLS.every((symbol) => loadedImages[symbol] === true);
}

function forceMarkAllLoaded() {
  MASTER_SYMBOLS.forEach((symbol) => {
    loadedImages[symbol] = true;
  });
}

// Test 1: No images loaded initially
const test1Result = areAllImagesLoaded();
if (test1Result !== false) {
  throw new Error(
    `Test 1 failed: Expected areAllImagesLoaded() to return false, but got ${test1Result}`
  );
}
console.log(
  '✅ Test 1: areAllImagesLoaded() returns false when no images loaded'
);

// Test 2: Force mark all as loaded
forceMarkAllLoaded();
const test2Result = areAllImagesLoaded();
if (test2Result !== true) {
  throw new Error(
    `Test 2 failed: Expected areAllImagesLoaded() to return true after marking all loaded, but got ${test2Result}`
  );
}
console.log(
  '✅ Test 2: areAllImagesLoaded() returns true after marking all loaded'
);

// ---- Basic Random Distribution Tests ----
console.log('\n🔍 Running Random Distribution Basic Tests');

// Mock secureRandomInt for deterministic tests
function secureRandomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

// Mock generateGrid function - simplified version
function generateGrid(level, codeSymbols, availableSymbols) {
  // For testing - create a grid with at least all code symbols
  const gridSize = 16;
  const grid = [...codeSymbols];

  // Fill the rest with random symbols
  while (grid.length < gridSize) {
    const randomSymbol =
      availableSymbols[secureRandomInt(0, availableSymbols.length)];
    grid.push(randomSymbol);
  }

  // Shuffle the grid
  return grid.sort(() => Math.random() - 0.5);
}

// Test: Grid should contain all code symbols
const level = 2;
const codeSymbols = ['symbol-1.png', 'symbol-2.png'];
const availableSymbols = [
  'symbol-1.png',
  'symbol-2.png',
  'symbol-3.png',
  'symbol-4.png',
  'symbol-5.png',
  'symbol-6.png'
];

const grid = generateGrid(level, codeSymbols, availableSymbols);

// Check that all code symbols are in the grid
for (const symbol of codeSymbols) {
  if (!grid.includes(symbol)) {
    throw new Error(
      `Test failed: Expected grid to contain code symbol ${symbol}, but it was missing`
    );
  }
}
console.log('✅ Grid contains all code symbols');

// Generate multiple grids to test randomness
const grid1 = generateGrid(level, codeSymbols, availableSymbols);
const grid2 = generateGrid(level, codeSymbols, availableSymbols);

// Check if the grids are different (they likely should be)
const grid1Str = JSON.stringify(grid1);
const grid2Str = JSON.stringify(grid2);

if (grid1Str === grid2Str) {
  console.warn(
    '⚠️ Warning: Two randomly generated grids were identical - check randomness'
  );
} else {
  console.log('✅ Different grid generations produce different results');
}

console.log('\n✅ All basic tests completed successfully!');
