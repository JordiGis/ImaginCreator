<template>
  <div class="view-container active" style="flex: 1; display: flex; flex-direction: column;">
    <div class="view-header">
      <h2>Personajes</h2>
      <div class="view-header-actions">
        <!-- Presets -->
        <div class="char-presets">
          <button class="btn-small" @click="savePreset">💾 Guardar</button>
          <select v-model="selectedPreset" class="preset-select">
            <option value="">— Cargar preset —</option>
            <option v-for="name in presetNames" :key="name" :value="name">{{ name }}</option>
          </select>
          <button class="btn-small" @click="loadPreset" :disabled="!selectedPreset" title="Cargar">📂</button>
          <button class="btn-small" @click="deletePreset" :disabled="!selectedPreset" title="Eliminar">🗑️</button>
        </div>
      </div>
    </div>

    <div class="char-layout" style="flex: 1; overflow: hidden;">
      <!-- ── Config Panel ── -->
      <div class="char-config">

      <div
        v-for="cat in categories"
        :key="cat.key"
        :class="['category', { open: !collapsed[cat.key], multi: cat.multi }]"
      >
        <div class="category-header" @click="toggleCollapse(cat.key)">
          <span>{{ cat.label }}</span>
          <span v-if="cat.multi && getCount(cat) > 0" class="count">✓ {{ getCount(cat) }}</span>
        </div>
        <div class="category-body">
          <button
            v-for="opt in cat.options"
            :key="opt.id"
            :class="['tag-btn', { selected: isSelected(cat, opt) }]"
            @click="toggleTrait(cat, opt)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Preview / Result Panel ── -->
    <div class="char-preview">
      <!-- Prompt box -->
      <div class="char-prompt-box">
        <button class="copy-btn" @click="copyPrompt">
          {{ copied ? '✓' : '📋 Copiar' }}
        </button>
        <span>{{ composedPrompt || 'Selecciona rasgos para generar el prompt…' }}</span>
      </div>

      <!-- Model bar -->
      <div class="model-bar">recraft/recraft-v4.1-utility / $0.040/img</div>

      <!-- Custom text -->
      <textarea
        v-model="customText"
        class="char-free-input"
        placeholder="Ej: con una espada de fuego y cicatrices en el rostro…"
        rows="2"
        :disabled="generating"
      ></textarea>

      <!-- Actions -->
      <div class="char-actions">
        <button class="btn-secondary" @click="randomize" :disabled="generating">🎲 Aleatorio</button>
        <button class="btn-primary" @click="generate" :disabled="generating || !composedPrompt.trim()">
          <span v-if="generating" class="spinner"></span>
          <span v-else>Generar Personaje</span>
        </button>
      </div>


      <!-- Result -->
      <div v-if="result" :class="['char-result', { visible: true }]">
        <div v-if="result.error" class="error-box">
          <span>⚠️ {{ result.error }}</span>
        </div>
        <template v-else>
          <img
            :src="result.imageUrl"
            alt="Personaje generado"
            @click="previewResult"
          />
          <div class="char-result-actions">
            <button class="btn-secondary" @click="sendToChat">💬 Enviar al chat</button>
            <button class="btn-secondary" @click="openInGallery">🖼️ Abrir en galería</button>
          </div>
        </template>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { TRAIT_CATEGORIES, getDefaultSelections, composePrompt } from '../config/characterTraits.js'
import { useApi } from '../composables/useApi.js'
import { useCreditTracker } from '../composables/useCreditTracker.js'

const CHAR_MODEL_KEY = 'recraft-v41'

import { useRouter } from 'vue-router'
import { useChatStore } from '../composables/useChatStore.js'

const router = useRouter()
const { setModel, addMessage, currentSessionId } = useChatStore()

const api = useApi()
const credit = useCreditTracker()

const selections = reactive(getDefaultSelections())
const generating = ref(false)
const result = ref(null)
const copied = ref(false)
const customText = ref('')

