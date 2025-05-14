/**
 * Test Summary Updater
 *
 * This script is used in CI/CD to update the test summary with the latest
 * coverage data and commit it back to the repository.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run the generate-test-summary.js script
try {
  console.log('Generating updated test summary...');

  // Run the generate-test-summary.cjs script
  execSync('node scripts/generate-test-summary.cjs', { stdio: 'inherit' });

  // In CI environments, commit and push the updated summary
  if (process.env.CI) {
    // Configure git
    execSync('git config --global user.name "GitHub Actions"');
    execSync('git config --global user.email "actions@github.com"');

    // Check if TEST_SUMMARY.md has changes
    try {
      const status = execSync('git status --porcelain TEST_SUMMARY.md')
        .toString()
        .trim();

      if (status) {
        console.log('Changes detected in TEST_SUMMARY.md, committing...');
        execSync('git add TEST_SUMMARY.md');
        execSync('git commit -m "Update test summary [skip ci]"');

        // Push changes if on main branch
        if (process.env.GITHUB_REF === 'refs/heads/main') {
          console.log('Pushing changes to main branch...');
          execSync('git push');
        } else {
          console.log('Not on main branch, skipping push');
        }
      } else {
        console.log('No changes detected in TEST_SUMMARY.md');
      }
    } catch (error) {
      console.warn('Error checking git status:', error.message);
    }
  } else {
    console.log(
      'Test summary updated locally. Changes not committed (not in CI environment)'
    );
  }
} catch (error) {
  console.error('Error updating test summary:', error);
  process.exit(1);
}
