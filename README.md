## Project name and description

MakeUrban — AI-Powered Urban Planning Assistant

MakeUrban helps planners and citizens assess heat risk and air quality, then generates concise, actionable city improvement plans with AI. It combines live geocoding, an interactive map, environmental overlays, and a Gemini-powered assistant.

## Tech stack
- Next.js 15 (App Router), React 19
- Tailwind CSS 4; lightweight UI primitives (button, input, textarea)
- React Leaflet with OpenStreetMap tiles
- Google Gemini via `@google/genai`
- TypeScript, ESLint

## What’s implemented
- City search via Open‑Meteo Geocoding; map fly-to + marker
- Aerosol risk overlay (green/yellow/red) around selected coordinates
- Chat assistant (Gemini) producing concise, numeric, actionable guidance
- Parallel heat/aerosol fetch inside a single API route (`/api/chat`)
- Tailwind 4 styling and responsive layout

## Architecture overview
- `app/page.tsx`: Main UI with map, city search, aerosol fetch, and chat modal
- `components/MapComponent.tsx`: Map container, tile layer, fly-to marker
- `components/MapLayersComponent.tsx`: Colored rectangles for aerosol predictions + radius circle
- `app/api/chat/route.ts`: Fetches heat index and aerosol data, builds prompt, streams Gemini, returns JSON-backed reply
- `lib/coordsUtils.ts`: Geographic helpers (km-to-deg conversions, bounding boxes)
- `components/ui/*`: Minimal reusable UI components

## Limitation
- Results may be approximate due to limited training/data coverage
- Gemini responses may be imperfect/incorrect; use judgment for decisions
- External APIs on free tiers may be slow or rate-limited
- No persistence (chat history, bookmarks)
- Limited error handling for upstream failures

## Setting up project
1) Install dependencies
```bash
npm install
```

2) Create `.env.local`
```bash
# Public (browser)
NEXT_PUBLIC_HOST_URL=
NEXT_PUBLIC_GEOCODING_API_URL=
NEXT_PUBLIC_HOST_AEROSOL_API_URL=

# Server-side (consumed by API route)
NEXT_PUBLIC_HOST_HEAT_API_URL=

# Gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL_NAME=models/gemini-1.5-flash
```

3) Run the app
```bash
npm run dev
# open http://localhost:3000
```

## License
MIT

## Credits
- Map tiles © OpenStreetMap contributors
- Geocoding by Open‑Meteo (default)
- UI patterns inspired by shadcn/ui

## Future approaches
Turning limitations into a roadmap:
- Improve accuracy: integrate CAMS/Copernicus/Sentinel and local authority datasets; enrich training signals
- Strengthen AI reliability: add system prompts, validations, and guardrails; show confidence summaries
- Speed and stability: cache responses, add background prefetching, queues/retries, and rate‑limit handling
- Add persistence: save chat sessions, user preferences, and bookmarked locations
- Robustness: centralized error handling, user‑friendly fallbacks, health checks
- Testability: unit/e2e tests, CI, preview deploys; synthetic data tests for edge cases
- Rich mapping: legends, tooltips, clickable tiles, time‑series controls, draw AOIs, export reports
- Productization: shareable links with encoded state, roles/quotas for public demos
