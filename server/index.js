#!/usr/bin/env node
// ImaginCreator — backend API server
// Usage: OPENROUTER_API_KEY=sk-or-v1-... node server/index.js
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import { callApi } from './services/openrouter.js'
import { saveImage, getAllImages, getStats, updateCost, serveImage } from './services/storage.js'
import { getModel, getAllModels, checkPromptCache } from './services/cache.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env file (zero-dep loader)
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const k = trimmed.slice(0, eqIdx).trim()
    let v = trimmed.slice(eqIdx + 1).trim()
    // Strip quotes
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (!process.env[k]) process.env[k] = v
  }
}

const KEY = process.env.OPENROUTER_API_KEY || process.env.UPSTREAM_KEY
const PORT = parseInt(process.env.PORT || '3030', 10)
const DAILY_LIMIT = parseFloat(process.env.DAILY_LIMIT_USD || '0')
const WEEKLY_LIMIT = parseFloat(process.env.WEEKLY_LIMIT_USD || '0')

if (!KEY) {
  console.error('❌ Need OPENROUTER_API_KEY env var')
  process.exit(1)
}

// ── Helpers ──

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(data))
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
  })
}

// ── Routes ──

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const method = req.method

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    return res.end()
  }

  // GET /api/models — list available models
  if (method === 'GET' && url.pathname === '/api/models') {
    return json(res, 200, { models: getAllModels() })
  }

  // GET /api/images — list all generated images
  if (method === 'GET' && url.pathname === '/api/images') {
    return json(res, 200, { images: getAllImages() })
  }

  // GET /api/stats — credit usage stats
  if (method === 'GET' && url.pathname === '/api/stats') {
    const stats = getStats()
    return json(res, 200, { stats, limits: { daily: DAILY_LIMIT, weekly: WEEKLY_LIMIT } })
  }

  // POST /api/generate — generate image
  if (method === 'POST' && url.pathname === '/api/generate') {
    try {
      const { prompt, modelKey, images } = await parseBody(req)
      const hasImages = Array.isArray(images) && images.length
      if (hasImages) {
        console.log(`📎 ${images.length} image(s) attached, total ~${(JSON.stringify(images).length / 1024).toFixed(0)}KB`)
      }
      if ((!prompt || !prompt.trim()) && !hasImages) return json(res, 400, { error: 'Prompt or image required' })

      const model = getModel(modelKey)

      // Check cache first — skip if images attached
      if (!hasImages) {
        const cached = checkPromptCache(prompt, modelKey)
        if (cached.hit) {
          return json(res, 200, {
            images: [{ file: `${cached.hash}.png`, dataUrl: cached.dataUrl }],
            text: '(cached)',
            model: model.label,
            cost: '0.0000',
            cached: true,
            usage: { prompt: 0, output: 0 }
          })
        }
      }

      // Check daily/weekly limits
      if (DAILY_LIMIT > 0 || WEEKLY_LIMIT > 0) {
        // We'll check against stats
        const stats = getStats()
        if (DAILY_LIMIT > 0 && stats.totalCost >= DAILY_LIMIT && isToday(stats.lastReset || 0)) {
          return json(res, 429, { error: `Daily limit $${DAILY_LIMIT} reached` })
        }
      }

      // Build user message content
      let userContent = prompt || ''
      if (hasImages) {
        // Multimodal format — array for text + images (image gen models with vision support)
        userContent = [{ type: 'text', text: prompt || '' }]
        for (const img of images.slice(0, 4)) {
          userContent.push({ type: 'image_url', image_url: { url: img } })
        }
      }

      const messages = [
        { role: 'user', content: userContent }
      ]

      // Call OpenRouter — newer models need modalities: ["image"]
      const result = await callApi({
        model: model.id,
        messages,
        modalities: ['image'],
        maxTokens: model.maxTokens,
        apiKey: KEY
      })

      if (result.images.length === 0) {
        return json(res, 500, { error: 'No image generated', details: result.text })
      }

      // Save images
      const saved = result.images.map((dataUrl) => {
        if (dataUrl.startsWith('data:')) {
          return { ...saveImage(dataUrl, prompt, model.id), dataUrl }
        }
        return { url: dataUrl, file: null }
      })

      // Calculate cost
      const estCost = model.cost * Math.max(1, saved.length)
      const totalTokens = result.usage.prompt + result.usage.output
      updateCost(estCost, totalTokens, result.usage.prompt, result.usage.output)

      return json(res, 200, {
        images: saved.map((s) => ({ file: s.name || null, dataUrl: s.dataUrl || null, url: s.url || null })),
        text: result.text,
        model: model.label,
        cost: estCost.toFixed(4),
        usage: result.usage,
        cached: false
      })
    } catch (e) {
      console.error('❌ Generate error:', e)
      return json(res, 500, { error: String(e) })
    }
  }

  // GET /img/:filename — serve saved images
  if (method === 'GET' && url.pathname.startsWith('/img/')) {
    const filename = url.pathname.slice('/img/'.length)
    const served = serveImage(res, filename)
    if (!served) {
      return json(res, 404, { error: 'Image not found' })
    }
    return
  }

  // GET /api/check-cache — check if a prompt is cached
  if (method === 'GET' && url.pathname === '/api/check-cache') {
    const prompt = url.searchParams.get('prompt')
    const modelKey = url.searchParams.get('model')
    if (!prompt) return json(res, 400, { error: 'prompt param required' })
    const cached = checkPromptCache(prompt, modelKey)
    return json(res, 200, { cached: cached.hit, hash: cached.hit ? cached.hash : null })
  }

  // POST /api/translate — translate text to English using DeepSeek
  if (method === 'POST' && url.pathname === '/api/translate') {
    try {
      const { text } = await parseBody(req)
      if (!text || !text.trim()) return json(res, 400, { error: 'Text required' })

      const result = await callApi({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a translator. Translate the following text to fluent English suitable for an AI image generation prompt. Return ONLY the translation — no quotes, no explanations, no extra text, no markdown.' },
          { role: 'user', content: text.trim() }
        ],
        apiKey: KEY
      })

      return json(res, 200, { translated: result.text || text.trim() })
    } catch (e) {
      console.error('❌ Translate error:', e)
      return json(res, 500, { error: String(e) })
    }
  }

  // GET / — health check
  if (method === 'GET' && (url.pathname === '/' || url.pathname === '/api/health')) {
    return json(res, 200, {
      status: 'ok',
      uptime: process.uptime(),
      stats: getStats(),
      models: getAllModels().length
    })
  }

  // POST /api/pony/generate — generate image via local SD WebUI Pony model
  if (method === 'POST' && url.pathname === '/api/pony/generate') {
    try {
      const { prompt, negativePrompt, params } = await parseBody(req)
      if (!prompt || !prompt.trim()) return json(res, 400, { error: 'Prompt required' })

      const body = JSON.stringify({
        prompt: prompt.trim(),
        negative_prompt: negativePrompt || 'bad anatomy, ugly, distorted, low quality, worst quality',
        width: params?.width || 1024,
        height: params?.height || 1024,
        steps: params?.steps || 30,
        cfg_scale: params?.cfg || 7,
        sampler_name: params?.sampler || 'DPM++ 2M Karras',
        seed: params?.seed || -1,
        batch_size: 1,
      })

      const sdResult = await new Promise((resolve, reject) => {
        const opts = {
          hostname: '127.0.0.1',
          port: 7860,
          path: '/sdapi/v1/txt2img',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        }
        const req = http.request(opts, (r) => {
          let data = ''
          r.on('data', (c) => (data += c))
          r.on('end', () => {
            try {
              resolve(JSON.parse(data))
            } catch { reject(new Error(`SD WebUI parse error: ${data.slice(0, 500)}`)) }
          })
        })
        req.on('error', (e) => reject(new Error(`SD WebUI connection failed: ${e.message}`)))
        req.write(body)
        req.end()
      })

      if (!sdResult.images?.length) {
        return json(res, 500, { error: 'SD WebUI returned no images' })
      }

      // Save the image
      const dataUrl = `data:image/png;base64,${sdResult.images[0]}`
      const saved = saveImage(dataUrl, `[Pony] ${prompt}`, 'ponydiffusionv6xl')

      return json(res, 200, {
        imageUrl: `/img/${saved.name}`,
        dataUrl,
        prompt,
        model: 'Pony Diffusion V6 XL',
        params: { steps: body.steps, cfg: body.cfg_scale, sampler: body.sampler_name, width: body.width, height: body.height },
        file: saved.name,
      })
    } catch (e) {
      console.error('❌ Pony generate error:', e)
      return json(res, 500, { error: String(e) })
    }
  }

  // POST /api/pony/chat — chat with DeepSeek Flash for Pony tag assistance
  if (method === 'POST' && url.pathname === '/api/pony/chat') {
    try {
      const { messages, configContext, currentTags } = await parseBody(req)
      if (!messages?.length) return json(res, 400, { error: 'Messages required' })

      // Build system prompt — base rules + config context + current tags
      let systemContent = `Eres un experto en Pony Diffusion V6 XL, un modelo de generación de imágenes que usa tags Danbooru.

REGLAS:
- Solo respondes con tags Danbooru separados por comas.
- Sin narrativa, sin explicaciones, sin markdown.
- Usa formato: rating:explicit, 1girl, tag1, tag2, (tag:1.2)
- Tags en inglés SIEMPRE (Danbooru style).
- Usa score_9, score_8_up, score_7_up al inicio para calidad.
- Añade (masterpiece:1.2) al final.
- Si es NSFW, usa rating:explicit.

Ejemplo:
Usuario: "chica rubia en la playa, desnuda, masturbándose"
Respuesta: rating:explicit, score_9, score_8_up, score_7_up, solo, 1girl, nude, blonde_hair, long_hair, blue_eyes, large_breasts, spread_legs, masturbation, beach, outdoors, sunshine, (masterpiece:1.2), (best_quality:1.2)`

      // Add config context if available
      if (configContext) {
        systemContent += `\n\n═══ CONFIGURACIÓN ACTUAL (categorías del configurador) ═══\n${configContext}`
      }

      // Add current tag string if available
      if (currentTags) {
        systemContent += `\n═══ TAGS ACTUALES (string que se enviaría al modelo) ═══\n${currentTags}`
      }

      // Add critical instruction — user prompt overrides everything
      systemContent += `\n\n═══ INSTRUCCIÓN CRÍTICA ═══
El usuario va a escribir lo que QUIERE generar. Su petición tiene PRIORIDAD TOTAL sobre la configuración actual.

TU TRABAJO ES:
1. Lee lo que pide el usuario.
2. Compara con la configuración actual (si se te ha dado).
3. Si la configuración actual NO coincide con lo que pide el usuario, CÁMBIALA — no la mantengas.
4. Si la configuración actual es compatible, mantenla pero ajústala.
5. Si hacen falta tags adicionales que no están en las categorías del configurador, AÑÁDELOS como tags extra.
6. NO tengas miedo de cambiar categorías enteras. Lo que importa es lo que el usuario quiere.

Ejemplo:
- Config actual: rating:explicit, score_9, blonde_hair, blue_eyes, bed
- Usuario dice: "pelirroja con coletas en la ducha"
- Tu respuesta DEBE incluir: red_hair, twin_tails, shower (y quitar blonde_hair, blue_eyes, bed)
- Tags que no cambian (rating, quality, emphasis): se mantienen

REGLAS ADICIONALES:
- Si es relevante, puedes sugerir un negative prompt con una línea que empiece por "NEG:" (sin comillas). Ejemplo: NEG: bad hands, extra fingers
- Los tags que no estén en las categorías del configurador se añadirán automáticamente como raw tags.
- Si el usuario pide "amplía" o "más tags", añade todos los tags Danbooru relevantes que se te ocurran.`

      const result = await callApi({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: systemContent },
          ...messages
        ],
        apiKey: KEY
      })

      return json(res, 200, { text: result.text, usage: result.usage })
    } catch (e) {
      console.error('❌ Pony chat error:', e)
      return json(res, 500, { error: String(e) })
    }
  }

  return json(res, 404, { error: 'Not found' })
}

// ── Server ──

const server = http.createServer(handleRequest)

server.listen(PORT, () => {
  console.log(`🎨 ImaginCreator API — http://localhost:${PORT}`)
  console.log(`   Key: ${KEY.slice(0, 12)}...${KEY.slice(-4)}`)
  console.log(`   Images: ./img_output/`)
  console.log(`   Models: ${getAllModels().map((m) => m.label).join(', ')}`)
})

function isToday(timestamp) {
  if (!timestamp) return false
  return new Date(timestamp).toDateString() === new Date().toDateString()
}