const collapsed = reactive(
  Object.fromEntries(TRAIT_CATEGORIES.map(c => [c.key, true]))
)

// ── Persistence ──
const CHAR_STORAGE_KEY = 'imagin-creator-char-config'
const CHAR_PRESETS_KEY = 'imagin-creator-char-presets'

const selectedPreset = ref('')

const presetNames = computed(() => {
  try { return Object.keys(JSON.parse(localStorage.getItem(CHAR_PRESETS_KEY) || '{}')).sort() } catch { return [] }
})

function savePreset() {
  const name = prompt('Nombre del preset:')
  if (!name || !name.trim()) return
  const s = {}
  for (const cat of TRAIT_CATEGORIES) {
    if (cat.multi) {
      s[cat.key] = selections[cat.key].map(o => o.id)
    } else {
      s[cat.key] = selections[cat.key]?.id || null
    }
  }
  const presets = JSON.parse(localStorage.getItem(CHAR_PRESETS_KEY) || '{}')
  presets[name.trim()] = {
    selections: s,
    customText: customText.value,
    collapsed: { ...collapsed },
  }
  localStorage.setItem(CHAR_PRESETS_KEY, JSON.stringify(presets))
  selectedPreset.value = name.trim()
}

function loadPreset() {
  if (!selectedPreset.value) return
  const presets = JSON.parse(localStorage.getItem(CHAR_PRESETS_KEY) || '{}')
  const preset = presets[selectedPreset.value]
  if (!preset) return
  // Apply selections
  if (preset.selections) {
    for (const cat of TRAIT_CATEGORIES) {
      const val = preset.selections[cat.key]
      if (val == null) continue
      if (cat.multi && Array.isArray(val)) {
        const valid = val.map(id => cat.options.find(o => o.id === id)).filter(Boolean)
        selections[cat.key].splice(0, selections[cat.key].length, ...valid)
      } else {
        const opt = cat.options.find(o => o.id === val)
        if (opt) selections[cat.key] = opt
      }
    }
  }
  if (preset.customText != null) customText.value = preset.customText
  if (preset.collapsed) {
    for (const key of Object.keys(collapsed)) {
      collapsed[key] = preset.collapsed[key] !== false
    }
  }
}

function deletePreset() {
  if (!selectedPreset.value) return
  if (!confirm(`¿Eliminar preset "${selectedPreset.value}"?`)) return
  const presets = JSON.parse(localStorage.getItem(CHAR_PRESETS_KEY) || '{}')
  delete presets[selectedPreset.value]
  localStorage.setItem(CHAR_PRESETS_KEY, JSON.stringify(presets))
  selectedPreset.value = ''
}

function loadSavedConfig() {
  try {
    const raw = localStorage.getItem(CHAR_STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    // Restore selections
    if (saved.selections) {
      const defaults = getDefaultSelections()
      for (const cat of TRAIT_CATEGORIES) {
        const savedVal = saved.selections[cat.key]
        if (savedVal == null) continue
        if (cat.multi && Array.isArray(savedVal)) {
          const validOpts = savedVal
            .map(id => cat.options.find(o => o.id === id))
            .filter(Boolean)
          selections[cat.key].splice(0, selections[cat.key].length, ...validOpts)
        } else {
          const opt = cat.options.find(o => o.id === savedVal)
          if (opt) selections[cat.key] = opt
        }
      }
    }
    // Restore custom text
    if (saved.customText) customText.value = saved.customText
    // Restore collapsed state
    if (saved.collapsed) {
      for (const key of Object.keys(collapsed)) {
        if (saved.collapsed[key] === false) collapsed[key] = false
      }
    }
  } catch (e) {
    console.warn('Failed to load character config:', e)
  }
}

function saveConfig() {
  try {
    const s = {}
    for (const cat of TRAIT_CATEGORIES) {
      if (cat.multi) {
        s[cat.key] = selections[cat.key].map(o => o.id)
      } else {
        s[cat.key] = selections[cat.key]?.id || null
      }
    }
    localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify({
      selections: s,
      customText: customText.value,
      collapsed: { ...collapsed },
    }))
  } catch {}
}

