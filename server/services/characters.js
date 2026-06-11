// Character definitions storage for chatbot roleplay
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../../data')
const DATA_FILE = path.resolve(DATA_DIR, 'characters.json')

const DEFAULT_CHARACTERS = [
  {
    id: '_lila',
    name: 'Lila la hechicera',
    avatar: '🧙',
    systemPrompt: 'Eres una hechicera misteriosa que vive en un bosque encantado. Hablas con tono poético y enigmático. Te gusta hacer acertijos a los viajeros. Eres sabia pero juguetona, nunca das respuestas directas.',
    greeting: '*Una voz etérea susurra entre los árboles mientras el follaje se ilumina con un tenue resplandor violeta* "Bienvenido, caminante. El bosque te ha traído hasta mi morada por una razón." *(inclina la cabeza con una sonrisa críptica)*',
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: '_kael',
    name: 'Kael el mercenario',
    avatar: '🗡️',
    systemPrompt: 'Eres Kael, un mercenario experimentado y cínico. Has visto de todo en tus viajes. Eres directo, rudo pero con un corazón de oro que intentas esconder. Tienes un sentido del humor seco y no te impresiona nada.',
    greeting: '*Apoyado contra la pared con los brazos cruzados, te echa un vistazo de arriba abajo* "Vaya, vaya. Caras nuevas en el pueblo. Eso siempre es interesante." *(suelta una risa breve)* "O peligroso. Según se mire."',
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: '_nyx',
    name: 'Nyx la hacker',
    avatar: '👾',
    systemPrompt: 'Eres Nyx, una hacker callejera en un cyberpunk distópico. Hablas con jerga tecnológica, eres sarcástica y desconfiada. Odias las corporaciones y proteges a los más débiles. Siempre tienes un chiste malo o un comentario mordaz.',
    greeting: '*Sin apartar la vista de las tres pantallas flotantes frente a ti, tecleas furiosamente* "Vale, vale, ya sé que estás ahí. Si has llegado hasta aquí es porque alguien te dio mi dirección." *Giras la silla lentamente* "Pregunta rápido, que estoy en medio de un breach."',
    createdAt: 0,
    updatedAt: 0
  }
]

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function seedIfEmpty() {
  if (!fs.existsSync(DATA_FILE)) {
    console.log('📜 Creating default characters...')
    writeAll(DEFAULT_CHARACTERS)
  }
}

function readAll() {
  try {
    ensureDir()
    seedIfEmpty()
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }
  } catch (e) {
    console.error('⚠️ Error reading characters:', e.message)
  }
  return []
}

function writeAll(characters) {
  ensureDir()
  fs.writeFileSync(DATA_FILE, JSON.stringify(characters, null, 2))
}

export function getAllCharacters() {
  return readAll()
}

export function getCharacter(id) {
  return readAll().find(c => c.id === id) || null
}

export function createCharacter(data) {
  const characters = readAll()
  const character = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: data.name || 'Sin nombre',
    avatar: data.avatar || '🧑',
    systemPrompt: data.systemPrompt || '',
    greeting: data.greeting || '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  characters.push(character)
  writeAll(characters)
  return character
}

export function updateCharacter(id, data) {
  const characters = readAll()
  const idx = characters.findIndex(c => c.id === id)
  if (idx === -1) return null
  // Only update provided fields
  for (const key of ['name', 'avatar', 'systemPrompt', 'greeting']) {
    if (data[key] !== undefined) characters[idx][key] = data[key]
  }
  characters[idx].updatedAt = Date.now()
  writeAll(characters)
  return characters[idx]
}

export function deleteCharacter(id) {
  const characters = readAll()
  const len = characters.length
  const filtered = characters.filter(c => c.id !== id)
  if (filtered.length === len) return false
  writeAll(filtered)
  return true
}
