// Image + metadata storage
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const IMG_DIR = path.resolve(process.cwd(), 'img_output')
const META_PATH = path.join(IMG_DIR, '_metadata.json')
const CACHE_DIR = path.join(IMG_DIR, '_cache')

// Ensure directories
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true })
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })

// ── Metadata DB ──

function loadMeta() {
  try {
    if (fs.existsSync(META_PATH)) {
      return JSON.parse(fs.readFileSync(META_PATH, 'utf-8'))
    }
  } catch { /* corrupt file, reset */ }
  return { images: [], stats: { totalCost: 0, totalTokens: 0, totalImages: 0 } }
}

function saveMeta(meta) {
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2))
}

// ── Prompt cache ──

export function hashPrompt(prompt, model) {
  return crypto.createHash('md5').update(`${model}::${prompt}`).digest('hex')
}

export function checkCache(prompt, model) {
  const hash = hashPrompt(prompt, model)
  const cached = path.join(CACHE_DIR, `${hash}.png`)
  if (fs.existsSync(cached)) {
    const stat = fs.statSync(cached)
    return { file: cached, hash, age: Date.now() - stat.mtimeMs }
  }
  return null
}

export function writeCache(hash, buffer) {
  const p = path.join(CACHE_DIR, `${hash}.png`)
  fs.writeFileSync(p, buffer)
}

// ── Image save ──

export function saveImage(dataUrl, prompt, model) {
  const meta = loadMeta()
  const base64 = dataUrl.split(',')[1]
  const buffer = Buffer.from(base64, 'base64')
  const hash = hashPrompt(prompt, model)
  const name = `img_${Date.now()}_${crypto.randomBytes(3).toString('hex')}.png`
  const filePath = path.join(IMG_DIR, name)

  // Save the image
  fs.writeFileSync(filePath, buffer)

  // Save to cache
  writeCache(hash, buffer)

  // Update metadata
  const record = {
    file: name,
    prompt,
    model,
    hash,
    createdAt: new Date().toISOString(),
    size: buffer.length
  }
  meta.images.unshift(record)
  meta.stats.totalImages++
  saveMeta(meta)

  return { name, record }
}

// ── Queries ──

export function getAllImages() {
  return loadMeta().images
}

export function getStats() {
  return loadMeta().stats
}

export function updateCost(cost, tokens, promptTokens, outputTokens) {
  const meta = loadMeta()
  meta.stats.totalCost += cost
  meta.stats.totalTokens += tokens
  saveMeta(meta)
}

export function getCachedImage(hash) {
  const p = path.join(CACHE_DIR, `${hash}.png`)
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p)
    return `data:image/png;base64,${data.toString('base64')}`
  }
  return null
}

export function serveImage(res, filename) {
  const safe = path.basename(filename)
  const filePath = path.join(IMG_DIR, safe)
  if (!fs.existsSync(filePath)) {
    // Try cache dir
    const cachePath = path.join(CACHE_DIR, safe)
    if (!fs.existsSync(cachePath)) return false
    const ext = path.extname(safe).toLowerCase()
    const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000' })
    fs.createReadStream(cachePath).pipe(res)
    return true
  }
  const ext = path.extname(safe).toLowerCase()
  const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000' })
  fs.createReadStream(filePath).pipe(res)
  return true
}
