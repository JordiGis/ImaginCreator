# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ImaginCreator — image generation dashboard using OpenRouter API (Flux / Stable Diffusion models).
- **Backend**: Node.js HTTP server (zero npm deps, pure `http`/`https`/`fs`/`path`)
- **Frontend**: Vue 3 + Vite (chat-style UI with image gallery)

## Commands

```bash
# Start the full app (backend + Vite dev server)
# Terminal 1 — backend
OPENROUTER_API_KEY=sk-or-v1-... node server/index.js

# Terminal 2 — frontend (Vite dev server, proxies /api → backend)
pnpm run dev:frontend

# Or build frontend for production and serve from backend
pnpm run build
OPENROUTER_API_KEY=sk-or-v1-... node server/index.js

# CLI for quick image generation (legacy, still works)
OPENROUTER_API_KEY=sk-or-v1-... ./gen-img.js "a cat in space"
```

Env vars:
- `OPENROUTER_API_KEY` or `UPSTREAM_KEY` — API key (required)
- `PORT` — server port (default: 3030)
- `DAILY_LIMIT_USD` — optional daily spend cap
- `WEEKLY_LIMIT_USD` — optional weekly spend cap

## Architecture

### Directory Structure

```
├── server/
│   ├── index.js          # HTTP server + route handlers
│   └── services/
│       ├── openrouter.js # OpenRouter API client
│       ├── storage.js    # Image save, metadata, prompt cache
│       └── cache.js      # Cache lookup + model config
├── src/
│   ├── main.js           # Vue app entry
│   ├── App.vue           # Main layout (sidebar + chat + input)
│   ├── config/
│   │   └── models.js     # Model definitions + costs
│   ├── composables/
│   │   ├── useApi.js     # API calls to backend
│   │   └── useCreditTracker.js  # Credit tracking + limits
│   └── components/
│       ├── ModelSelector.vue  # Radio-button model picker
│       ├── PromptInput.vue    # Text input + cost preview + cache detection
│       ├── CostDashboard.vue  # Stats sidebar panel
│       └── ImageModal.vue     # Full-size image preview
├── img_output/           # Generated images
│   ├── _metadata.json    # Image records + stats
│   └── _cache/           # Prompt-hash cache (avoids duplicate API calls)
├── index.html            # Vite entry
├── vite.config.js        # Vite config + proxy
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
| POST | `/api/generate` | Generate image `{prompt, modelKey}` |
| GET | `/img/:filename` | Serve saved PNG files |

### Models

| Key | Model | Cost | Quality |
|-----|-------|------|---------|
| `flux-2-klein` | Flux.2 Klein 4B | $0.002/img | Fast & cheap |
| `flux-dev` | Flux Dev | $0.003/img | Medium |
| `flux-pro` | Flux 1.1 Pro | $0.005/img | High |
| `sd-3.5` | SD 3.5 Large | $0.004/img | Good |

### Credit Optimization Strategies

1. **Prompt Cache**: Identical prompt + model → serve from disk cache. No API call, no cost.
2. **Cost Preview**: Shows estimated cost before generating. Cache badge shown if prompt cached.
3. **Live Cache Check**: As user types, debounced 600ms check shows cache status.
4. **Rate/Daily Limits**: Optional `DAILY_LIMIT_USD` / `WEEKLY_LIMIT_USD` env vars.
5. **Duplicate Prevention**: Button disabled while generating.
6. **Persistent Stats**: Cost + token tracking saved to `_metadata.json`.

### Development Notes

- Backend uses ES modules (`import`/`export`) with zero npm dependencies.
- Frontend uses Vue 3 Composition API + Vite.
- In dev mode, run backend + `npm run dev:frontend` — Vite proxies `/api` to backend.
- In production, `npm run build` outputs static files to `dist/`.
- Image generation returns base64 data URLs from OpenRouter's `message.images` array.
- Metadata (prompt, model, hash, cost) persists in `img_output/_metadata.json`.
