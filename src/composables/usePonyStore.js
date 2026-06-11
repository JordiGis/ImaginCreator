// Shared reactive state for Pony Diffusion configurator + chat
// Singleton — all importers share the same state
// Persists to localStorage under 'imagin-creator-pony-config'

import { reactive, watch } from 'vue'
import { PONY_CATEGORIES, getDefaultSelections, parseTagStringToActions, composeTags, matchTextToOptions } from '../config/ponyDiffusion.js'

const STORAGE_KEY = 'imagin-creator-pony-config'
const PROJECTS_KEY = 'imagin-creator-pony-projects'

// ── Build initial state ──
const defaults = getDefaultSelections()

const ponyState = reactive({
  selections: { ...defaults },
  extraTags: '',
  negativePrompt: '',
  collapsed: Object.fromEntries(PONY_CATEGORIES.map(c => [c.key, true])),
})

// ── Project management ──
// Each project: { id, name, messages, selections, extraTags, negativePrompt, createdAt }
// selections stored as { catKey: optionId | optionId[] } — portable across sessions

const projects = reactive([])

function loadProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    projects.splice(0, projects.length, ...parsed)
  } catch (e) {
    console.warn('Failed to load pony projects:', e)
  }
}

function saveProjects() {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify([...projects]))
  } catch {}
}

/** Snapshot current tag selections as { catKey: id | id[] } */
function snapshotSelections() {
  const s = {}
  for (const cat of PONY_CATEGORIES) {
    if (cat.multi) {
      s[cat.key] = ponyState.selections[cat.key].map(o => o.id)
    } else {
      s[cat.key] = ponyState.selections[cat.key]?.id || null
    }
  }
  return s
}

/** Restore tag selections from a snapshot */
function restoreSelections(snapshot) {
  if (!snapshot) return
  // Reset everything first
  for (const cat of PONY_CATEGORIES) {
    if (cat.multi) {
      ponyState.selections[cat.key].splice(0, ponyState.selections[cat.key].length)
    } else {
      ponyState.selections[cat.key] = null
    }
  }
  // Restore from snapshot
  for (const cat of PONY_CATEGORIES) {
    const val = snapshot[cat.key]
    if (val == null) continue
    if (cat.multi && Array.isArray(val)) {
      for (const id of val) {
        const opt = cat.options.find(o => o.id === id)
        if (opt) ponyState.selections[cat.key].push(opt)
      }
    } else if (typeof val === 'string') {
      const opt = cat.options.find(o => o.id === val)
      if (opt) ponyState.selections[cat.key] = opt
    }
  }
}

/** Create new empty project, returns its id */
function createProject(name) {
  const id = Date.now().toString()
  const project = {
    id,
    name: name || `Proyecto ${projects.length + 1}`,
    messages: [],
    selections: null,
    extraTags: '',
    negativePrompt: '',
    createdAt: new Date().toISOString(),
  }
  projects.push(project)
  saveProjects()
  return id
}

/** Save current tag state + messages into a project */
function saveProjectState(projectId, messages) {
  const p = projects.find(p => p.id === projectId)
  if (!p) return
  p.messages = messages.map(m => ({
    role: m.role,
    content: m.content,
    imageUrl: m.imageUrl,
    meta: m.meta,
    images: m.images,
  }))
  p.selections = snapshotSelections()
  p.extraTags = ponyState.extraTags
  p.negativePrompt = ponyState.negativePrompt
  saveProjects()
}

/** Load a project: restore tag state, return messages. Returns null if not found */
function loadProjectState(projectId) {
  const p = projects.find(p => p.id === projectId)
  if (!p) return null
  restoreSelections(p.selections)
  if (p.extraTags) ponyState.extraTags = p.extraTags
  if (p.negativePrompt) ponyState.negativePrompt = p.negativePrompt
  return p.messages || []
}

/** Delete a project by id */
function deleteProject(projectId) {
  const idx = projects.findIndex(p => p.id === projectId)
  if (idx >= 0) projects.splice(idx, 1)
  saveProjects()
}

/** Rename a project */
function renameProject(projectId, name) {
  const p = projects.find(p => p.id === projectId)
  if (p) { p.name = name; saveProjects() }
}

// Load saved projects on init
loadProjects()

// ── Persistence ──
function loadSavedConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)

    if (saved.selections) {
      for (const cat of PONY_CATEGORIES) {
        const savedVal = saved.selections[cat.key]
        if (savedVal == null) continue
        if (cat.multi && Array.isArray(savedVal)) {
          const validOpts = savedVal
            .map(id => cat.options.find(o => o.id === id))
            .filter(Boolean)
          ponyState.selections[cat.key].splice(0, ponyState.selections[cat.key].length, ...validOpts)
        } else {
          const opt = cat.options.find(o => o.id === savedVal)
          if (opt) ponyState.selections[cat.key] = opt
        }
      }
    }
    if (saved.extraTags != null) ponyState.extraTags = saved.extraTags
    if (saved.negativePrompt != null) ponyState.negativePrompt = saved.negativePrompt
    if (saved.collapsed) {
      for (const key of Object.keys(ponyState.collapsed)) {
        if (saved.collapsed[key] === false) ponyState.collapsed[key] = false
      }
    }
  } catch (e) {
    console.warn('Failed to load pony config:', e)
  }
}

function saveConfig() {
  try {
    const s = {}
    for (const cat of PONY_CATEGORIES) {
      if (cat.multi) {
        s[cat.key] = ponyState.selections[cat.key].map(o => o.id)
      } else {
        s[cat.key] = ponyState.selections[cat.key]?.id || null
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      selections: s,
      extraTags: ponyState.extraTags,
      negativePrompt: ponyState.negativePrompt,
      collapsed: { ...ponyState.collapsed },
    }))
  } catch {}
}

