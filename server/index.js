#!/usr/bin/env node
// ImaginCreator — backend API server
// Usage: OPENROUTER_API_KEY=sk-or-v1-... node server/index.js
import http from 'node:http'
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
      if ((!prompt || !prompt.trim()) && !hasImages) return json(res, 400, { error: 'Prompt or image required' })

      const model = getModel(modelKey)

      // Check cache first (credit optimization!) — skip if images attached
      if (!hasImages) {
        const cached = checkPromptCache(prompt, modelKey)
        if (cached.hit) {
          // Return cached result — no API call
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

      // Call OpenRouter — newer models need modalities: ["image"]
      const result = await callApi({
        model: model.id,
        messages: [
          { role: 'user', content: userContent }
        ],
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

  // GET / — health check
  if (method === 'GET' && (url.pathname === '/' || url.pathname === '/api/health')) {
    return json(res, 200, {
      status: 'ok',
      uptime: process.uptime(),
      stats: getStats(),
      models: getAllModels().length
    })
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