// Auto-save when selections, custom text, or collapsed state changes
watch([() => selections, customText, () => collapsed], saveConfig, { deep: true })

// Load saved config on mount
loadSavedConfig()

function toggleCollapse(key) {
  collapsed[key] = !collapsed[key]
}

function getCount(cat) {
  if (!cat.multi) return 0
  return selections[cat.key].length
}

function isSelected(cat, opt) {
  if (cat.multi) {
    return selections[cat.key].some(s => s.id === opt.id)
  }
  return selections[cat.key]?.id === opt.id
}

function toggleTrait(cat, opt) {
  if (cat.multi) {
    const arr = selections[cat.key]
    const idx = arr.findIndex(s => s.id === opt.id)
    if (idx >= 0) {
      arr.splice(idx, 1)
    } else {
      arr.push(opt)
    }
  } else {
    selections[cat.key] = opt
  }
}

const categories = TRAIT_CATEGORIES

const composedPrompt = computed(() => {
  const base = composePrompt(selections)
  const extra = customText.value.trim()
  if (!extra) return base
  const suffix = ', fantasy character concept art'
  const idx = base.indexOf(suffix)
  if (idx !== -1) {
    return base.slice(0, idx) + `, ${extra}` + base.slice(idx)
  }
  return `${base}, ${extra}`
})

function randomize() {
  for (const cat of TRAIT_CATEGORIES) {
    if (cat.multi) {
      const shuffled = [...cat.options].sort(() => Math.random() - 0.5)
      const count = Math.floor(Math.random() * Math.min(4, cat.options.length + 1))
      selections[cat.key].splice(0, selections[cat.key].length, ...shuffled.slice(0, count))
    } else {
      const idx = Math.floor(Math.random() * cat.options.length)
      selections[cat.key] = cat.options[idx]
    }
  }
}

async function generate() {
  if (generating.value) return
  generating.value = true
  result.value = null

  try {
    const prompt = composedPrompt.value
    const res = await api.generateImage(prompt, CHAR_MODEL_KEY)
    result.value = {
      imageUrl: res.images?.[0]?.dataUrl || `/img/${res.images?.[0]?.file}`,
      prompt,
      model: res.model,
      cost: res.cost,
      cached: res.cached,
      tokens: (res.usage?.prompt || 0) + (res.usage?.output || 0),
      raw: res,
    }
    credit.addGeneration(res)
  } catch (e) {
    result.value = {
      error: e.message,
      imageUrl: null,
      prompt: composedPrompt.value,
      model: 'Error',
      cost: '0',
      cached: false,
      tokens: 0,
    }
  } finally {
    generating.value = false
  }
}

function copyPrompt() {
  navigator.clipboard.writeText(composedPrompt.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function previewResult() {
  // Use a simple modal approach
  if (result.value?.imageUrl) {
    window.openLightbox?.(result.value.imageUrl)
  }
}

function sendToChat() {
  if (result.value) {
    setModel('recraft-v41')
    addMessage({
      _id: `char-${Date.now()}`,
      role: 'assistant',
      text: result.value.prompt || 'Personaje generado',
      images: result.value.imageUrl ? [{ dataUrl: result.value.imageUrl }] : [],
      info: {
        model: result.value.model || 'Recraft V4.1',
        cost: result.value.cost || '0',
        tokens: result.value.tokens || 0,
        cached: result.value.cached || false,
      },
    })
    router.push(currentSessionId.value ? `/chat/${currentSessionId.value}` : '/chat')
  }
}

function openInGallery() {
  router.push('/gallery')
}
</script>

<style scoped>
.char-layout {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  min-height: 0;
  background: var(--bg-deep);
}

/* ── Config Panel ── */

.char-config {
  flex: 0 0 420px;
  min-width: 0;
  max-width: 100%;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 24px 20px;
  overflow-y: auto;
  height: 100%;
  min-height: 0;
}

.char-config h2 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
}

.char-config .category + .category {
  margin-top: 6px;
}

/* ── Categories ── */

.category {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--surface-2);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg);
  transition: background 0.1s;
}

