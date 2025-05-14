/**
 * Test Summary Generator
 *
 * This script analyzes Jest coverage data and generates a formatted summary
 * that is both human-readable and suitable for inclusion in GitHub Actions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const coveragePath = path.join(process.cwd(), 'coverage');
const lcovPath = path.join(coveragePath, 'lcov.info');
const outputPath = path.join(process.cwd(), 'TEST_SUMMARY.md');
const basicResultsPath = path.join(process.cwd(), 'basic-test-results.md');

// Check if coverage data exists
function coverageExists() {
  return fs.existsSync(lcovPath);
}

// Parse lcov.info to extract coverage metrics
function parseCoverage() {
  if (!coverageExists()) {
    return {
      statements: { total: 0, covered: 0, pct: 0 },
      branches: { total: 0, covered: 0, pct: 0 },
      functions: { total: 0, covered: 0, pct: 0 },
      lines: { total: 0, covered: 0, pct: 0 }
    };
  }

  const lcovContent = fs.readFileSync(lcovPath, 'utf8');

  // Extract metrics
  const statements = {
    total: sumLcovValues(lcovContent, 'LF'),
    covered: sumLcovValues(lcovContent, 'LH')
  };
  statements.pct = statements.total
    ? Math.round((statements.covered / statements.total) * 100)
    : 0;

  const branches = {
    total: sumLcovValues(lcovContent, 'BRF'),
    covered: sumLcovValues(lcovContent, 'BRH')
  };
  branches.pct = branches.total
    ? Math.round((branches.covered / branches.total) * 100)
    : 0;

  const functions = {
    total: sumLcovValues(lcovContent, 'FNF'),
    covered: sumLcovValues(lcovContent, 'FNH')
  };
  functions.pct = functions.total
    ? Math.round((functions.covered / functions.total) * 100)
    : 0;

  // Lines are same as statements for lcov format
  const lines = { ...statements };

  return { statements, branches, functions, lines };
}

// Sum values from lcov file based on prefix (LF, LH, BRF, BRH, FNF, FNH)
function sumLcovValues(content, prefix) {
  const regex = new RegExp(`${prefix}:(\\d+)`, 'g');
  let sum = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    sum += parseInt(match[1], 10);
  }

  return sum;
}

// Get emoji based on coverage percentage
function getEmoji(pct) {
  if (pct >= 80) return '🟢';
  if (pct >= 50) return '🟡';
  return '🔴';
}

// Check if basic test results exist
function basicResultsExist() {
  return fs.existsSync(basicResultsPath);
}

// Read basic test results
function getBasicTestResults() {
  if (!basicResultsExist()) {
    return 'No basic test results available';
  }

  return fs.readFileSync(basicResultsPath, 'utf8');
}

// Generate test summary
function generateSummary() {
  const coverage = parseCoverage();
  const date = new Date().toISOString().split('T')[0];

  let summary = `# Clash of Cipher - Test Summary\n\n`;
  summary += `*Last updated: ${date}*\n\n`;
  summary += `This document summarizes the testing approach, methodology, and coverage for the Clash of Cipher game.\n\n`;

  // Add coverage section if coverage exists
  if (coverageExists()) {
    summary += `## Coverage Report\n\n`;
    summary += `| Category | Coverage | Status |\n`;
    summary += `|----------|----------|--------|\n`;
    summary += `| Statements | ${coverage.statements.covered}/${
      coverage.statements.total
    } (${coverage.statements.pct}%) | ${getEmoji(coverage.statements.pct)} |\n`;
    summary += `| Branches | ${coverage.branches.covered}/${
      coverage.branches.total
    } (${coverage.branches.pct}%) | ${getEmoji(coverage.branches.pct)} |\n`;
    summary += `| Functions | ${coverage.functions.covered}/${
      coverage.functions.total
    } (${coverage.functions.pct}%) | ${getEmoji(coverage.functions.pct)} |\n`;
    summary += `| Lines | ${coverage.lines.covered}/${coverage.lines.total} (${
      coverage.lines.pct
    }%) | ${getEmoji(coverage.lines.pct)} |\n\n`;
  }

  // Add standard test info
  summary += `## Testing Approach\n\n`;
  summary += `The testing strategy for Clash of Cipher includes both unit tests and integration tests to ensure game mechanics work correctly.\n\n`;
  summary += `Two testing approaches have been implemented:\n`;
  summary += `1. **Jest-based tests**: Comprehensive tests using the Jest framework\n`;
  summary += `2. **Basic tests**: Simple test files that can run without Jest dependencies\n\n`;

  // Add running tests section
  summary += `## Running Tests\n\n`;
  summary += `- Run full test suite: \`npm run test\`\n`;
  summary += `- Run basic tests: \`npm run test:basic\`\n\n`;

  // Include basic test results if available
  if (basicResultsExist()) {
    summary += `## Basic Test Results\n\n`;

    // Extract just the summary part from basic-test-results.md
    const basicResults = getBasicTestResults();
    const summarySection = basicResults.match(
      /## Summary\n\n([\s\S]*?)(?=\n##|$)/
    );

    if (summarySection && summarySection[1]) {
      summary += summarySection[1] + '\n\n';
    } else {
      summary += basicResults + '\n\n';
    }
  }

  // Test details
  summary += `## Test Coverage\n\n`;
  summary += `### Unit Tests\n\n`;
  summary += `#### Random Utilities\n`;
  summary += `- Security and integrity of random number generation\n`;
  summary += `- Array shuffling functionality\n`;
  summary += `- Deterministic behavior for testing\n\n`;

  summary += `#### Symbol Management\n`;
  summary += `- Symbol selection based on game level\n`;
  summary += `- Code generation with appropriate symbols\n`;
  summary += `- Grid creation with correct distribution\n\n`;

  summary += `#### Symbol Distribution\n`;
  summary += `- Appropriate difficulty scaling across levels\n`;
  summary += `- Balanced distribution in grids\n`;
  summary += `- Randomness of symbol placement\n\n`;

  summary += `#### Symbol Caching\n`;
  summary += `- Storage and retrieval of symbols\n`;
  summary += `- Cache versioning and management\n`;
  summary += `- Preloading mechanism\n\n`;

  summary += `### Integration Tests\n\n`;
  summary += `#### Game Progression\n`;
  summary += `- Level advancement mechanics\n`;
  summary += `- Difficulty scaling across levels\n`;
  summary += `- Symbol distribution changes with level\n\n`;

  summary += `#### Game Flow\n`;
  summary += `- Complete game cycle validation\n`;
  summary += `- Symbol preloading before game start\n`;
  summary += `- Grid verification\n\n`;

  // Implementation notes
  summary += `## Implementation Notes\n\n`;
  summary += `The test suite is continuously improving with CI/CD integration. Key features:\n\n`;
  summary += `1. Automated test runs in GitHub Actions\n`;
  summary += `2. Coverage reports published to GitHub Pages\n`;
  summary += `3. Basic tests that work without Jest dependencies\n`;
  summary += `4. Custom mocking for browser APIs\n\n`;

  summary += `## Known Issues\n\n`;
  summary += `- One test for handling image loading errors is currently skipped and requires fixing\n`;
  summary += `- Some randomness tests may occasionally show warnings about duplicate grids\n\n`;

  // Write summary to file
  fs.writeFileSync(outputPath, summary);
  console.log(`Test summary generated: ${outputPath}`);
}

// Main execution
try {
  generateSummary();
} catch (error) {
  console.error('Error generating test summary:', error);
  process.exit(1);
}
