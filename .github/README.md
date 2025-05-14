# GitHub Workflows for Clash of Cipher

This directory contains GitHub Actions workflows that automate testing and other CI/CD processes for the Clash of Cipher game.

## Available Workflows

### `run-tests.yml`

This workflow automatically runs the test suite whenever code is pushed to the main branch or a pull request is created.

#### Functionality

- Runs on Ubuntu with Node.js 18
- Installs project dependencies and system dependencies for canvas support
- Executes Jest tests with coverage reporting
- Runs basic tests that don't require Jest
- Generates and updates test status badges
- Archives test results as workflow artifacts

#### Badge Setup

To enable the test status badge:

1. Create a GitHub Gist to store the badge data
2. Go to your repository settings → Secrets and variables → Actions
3. Add the following repository secrets:
   - `GIST_ID`: The ID of your Gist (the part of the URL after your username)
   - `GIST_SECRET`: A GitHub Personal Access Token with the `gist` scope

#### Manual Trigger

You can also manually trigger this workflow from the "Actions" tab in your repository.

## Adding New Workflows

To add new GitHub Actions workflows:

1. Create a new YAML file in the `.github/workflows/` directory
2. Define the workflow according to GitHub Actions syntax
3. Commit and push the file to the repository

## Best Practices

- Keep workflows focused on a single responsibility
- Use repository secrets for sensitive information
- Take advantage of workflow artifacts for sharing data between jobs
- Consider adding timeout limits for long-running jobs
- Make use of caching to speed up dependency installation 