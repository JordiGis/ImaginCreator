# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ImaginCreator — image generation dashboard using OpenRouter API (Recraft / Riverflow / Flux models).
- **Backend**: Node.js HTTP server (zero npm deps, pure `http`/`https`/`fs`/`path`)
- **Frontend**: Vue 3 + Vite (chat-style UI with character creator + image gallery)

## Commands

```bash
# Start both backend + frontend (single command, auto-loads .env)
pnpm run dev

# Or separately:
pnpm run dev:backend   # backend only (also loads .env from server/index.js)
pnpm run dev:frontend  # Vite dev server (proxies /api + /img → backend)

# Build frontend for production and serve from backend
pnpm run build
node server/index.js

# CLI for quick image generation (legacy, still works)
OPENROUTER_API_KEY=sk-or-v1-... ./gen-img.js "a cat in space"
```

Env vars (auto-loaded from `.env` file in project root):
- `OPENROUTER_API_KEY` or `UPSTREAM_KEY` — API key (required)
- `PORT` — server port (default: 3030)
- `DAILY_LIMIT_USD` — optional daily spend cap
- `WEEKLY_LIMIT_USD` — optional weekly spend cap

## Architecture

### Directory Structure

```
├── server/
│   ├── index.js          # HTTP server + route handlers + .env loader
│   └── services/
│       ├── openrouter.js # OpenRouter API client (image gen, multimodal)
│       ├── storage.js    # Image save, metadata, stats, prompt cache
│       └── cache.js      # Cache lookup + model config (server-side)
├── src/
│   ├── main.js           # Vue app entry
│   ├── App.vue           # Main layout — sidebar nav + chat + character creator views
│   ├── config/
│   │   ├── models.js     # Frontend model definitions (Riverflow, Recraft)
│   │   └── characterTraits.js  # Character creator trait definitions + prompt compositor
│   ├── composables/
│   │   ├── useApi.js     # API calls to backend (generate, fetch images/stats, cache check)
│   │   ├── useChatStore.js  # Reactive per-model chat history + model switcher
│   │   └── useCreditTracker.js  # Credit tracking + limits
│   └── components/
│       ├── ModelSelector.vue       # Radio-button model picker
│       ├── PromptInput.vue         # Text input + cost preview + cache detection
│       ├── CostDashboard.vue       # Stats sidebar panel
│       ├── ImageModal.vue          # Full-size image preview modal
│       ├── ImageGallery.vue        # Full-screen gallery (sidebar + grid of all images)
│       └── CharacterConfigurator.vue  # Trait-based character creator (collapsible categories)
├── img_output/           # Generated images
│   ├── _metadata.json    # Image records + stats
│   └── _cache/           # Prompt-hash cache (avoids duplicate API calls)
├── dist/                 # Production build output
├── index.html            # Vite entry
├── vite.config.js        # Vite config + proxy (/api, /img → :3030)
├── package.json
├── CLAUDE.md
└── gen-img.js / img-dash.js  # Legacy single-file versions (kept for reference)
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health + stats |
| GET | `/api/models` | List available models |
| GET | `/api/images` | List all generated images |
| GET | `/api/stats` | Credit usage + limits |
| GET | `/api/check-cache?prompt=...&model=...` | Check if prompt is cached |
| POST | `/api/generate` | Generate image `{prompt, modelKey, images?}` |
| GET | `/img/:filename` | Serve saved PNG files |

`POST /api/generate` supports multimodal: pass `images` array (base64 data URLs) alongside `prompt` for image-to-image workflows. Cached prompts return `{cached: true}` with stored data URL — no API call.

### Models

**Frontend** (`src/config/models.js` — subset shown in ModelSelector):

| Key | Model | Cost | Label |
|-----|-------|------|-------|
| `riverflow-fast` | sourceful/riverflow-v2-fast | $0.02/img | Riverflow V2 Fast |
| `recraft-v41` | recraft/recraft-v4.1-utility | $0.04/img | Recraft V4.1 |
| `recraft-vector` | recraft/recraft-v4-vector | $0.08/img | Recraft V4 Vector |

**Backend** (`server/services/cache.js` — full model registry, all 7 models):

| Key | Model | Cost | maxTokens |
|-----|-------|------|-----------|
| `flux-2-max` | black-forest-labs/flux.2-max | $0.07/img | 45000 |
| `flux-2-pro` | black-forest-labs/flux.2-pro | $0.03/img | 45000 |
| `seedream-4.5` | bytedance-seed/seedream-4.5 | $0.04/img | 45000 |
| `riverflow-fast` | sourceful/riverflow-v2-fast | $0.02/img | 7000 |
| `riverflow-std` | sourceful/riverflow-v2-standard-preview | $0.035/img | 7000 |
| `recraft-v41` | recraft/recraft-v4.1-utility | $0.04/img | 64000 |
| `recraft-vector` | recraft/recraft-v4-vector | $0.08/img | 64000 |

### UI Views

1. **Chat** (default) — prompt input + message history with images inline. Per-model message store via `useChatStore`.
2. **Character Creator** — trait-based character configurator with collapsible categories, randomize, compose prompt from selections, generate via Recraft V4.1, then send result to chat.
3. **Gallery** — full-screen image gallery overlay with sidebar stats + grid of all generated images. Loaded from `/api/images`.

## Key Components

### `CharacterConfigurator.vue`
- Trait categories: race (20), gender (6), age (7), facial hair (10), face shape (7), eye shape (7), eye color (13), nose (8), lips (5), expression (14), hair style (18), hair color (13), skin tone (6), skin feature (9), adult features (14, multi-select), body type (6), height (4), bust size (6), genital type (5), genital size (4), clothing (27), pose (24), camera angle (14), lighting (15), special traits (25, multi-select)
- Collapse/expand per category, multi-select categories with count badge
- Prompt compositor (`config/characterTraits.js:composePrompt`) builds natural language prompt from selections with smart trans identity fusion
- Custom text field, copy prompt, randomize button, result preview with full-image modal
- Fires `send-to-chat` and `open-gallery` events

### `ImageGallery.vue`
- Full-screen overlay (`position: fixed`), sidebar + scrollable grid
- Loading skeleton (12 cards), empty state, image cards with prompt/model/cost/date
- Fetches from `/api/images` on open, lazy loads images

### `useChatStore.js`
- Single `reactive` store with `messageMap: Record<modelKey, Message[]>`
- `currentModel` synced to URL `?model=` param
- Actions: `setModel`, `addMessage`, `newChat`, `hasMessages`
- Messages derived via `computed` from current model's array

### `characterTraits.js`
- `TRAIT_CATEGORIES` — array of category objects with `key`, `label`, `icon`, `options[]`
- `multi: true` categories support multiple selections (adultFeatures, specialTraits)
- `getDefaultSelections()` — picks first option for single-select, empty array for multi
- `composePrompt(selections)` — builds detailed prompt string with style suffix: `"fantasy character concept art, highly detailed, professional character portrait..."`

## Credit Optimization Strategies

1. **Prompt Cache**: Identical prompt + model → serve from disk cache. No API call, no cost.
2. **Cost Preview**: Shows estimated cost before generating. Cache badge shown if prompt cached.
3. **Live Cache Check**: As user types, debounced 600ms check shows cache status.
4. **Rate/Daily Limits**: Optional `DAILY_LIMIT_USD` / `WEEKLY_LIMIT_USD` env vars.
5. **Duplicate Prevention**: Button disabled while generating.
6. **Persistent Stats**: Cost + token tracking saved to `_metadata.json`.

## Development Notes

- Backend uses ES modules (`import`/`export`) with zero npm dependencies.
- `.env` file auto-loaded by `server/index.js` (parsed manually, no dotenv dependency).
- Frontend uses Vue 3 Composition API + Vite.
- In dev mode, `pnpm run dev` runs both via `concurrently`.
- Vite proxies `/api` and `/img` to backend at `localhost:3030`.
- In production, `pnpm run build` outputs static files to `dist/`.
- Image generation returns base64 data URLs from OpenRouter's `message.images` array.
- Metadata (prompt, model, hash, cost) persists in `img_output/_metadata.json`.
- Character creators use `recraft-v41` model directly (not from ModelSelector).
- The frontend model list is a subset of the full server model registry — add entries to both `src/config/models.js` and `server/services/cache.js` when adding models.
