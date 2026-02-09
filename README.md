# LibertyLoft Website

A React + Vite website for LibertyLoft, because apparently community spaces also need deployment pipelines.

## Step 1: Make GPT Do All The Work
Because typing commands yourself is clearly an unacceptable burden.

### Install OpenAI Codex CLI
Pick one:

```sh
npm i -g @openai/codex
```

```sh
brew install --cask codex
```

Check it actually installed:

```sh
codex -V
```

### Login (so GPT can start carrying the team)
Interactive login:

```sh
codex login
```

Or API key login:

```sh
export OPENAI_API_KEY="your_api_key_here"
printenv OPENAI_API_KEY | codex login --with-api-key
```

### Use it
Open interactive Codex:

```sh
codex
```

Run a one-shot task:

```sh
codex exec "Fix this project and pretend I helped"
```

## Project Description
What this repo does, while everyone debates tabs vs spaces:

- `web` frontend: Vite + React + TypeScript + Tailwind
- `calendar-backend`: lightweight Node server that prefetches Google Calendar ICS into memory every 10 seconds
- frontend reads events from `/api/calendar` (not directly from external proxy endpoints)
- Docker support for running both services together
- ngrok-compatible setup for exposing local dev publicly

## Local Run
Install deps:

```sh
npm install
```

Run backend cache server (`3001`):

```sh
npm run backend
```

Run frontend (`8080`):

```sh
npm run dev
```

Or run both at once:

```sh
npm run dev:full
```

Open:

- `http://localhost:8080/`

## Docker Run
Build and run both services:

```sh
docker compose up --build
```

Open:

- `http://localhost:8080/`

Services:

- `web` on port `8080`
- `calendar-backend` on port `3001`

## Backend Environment Variables
- `CALENDAR_BACKEND_PORT` default: `3001`
- `CALENDAR_PREFETCH_INTERVAL_MS` default: `10000`
- `CALENDAR_MAX_EVENTS` default: `6`
- `CALENDAR_ICS_URL` default: public LibertyLoft ICS URL
- `CALENDAR_BACKEND_URL` default: `http://localhost:3001`
- `NGROK_DOMAIN` default: `clement-absolutory-emmett.ngrok-free.dev`

## API Endpoints
- `GET /api/calendar`
- `GET /api/calendar/health`

## Static ngrok Domain (Optional)
If you want the internet to inspect your localhost choices:

```sh
./ngrok.exe http 8080 --url https://clement-absolutory-emmett.ngrok-free.dev
```

If you see an ngrok warning page, yes, that is normal on free tier domains. Continue to site.
