# ImaginCreator 🎨

Dashboard de generación de imágenes usando OpenRouter API (Recraft / Riverflow / Flux).

![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D) ![Vite](https://img.shields.io/badge/Vite-5-646CFF) ![Node](https://img.shields.io/badge/Node-20+-339933)

## ✨ Features

- **3 modelos frontend** — Riverflow V2 Fast ($0.02), Recraft V4.1 ($0.04), Recraft V4 Vector ($0.08). 7 modelos disponibles en backend.
- **Creador de personajes** — 27 categorías de rasgos visuales (raza, edad, expresión, peinado, vestimenta, iluminación, etc.) con composición inteligente de prompts.
- **Chat con historial por modelo** — cada modelo tiene su propio historial de mensajes. Cambia de modelo sin perder contexto.
- **Galería completa** — overlay a pantalla completa con grid de imágenes, metadatos, y lazy loading.
- **Caché de prompts** — mismo prompt + modelo → sin llamada API, sin coste.
- **Preview de coste** — estimación antes de generar + badge de caché.
- **Límites de gasto** — opcionales por día (`DAILY_LIMIT_USD`) / semana (`WEEKLY_LIMIT_USD`).
- **Multimodal** — soporte para adjuntar imágenes como referencia en el prompt.
- **UI con 3 vistas** — Chat, Creador de personajes, y Galería. Navegación lateral con iconos.

## Requisitos

- **Node.js 20+**
- **API key de [OpenRouter](https://openrouter.ai/keys)** — modelos desde $0.02/img

## Inicio rápido

```bash
# 1. Clonar e instalar dependencias
git clone <repo>
cd ImaginCreator
pnpm install

# 2. Crear archivo .env (opcional, se auto-carga)
echo "OPENROUTER_API_KEY=sk-or-v1-..." > .env

# 3. Iniciar backend + frontend (comando único)
pnpm run dev
```

Abrir `http://localhost:5173` en el navegador.

## Producción

```bash
pnpm run build
node server/index.js
```

Sirve frontend estático + API desde el puerto 3030.

## CLI (legacy)

```bash
OPENROUTER_API_KEY=sk-or-v1-... node gen-img.js "un gato en el espacio"
```

## Variables de entorno

Se auto-cargan desde `.env` en la raíz del proyecto si existe.

| Variable | Obligatoria | Default | Descripción |
|----------|-------------|---------|-------------|
| `OPENROUTER_API_KEY` | ✅ (o `UPSTREAM_KEY`) | — | API key de OpenRouter |
| `UPSTREAM_KEY` | ✅ (o `OPENROUTER_API_KEY`) | — | Alias alternativo |
| `PORT` | ❌ | `3030` | Puerto del servidor |
| `DAILY_LIMIT_USD` | ❌ | — | Límite de gasto diario en USD |
| `WEEKLY_LIMIT_USD` | ❌ | — | Límite de gasto semanal en USD |

## Modelos

### Frontend (selector visible)

| Key | Modelo | Coste/imagen | Descripción |
|-----|--------|-------------|-------------|
| `riverflow-fast` | Riverflow V2 Fast | $0.02 | ⚡ Rápido y económico |
| `recraft-v41` | Recraft V4.1 | $0.04 | 🎯 Propósito general (usado por creador de personajes) |
| `recraft-vector` | Recraft V4 Vector | $0.08 | 🔷 Output vectorial/SVG |

### Backend (completo, 7 modelos)

| Key | Modelo | Coste |
|-----|--------|-------|
| `flux-2-max` | Flux 2 Max | $0.07 |
| `flux-2-pro` | Flux 2 Pro | $0.03 |
| `seedream-4.5` | Seedream 4.5 | $0.04 |
| `riverflow-fast` | Riverflow V2 Fast | $0.02 |
| `riverflow-std` | Riverflow V2 Standard | $0.035 |
| `recraft-v41` | Recraft V4.1 | $0.04 |
| `recraft-vector` | Recraft V4 Vector | $0.08 |

## Vistas de la UI

### 💬 Chat
Input de prompt + historial de mensajes con imágenes inline. Cada modelo tiene su propio historial gracias a `useChatStore`. Soporta envío de imágenes como referencia (multimodal).

### 👤 Creador de Personajes
Configurador visual de personajes con 27 categorías de rasgos: raza, género, edad, expresión, pelo, ojos, piel, vestimenta, armadura, pose, iluminación, ángulo de cámara, rasgos especiales (alas, cuernos, tatuajes, etc.), y más.

- Categorías colapsables con animación
- Soporte multi-selección en rasgos especiales
- Botón **Aleatorio** para combinaciones al azar
- Campo de texto adicional para personalizar el prompt
- Genera directamente con Recraft V4.1
- El resultado se puede enviar al chat o abrir en la galería

### 🖼️ Galería
Overlay a pantalla completa con:
- Sidebar con contador de imágenes y modelos usados
- Grid responsive con lazy loading
- Cada tarjeta muestra: prompt, modelo, coste, fecha
- Zoom al hacer clic
- Estados: carga (skeleton), vacío, grid

## Arquitectura

```
├── server/                # Backend Node.js (0 dependencias npm)
│   ├── index.js           # HTTP server + routers + loader .env
│   └── services/
│       ├── openrouter.js  # Cliente OpenRouter API (soporte multimodal)
│       ├── storage.js     # Guardado de imágenes, metadatos, stats
│       └── cache.js       # Caché de prompts + registro completo de modelos
├── src/                   # Frontend Vue 3 + Vite
│   ├── App.vue            # Layout principal con 3 vistas (sidebar)
│   ├── config/
│   │   ├── models.js      # Modelos visibles en frontend
│   │   └── characterTraits.js  # 27 categorías de rasgos + compositor de prompts
│   ├── composables/
│   │   ├── useApi.js      # API calls al backend
│   │   ├── useChatStore.js    # Estado reactivo del chat por modelo
│   │   └── useCreditTracker.js  # Tracking de créditos + límites
│   └── components/
│       ├── ModelSelector.vue       # Selector de modelo (radio buttons)
│       ├── PromptInput.vue         # Input + preview coste + detección caché
│       ├── CostDashboard.vue       # Panel de estadísticas en sidebar
│       ├── ImageModal.vue          # Modal de imagen a tamaño completo
│       ├── ImageGallery.vue        # Galería completa a pantalla completa
│       └── CharacterConfigurator.vue  # Creador visual de personajes
├── img_output/            # Imágenes generadas
│   ├── _metadata.json     # Registro de imágenes + stats persistentes
│   └── _cache/            # Caché de prompts por hash
└── vite.config.js         # Proxy /api + /img → backend en dev
```

**Backend**: Node.js puro (`http`/`https`/`fs`/`path`), ES modules, cero dependencias npm. Carga `.env` automáticamente.

**Frontend**: Vue 3 Composition API + Vite. En dev, Vite proxy `/api` y `/img` → `localhost:3030`.

## API endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health + stats |
| GET | `/api/models` | Lista modelos disponibles |
| GET | `/api/images` | Lista imágenes generadas |
| GET | `/api/stats` | Uso de créditos + límites |
| GET | `/api/check-cache?prompt=...&model=...` | Verifica caché de prompt |
| POST | `/api/generate` | Generar imagen `{prompt, modelKey, images[]?}` |
| GET | `/img/:filename` | Servir PNG guardados |

`POST /api/generate` acepta un array `images` de base64 data URLs para flujos multimodales (imagen + texto como prompt).

## Estrategias de ahorro

1. **Caché de prompts** → mismo prompt + modelo = instantáneo, sin coste
2. **Preview de coste** → ves el coste estimado antes de generar
3. **Live cache check** → mientras escribes (debounce 600ms), detecta si el prompt ya está en caché
4. **Límites opcionales** → `DAILY_LIMIT_USD` / `WEEKLY_LIMIT_USD`
5. **Anti-duplicados** → botón deshabilitado durante generación
6. **Stats persistentes** → coste total, tokens, todo en `_metadata.json`

## Licencia

MIT
