# ImaginCreator 🎨

Dashboard de generación de imágenes usando OpenRouter API (Flux / Stable Diffusion).

![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D) ![Vite](https://img.shields.io/badge/Vite-5-646CFF) ![Node](https://img.shields.io/badge/Node-20+-339933)

## ✨ Features

- **4 modelos**: Flux.2 Klein (rápido/barato), Flux Dev, Flux Pro, SD 3.5 Large
- **Caché de prompts**: mismo prompt + modelo → sin llamada API, sin coste
- **Preview de coste**: estimación antes de generar + badge de caché
- **Límites de gasto**: opcionales por día (`DAILY_LIMIT_USD`) / semana (`WEEKLY_LIMIT_USD`)
- **Galería persistente**: historial de imágenes generadas con metadatos
- **UI tipo chat**: selector de modelo, input de prompt, galería lateral

## Requisitos

- **Node.js 20+**
- **API key de [OpenRouter](https://openrouter.ai/keys)** (modelos gratis/baratos disponibles)

## Inicio rápido

```bash
# 1. Clonar e instalar dependencias (solo frontend)
git clone <repo>
cd ImaginCreator
pnpm install

# 2. Terminal 1 — Backend
OPENROUTER_API_KEY=sk-or-v1-... node server/index.js

# 3. Terminal 2 — Frontend (dev con hot-reload)
pnpm run dev:frontend
```

Abrir `http://localhost:5173` en el navegador.

## Producción

```bash
pnpm run build
OPENROUTER_API_KEY=sk-or-v1-... node server/index.js
```

Sirve frontend estático + API desde el puerto 3030.

## CLI (legacy)

```bash
OPENROUTER_API_KEY=sk-or-v1-... node gen-img.js "un gato en el espacio"
```

## Variables de entorno

| Variable | Obligatoria | Default | Descripción |
|----------|-------------|---------|-------------|
| `OPENROUTER_API_KEY` | ✅ (o `UPSTREAM_KEY`) | — | API key de OpenRouter |
| `UPSTREAM_KEY` | ✅ (o `OPENROUTER_API_KEY`) | — | Alias alternativo |
| `PORT` | ❌ | `3030` | Puerto del servidor |
| `DAILY_LIMIT_USD` | ❌ | — | Límite de gasto diario en USD |
| `WEEKLY_LIMIT_USD` | ❌ | — | Límite de gasto semanal en USD |

## Modelos

| Key | Modelo | Coste/imagen | Calidad |
|-----|--------|-------------|---------|
| `flux-2-klein` | Flux.2 Klein 4B | $0.002 | ⚡ Rápido |
| `flux-dev` | Flux Dev | $0.003 | 🆗 Medio |
| `flux-pro` | Flux 1.1 Pro | $0.005 | 🔥 Alta |
| `sd-3.5` | SD 3.5 Large | $0.004 | 👍 Buena |

## Arquitectura

```
├── server/                # Backend Node.js (0 dependencias npm)
│   ├── index.js           # HTTP server + routers
│   └── services/
│       ├── openrouter.js  # Cliente OpenRouter API
│       ├── storage.js     # Guardado de imágenes, metadatos, stats
│       └── cache.js       # Caché de prompts + config modelos
├── src/                   # Frontend Vue 3 + Vite
│   ├── App.vue            # Layout principal (sidebar + chat + input)
│   ├── config/models.js   # Definiciones de modelos y costes
│   ├── composables/       # useApi.js, useCreditTracker.js
│   └── components/        # ModelSelector, PromptInput, etc.
├── img_output/            # Imágenes generadas
│   ├── _metadata.json     # Registro de imágenes + stats
│   └── _cache/            # Caché de prompts por hash
└── vite.config.js         # Proxy /api → backend en dev
```

**Backend**: Node.js puro (`http`/`https`/`fs`/`path`), ES modules, cero dependencias.

**Frontend**: Vue 3 Composition API + Vite. En dev, Vite proxy `/api` → `localhost:3030`.

## API endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health + stats |
| GET | `/api/models` | Lista modelos disponibles |
| GET | `/api/images` | Lista imágenes generadas |
| GET | `/api/stats` | Uso de créditos + límites |
| GET | `/api/check-cache?prompt=...&model=...` | Verifica caché |
| POST | `/api/generate` | Generar imagen `{prompt, modelKey}` |
| GET | `/img/:filename` | Servir PNG guardados |

## Estrategias de ahorro

1. **Caché de prompts** → mismo prompt + modelo = instantáneo, sin coste
2. **Preview de coste** → ves el coste estimado antes de generar
3. **Live cache check** → mientras escribes (debounce 600ms), detecta si el prompt ya está en caché
4. **Límites opcionales** → `DAILY_LIMIT_USD` / `WEEKLY_LIMIT_USD`
5. **Anti-duplicados** → botón deshabilitado durante generación
6. **Stats persistentes** → coste total, tokens, todo en `_metadata.json`

## Licencia

MIT