// Watch and persist on changes
watch(
  [() => ponyState.selections, () => ponyState.extraTags, () => ponyState.negativePrompt, () => ponyState.collapsed],
  saveConfig,
  { deep: true }
)

// Load initial
loadSavedConfig()

// ── Public helpers ──

/** Build a human-readable summary of current config for the AI system prompt */
function getConfigContext() {
  const lines = ['Current Pony Diffusion configuration:']
  for (const cat of PONY_CATEGORIES) {
    const val = ponyState.selections[cat.key]
    if (cat.multi) {
      if (val?.length) {
        lines.push(`- ${cat.label}: ${val.map(o => o.label).join(', ')}`)
      } else {
        lines.push(`- ${cat.label}: (none selected)`)
      }
    } else {
      lines.push(`- ${cat.label}: ${val?.label || '(not set)'}`)
    }
  }
  if (ponyState.extraTags.trim()) {
    lines.push(`- Raw extra tags: ${ponyState.extraTags}`)
  }
  if (ponyState.negativePrompt.trim()) {
    lines.push(`- Negative prompt: ${ponyState.negativePrompt}`)
  }
  return lines.join('\n')
}

/** Get the full Danbooru tag string from current selections + extra tags */
function getCurrentTagString() {
  const base = composeTags(ponyState.selections)
  const extra = ponyState.extraTags.trim()
  if (!extra) return base
  return base ? `${base}, ${extra}` : extra
}

/**
 * Parse an AI response and apply changes to the store.
 * Returns a summary of what changed.
 */
function applyAiResponse(text) {
  if (!text || !text.trim()) return { changed: [], rawTagsAdded: [], negativePromptChanged: false }

  let cleanText = text.trim()
  let newNegativePrompt = null

  // Extract NEG: line if present
  const negMatch = cleanText.match(/^NEG:\s*(.+)$/im)
  if (negMatch) {
    newNegativePrompt = negMatch[1].trim()
    // Remove NEG line from text before parsing tags
    cleanText = cleanText.replace(/^NEG:\s*.+$/im, '').trim()
  }

  const result = parseTagStringToActions(cleanText, ponyState.selections)

  // Apply selection changes
  const changed = []
  if (result.selections) {
    for (const [catKey, newVal] of Object.entries(result.selections)) {
      const cat = PONY_CATEGORIES.find(c => c.key === catKey)
      if (!cat) continue
      if (cat.multi) {
        // For multi-select, we replace with AI's suggestions
        // but keep existing selections that aren't overridden
        // Actually AI output for multi is tricky — let's add new ones
        const existing = ponyState.selections[catKey]
        const added = newVal.filter(nv => !existing.some(e => e.id === nv.id))
        for (const item of added) {
          existing.push(item)
        }
        if (added.length) changed.push(catKey)
      } else {
        if (newVal && newVal.id !== ponyState.selections[catKey]?.id) {
          ponyState.selections[catKey] = newVal
          changed.push(catKey)
        }
      }
    }
  }

  // Apply raw extra tags
  let rawTagsAdded = []
  if (result.extraTags?.length) {
    const currentExtra = ponyState.extraTags ? ponyState.extraTags.split(',').map(t => t.trim()).filter(Boolean) : []
    for (const tag of result.extraTags) {
      if (!currentExtra.includes(tag)) {
        currentExtra.push(tag)
        rawTagsAdded.push(tag)
      }
    }
    ponyState.extraTags = currentExtra.join(', ')
  }

  // Apply negative prompt if AI suggested one
  let negativePromptChanged = false
  if (newNegativePrompt !== null && newNegativePrompt !== ponyState.negativePrompt) {
    ponyState.negativePrompt = newNegativePrompt
    negativePromptChanged = true
  }

  return { changed, rawTagsAdded, negativePromptChanged }
}

/**
 * Parse natural-language text, match keywords to pony tags, apply to config.
 * Returns summary of what changed.
 */
function applyTextToConfig(text) {
  if (!text || !text.trim()) return { changes: [], matchCount: 0 }
  const matches = matchTextToOptions(text)
  const changes = []

  for (const [catKey, optionId] of Object.entries(matches)) {
    const cat = PONY_CATEGORIES.find(c => c.key === catKey)
    if (!cat) continue
    const option = cat.options.find(o => o.id === optionId)
    if (!option) continue

    if (cat.multi) {
      const arr = ponyState.selections[catKey]
      if (!arr.some(s => s.id === optionId)) {
        arr.push(option)
        changes.push({ key: catKey, label: cat.label, option: option.label })
      }
    } else {
      if (ponyState.selections[catKey]?.id !== optionId) {
        ponyState.selections[catKey] = option
        changes.push({ key: catKey, label: cat.label, option: option.label })
      }
    }
  }

  return { changes, matchCount: Object.keys(matches).length }
}

/** Reset all selections to empty/null — new project */
function clearAll() {
  for (const cat of PONY_CATEGORIES) {
    if (cat.multi) ponyState.selections[cat.key].splice(0, ponyState.selections[cat.key].length)
    else ponyState.selections[cat.key] = null
  }
  ponyState.extraTags = ''
  ponyState.negativePrompt = ''
}

export function usePonyStore() {
  return {
    ponyState,
    getConfigContext,
    getCurrentTagString,
    applyAiResponse,
    applyTextToConfig,
    clearAll,
    projects,
    createProject,
    saveProjectState,
    loadProjectState,
    deleteProject,
    renameProject,
    PONY_CATEGORIES,
  }
}
