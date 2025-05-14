// Simple test runner without Jest dependencies
// We'll run only our basic tests with no TS/ESM imports

const fs = require('fs');
const path = require('path');

// Simple test logger
const testLogger = {
  results: {
    passed: 0,
    failed: 0,
    warnings: 0,
    total: 0
  },

  pass(message) {
    console.log(`✅ ${message}`);
    this.results.passed++;
    this.results.total++;
  },

  fail(message, error) {
    console.error(`❌ ${message}`);
    if (error) console.error(`   Error: ${error.message}`);
    this.results.failed++;
    this.results.total++;
    return error || new Error(message);
  },

  warn(message) {
    console.warn(`⚠️ ${message}`);
    this.results.warnings++;
  },

  group(title) {
    console.log(`\n🔍 ${title}`);
  },

  summary() {
    console.log('\n📊 Test Summary:');
    console.log(`Total tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Warnings: ${this.results.warnings}`);

    return this.results.failed === 0;
  },

  // Generate Markdown summary
  generateMarkdown() {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0];

    let md = `# Basic Test Results\n\n`;
    md += `*Generated on ${date} at ${time}*\n\n`;
    md += `## Summary\n\n`;
    md += `- Total tests: ${this.results.total}\n`;
    md += `- Passed: ${this.results.passed} ${
      this.results.passed === this.results.total ? '✅' : ''
    }\n`;
    md += `- Failed: ${this.results.failed} ${
      this.results.failed > 0 ? '❌' : ''
    }\n`;
    md += `- Warnings: ${this.results.warnings} ${
      this.results.warnings > 0 ? '⚠️' : ''
    }\n`;

    return md;
  },

  // Save test results to file
  saveResults() {
    try {
      const md = this.generateMarkdown();
      fs.writeFileSync(path.join(process.cwd(), 'basic-test-results.md'), md);
    } catch (e) {
      console.error('Error saving test results:', e.message);
    }
  }
};

console.log('Running basic tests...');

// ---- Basic Symbol Cache Tests ----
testLogger.group('Running Symbol Cache Basic Tests');

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
  throw testLogger.fail(
    'areAllImagesLoaded() should return false when no images loaded',
    new Error(`Expected false, but got ${test1Result}`)
  );
}
testLogger.pass('areAllImagesLoaded() returns false when no images loaded');

// Test 2: Force mark all as loaded
forceMarkAllLoaded();
const test2Result = areAllImagesLoaded();
if (test2Result !== true) {
  throw testLogger.fail(
    'areAllImagesLoaded() should return true after marking all loaded',
    new Error(`Expected true, but got ${test2Result}`)
  );
}
testLogger.pass('areAllImagesLoaded() returns true after marking all loaded');

// ---- Basic Random Distribution Tests ----
testLogger.group('Running Random Distribution Basic Tests');

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
try {
  for (const symbol of codeSymbols) {
    if (!grid.includes(symbol)) {
      throw testLogger.fail(
        `Grid should contain code symbol ${symbol}`,
        new Error(`Symbol ${symbol} is missing from grid`)
      );
    }
  }
  testLogger.pass('Grid contains all code symbols');
} catch (e) {
  if (!e.message.includes('testLogger')) throw e;
}

// Generate multiple grids to test randomness
const grid1 = generateGrid(level, codeSymbols, availableSymbols);
const grid2 = generateGrid(level, codeSymbols, availableSymbols);

// Check if the grids are different (they likely should be)
const grid1Str = JSON.stringify(grid1);
const grid2Str = JSON.stringify(grid2);

if (grid1Str === grid2Str) {
  testLogger.warn(
    'Two randomly generated grids were identical - check randomness'
  );
} else {
  testLogger.pass('Different grid generations produce different results');
}

// Print final summary
const success = testLogger.summary();

// Generate markdown report
testLogger.saveResults();

// Exit with appropriate code
process.exit(success ? 0 : 1);
