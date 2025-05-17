# Welcome to your Lovable project

[![CI](https://github.com/shadowhacker/clash-of-cipher/actions/workflows/run-tests.yml/badge.svg)](https://github.com/shadowhacker/clash-of-cipher/actions/workflows/run-tests.yml)
[![Coverage](https://img.shields.io/badge/coverage-report-brightgreen)](https://shadowhacker.github.io/clash-of-cipher/coverage-report/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-blue)](https://shadowhacker.github.io/clash-of-cipher/)

## Project info

**URL**: https://lovable.dev/projects/bde17037-8046-4120-8250-f239b886ed12

## Clash of Cipher Game

Clash of Cipher (also known as Dhyanam) is a memory-based game where players:

1. See a code sequence of symbols
2. Find those symbols in a grid
3. Progress through increasingly difficult levels

The game focuses on improving memory, attention, and cognitive skills in a fun, engaging way.

## Testing

This project includes a comprehensive test suite for the Clash of Cipher game mechanics.

### Running Tests Locally

```sh
# Run the full Jest test suite
npm run test

# Run the basic tests that don't require Jest
npm run test:basic

# Generate test coverage report
npm run test:coverage

# Generate test summary document
npm run test:summary
```

### Continuous Integration

This project uses GitHub Actions to automatically run tests on every push and pull request. The workflow:

- Installs Node.js and project dependencies
- Installs system dependencies for canvas support
- Runs the full Jest test suite with coverage
- Runs the basic test suite
- Publishes coverage reports to GitHub Pages
- Updates the test summary document

You can see the test workflow configuration in `.github/workflows/run-tests.yml`.

View the [latest test coverage report](https://shadowhacker.github.io/clash-of-cipher/coverage-report/).

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

## Supabase Configuration

This game now supports dynamic configuration via Supabase. To enable this feature:

1. Create a `.env` file in the project root (copy from `.env.example` if available)
2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
3. Create a `game_config` table in your Supabase project with the following schema:
   - `id` (uuid, primary key)
   - `config_name` (text, e.g., "default")
   - `config_json` (jsonb)
   - `created_at` (timestamp with timezone)
   - `updated_at` (timestamp with timezone)

4. Insert the default config:
   ```sql
   INSERT INTO public.game_config (config_name, config_json) 
   VALUES ('default', '{"MAX_ROUND_TIME": 10, "STARTING_LIVES": 2, "ROUND_LOGIC": [...]}');
   ```

The JSON structure should match the format in `src/config/gameConfig.json`.

If Supabase credentials are not provided, the game will fall back to using the local configuration file.

## Sound Management

This game now supports dynamic sound management via Supabase. Sound files are stored in Supabase Storage and their URLs are managed through a database table.

### Sound Configuration

1. Sound files are stored in the `sounds` bucket in Supabase Storage
2. The URLs for these sounds are managed in the `sounds` table with the following schema:
   - `id` (uuid, primary key)
   - `created_at` (timestamp with timezone)
   - `updated_at` (timestamp with timezone)
   - `sounds_json` (jsonb) - A JSON object mapping sound names to URLs

### Default Sound Mapping

The default sound mapping is:

```json
{
  "success": "https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/sounds/success_bell.mp3",
  "fail": "https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/sounds/failure_bell.mp3",
  "victory": "https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/sounds/victory.mp3"
}
```

### Uploading New Sounds

To upload new sounds to Supabase:

1. Place the sound files in the `public/snd` directory
2. Update the `scripts/upload-sounds.js` script with your Supabase service key
3. Run the script: `node scripts/upload-sounds.js`

The script will:
- Create a `sounds` bucket if it doesn't exist
- Upload the sound files to the bucket
- Update the `sounds` table with the new URLs
