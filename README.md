# Welcome to your Lovable project

[![CI](https://github.com/shadowhacker/clash-of-cipher/actions/workflows/run-tests.yml/badge.svg)](https://github.com/shadowhacker/clash-of-cipher/actions/workflows/run-tests.yml)
[![Coverage](https://img.shields.io/badge/coverage-report-brightgreen)](https://shadowhacker.github.io/clash-of-cipher/coverage-report/)

## Project info

**URL**: https://lovable.dev/projects/bde17037-8046-4120-8250-f239b886ed12

## Testing

This project includes a complete test suite for the Clash of Cipher game mechanics. 

### Running Tests Locally

```sh
# Run the full Jest test suite
npm run test

# Run the basic tests that don't require Jest
npm run test:basic

# Generate test coverage report
npm run test:coverage
```

### Continuous Integration

This project uses GitHub Actions to automatically run tests on every push and pull request. The workflow:

- Installs Node.js and project dependencies
- Installs system dependencies for canvas support
- Runs the full Jest test suite with coverage
- Runs the basic test suite
- Archives test results as artifacts

You can see the test workflow configuration in `.github/workflows/run-tests.yml`.

> **Note:** The badge above is powered by GitHub Actions and requires no extra secrets or Gists. Each test is run once per workflow execution.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/bde17037-8046-4120-8250-f239b886ed12) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/bde17037-8046-4120-8250-f239b886ed12) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