.category-header:hover {
  background: var(--border);
}

.category-header .count {
  color: var(--accent);
  font-size: 12px;
}

.category-body {
  overflow: hidden;
  max-height: 0;
  padding: 0 14px;
  flex-wrap: wrap;
  gap: 6px;
  border-top: 1px solid var(--border);
  transition: max-height 0.25s ease, padding 0.25s ease;
  visibility: hidden;
}

.char-presets {
  display: flex;
  gap: 8px;
  align-items: center;
}

.category.open .category-body {
  max-height: 600px;
  padding: 10px 14px;
  visibility: visible;
}

/* ── Tag Buttons ── */

.tag-btn {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.tag-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.tag-btn.selected {
  background: var(--accent-subtle);
  border-color: var(--accent);
  color: var(--accent);
}

/* ── Preview Panel ── */

.char-preview {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.char-prompt-box {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--muted);
  max-height: 120px;
  overflow-y: auto;
  position: relative;
}

.char-prompt-box .copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 8px;
  color: var(--muted);
  cursor: pointer;
  font-size: 12px;
  transition: background 0.1s;
  font-family: inherit;
}

.char-prompt-box .copy-btn:hover {
  background: var(--border);
  color: var(--fg);
}

.model-bar {
  font-size: 12px;
  color: var(--success);
  font-weight: 500;
}

.char-free-input {
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  color: var(--fg);
  font: inherit;
  font-size: 13px;
  min-height: 70px;
  resize: vertical;
  outline: none;
  line-height: 1.5;
}

.char-free-input:focus {
  border-color: var(--accent);
}

.char-free-input::placeholder {
  color: var(--muted);
}

.char-free-input:disabled {
  opacity: 0.5;
}

/* ── Actions ── */

.char-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 14px;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn-secondary {
  background: var(--surface-2);
  color: var(--fg);
  border: 1px solid var(--border);
  padding: 10px 20px;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 14px;
  font-family: inherit;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--border);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: default;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Result ── */

.char-result {
  background: var(--surface-2);
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.char-result.visible { display: flex; }

.char-result img {
  max-width: 300px;
  width: 100%;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin: 0 auto;
  cursor: pointer;
  transition: border-color 0.2s;
}

.char-result img:hover {
  border-color: var(--accent);
}

.char-result-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.error-box {
  color: #ff5252;
  font-size: 13px;
  background: #2a1010;
  border: 1px solid #4a2020;
  border-radius: var(--radius);
  padding: 14px 18px;
  text-align: left;
}

/* ── Scrollbar ── */

.char-config::-webkit-scrollbar,
.char-preview::-webkit-scrollbar {
  width: 6px;
}

.char-config::-webkit-scrollbar-track,
.char-preview::-webkit-scrollbar-track {
  background: transparent;
}

.char-config::-webkit-scrollbar-thumb,
.char-preview::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .char-config {
    flex: 1 1 100%;
    max-width: 100%;
    min-width: 0;
    border-right: none;
    border-bottom: 1px solid var(--border);
    max-height: 50vh;
  }
  .char-preview {
    padding: 16px;
  }
}

/* ── Presets ── */
.char-presets {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.btn-small {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s, border-color 0.15s;
}

.btn-small:hover:not(:disabled) {
  color: var(--fg);
  border-color: var(--accent);
}

.btn-small:disabled {
  opacity: 0.4;
  cursor: default;
}

.preset-select {
  flex: 1;
  min-width: 80px;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--fg);
  font: inherit;
  font-size: 12px;
  padding: 4px 6px;
  cursor: pointer;
}

.preset-select:focus {
  outline: none;
  border-color: var(--accent);
}

.preset-select option {
  background: var(--surface);
  color: var(--fg);
}
</style>
