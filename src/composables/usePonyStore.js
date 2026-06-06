// Shared reactive state for Pony Diffusion configurator + chat
// Singleton — all importers share the same state
// Persists to localStorage under 'imagin-creator-pony-config'

import { reactive, watch } from 'vue'
import { PONY_CATEGORIES, getDefaultSelections, parseTagStringToActions, composeTags } from '../config/ponyDiffusion.js'

const STORAGE_KEY = 'imagin-creator-pony-config'

// ── Build initial state ──
const defaults = getDefaultSelections()

const ponyState = reactive({
  selections: { ...defaults },
  extraTags: '',
  negativePrompt: '',
  collapsed: Object.fromEntries(PONY_CATEGORIES.map(c => [c.key, true])),
})

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

/** Reset all selections to defaults */
function clearAll() {
  const defaults = getDefaultSelections()
  for (const cat of PONY_CATEGORIES) {
    if (cat.multi) ponyState.selections[cat.key].splice(0, ponyState.selections[cat.key].length)
    else ponyState.selections[cat.key] = defaults[cat.key]
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
    clearAll,
    PONY_CATEGORIES,
  }
}
