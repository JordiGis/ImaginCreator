<template>
  <div class="view-container active" style="flex: 1; display: flex; flex-direction: column;">
    <div class="view-header">
      <h2>Personajes</h2>
      <div class="view-header-actions">
        <!-- Presets -->
        <div class="char-presets">
          <button class="btn-small" @click="savePreset">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            Guardar
          </button>
          <select v-model="selectedPreset" class="preset-select">
            <option value="">— Cargar preset —</option>
            <option v-for="name in presetNames" :key="name" :value="name">{{ name }}</option>
          </select>
          <button class="btn-small" @click="loadPreset" :disabled="!selectedPreset" title="Cargar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </button>
          <button class="btn-small" @click="deletePreset" :disabled="!selectedPreset" title="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="char-layout" style="flex: 1; overflow: hidden;">
      <!-- ── Config Panel ── -->
      <div class="char-config">

      <!-- Pose mode indicator -->
      <div v-if="poseMode" class="pose-mode-banner">
        <div class="pose-mode-banner-inner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <span>Modo Pose — solo cambias pose, cámara e iluminación</span>
          <button class="btn-small" @click="exitPoseMode">Salir</button>
        </div>
      </div>
      <div
        v-for="cat in visibleCategories"
        :key="cat.key"
        :class="['category', { open: !collapsed[cat.key], multi: cat.multi }]"
      >
        <div class="category-header" @click="toggleCollapse(cat.key)">
          <span>{{ cat.label }}</span>
          <span v-if="cat.multi && getCount(cat) > 0" class="count">✓ {{ getCount(cat) }}</span>
          <span v-else-if="!cat.multi && getSingleSelectionLabel(cat)" class="count">✓ {{ getSingleSelectionLabel(cat) }}</span>
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
          <svg v-if="copied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          {{ copied ? 'Copiado' : 'Copiar' }}
        </button>
        <span>{{ composedPrompt || 'Selecciona rasgos para generar el prompt…' }}</span>
      </div>

      <!-- Model bar -->
      <div class="model-bar">recraft/recraft-v4.1-utility / $0.040/img</div>

      <!-- Reference character image (pose mode) -->
      <div v-if="poseMode && charImageDataUrl" class="char-reference">
        <div class="reference-header">
          <span class="reference-label">Personaje de referencia</span>
        </div>
        <div class="reference-content">
          <img :src="charImageDataUrl" class="reference-thumb" />
          <span class="reference-hint">La apariencia se mantiene, solo cambia la pose</span>
        </div>
      </div>

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
        <button class="btn-secondary" @click="randomize" :disabled="generating">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="15.5" r="1.5"></circle><circle cx="15.5" cy="8.5" r="1.5"></circle><circle cx="8.5" cy="15.5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle></svg>
          Aleatorio
        </button>
        <button class="btn-primary" @click="generate" :disabled="generating || !composedPrompt.trim()">
          <span v-if="generating" class="spinner"></span>
          <span v-else>{{ poseMode ? 'Generar Nueva Pose' : 'Generar Personaje' }}</span>
        </button>
      </div>


      <!-- Result -->
      <div v-if="result" :class="['char-result', { visible: true }]">
        <div v-if="result.error" class="error-box">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; margin-bottom: -2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            {{ result.error }}
          </span>
        </div>
        <template v-else>
          <img
            :src="result.imageUrl"
            alt="Personaje generado"
            @click="previewResult"
          />
          <div class="char-result-actions">
            <button class="btn-secondary" @click="sendToChat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Enviar al chat
            </button>
            <button v-if="!poseMode" class="btn-secondary" @click="enterPoseMode" :disabled="!result?.imageUrl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              Cambiar Pose
            </button>
            <button class="btn-secondary" @click="openInGallery">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Abrir en galería
            </button>
          </div>
        </template>
      </div>
    </div>
    </div>

    <!-- ===== Save Preset Modal ===== -->
    <div v-if="saveModalOpen" class="modal-overlay" @click="saveModalOpen = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Guardar Preset</h3>
          <button @click="saveModalOpen = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <p>Introduce un nombre para el nuevo preset:</p>
          <input type="text" v-model="presetNameInput" placeholder="Nombre del preset" class="preset-input" @keyup.enter="confirmSavePreset" autofocus />
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="saveModalOpen = false">Cancelar</button>
          <button class="btn-primary" @click="confirmSavePreset" :disabled="!presetNameInput.trim()">Guardar</button>
        </div>
      </div>
    </div>

    <!-- ===== Confirm Delete Modal ===== -->
    <div v-if="confirmModalOpen" class="modal-overlay" @click="confirmModalOpen = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Eliminar Preset</h3>
          <button @click="confirmModalOpen = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que quieres eliminar el preset "<strong>{{ selectedPreset }}</strong>"?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="confirmModalOpen = false">Cancelar</button>
          <button class="btn-danger" @click="confirmDeletePreset">Eliminar</button>
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

// Pose mode — lock character appearance, change only pose/camera/lighting/expression
const poseMode = ref(false)
const charImageDataUrl = ref('')

const collapsed = reactive(
  Object.fromEntries(TRAIT_CATEGORIES.map(c => [c.key, true]))
)

// ── Persistence ──
const CHAR_STORAGE_KEY = 'imagin-creator-char-config'
const CHAR_PRESETS_KEY = 'imagin-creator-char-presets'

const selectedPreset = ref('')

const saveModalOpen = ref(false)
const confirmModalOpen = ref(false)
const presetNameInput = ref('')

const presetNames = ref([])

function updatePresetNames() {
  try {
    presetNames.value = Object.keys(JSON.parse(localStorage.getItem(CHAR_PRESETS_KEY) || '{}')).sort()
  } catch {
    presetNames.value = []
  }
}

updatePresetNames()

function savePreset() {
  presetNameInput.value = ''
  saveModalOpen.value = true
}

function confirmSavePreset() {
  const name = presetNameInput.value
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
  updatePresetNames()
  selectedPreset.value = name.trim()
  saveModalOpen.value = false
}

function loadPreset() {
  if (!selectedPreset.value) return
  const presets = JSON.parse(localStorage.getItem(CHAR_PRESETS_KEY) || '{}')
  const preset = presets[selectedPreset.value]
  if (!preset) return
  // Apply selections
  if (preset.selections) {
    const defaults = getDefaultSelections()
    for (const cat of TRAIT_CATEGORIES) {
      const val = preset.selections[cat.key]
      if (cat.multi) {
        selections[cat.key].splice(0, selections[cat.key].length) // clear existing
        if (Array.isArray(val)) {
          const valid = val.map(id => cat.options.find(o => o.id === id)).filter(Boolean)
          selections[cat.key].push(...valid)
        }
      } else {
        if (val) {
          const opt = cat.options.find(o => o.id === val)
          selections[cat.key] = opt || defaults[cat.key]
        } else {
          selections[cat.key] = defaults[cat.key]
        }
      }
    }
  }
  customText.value = preset.customText || ''
  if (preset.collapsed) {
    for (const key of Object.keys(collapsed)) {
      collapsed[key] = preset.collapsed[key] !== false
    }
  }
}

function deletePreset() {
  if (!selectedPreset.value) return
  confirmModalOpen.value = true
}

function confirmDeletePreset() {
  if (!selectedPreset.value) return
  const presets = JSON.parse(localStorage.getItem(CHAR_PRESETS_KEY) || '{}')
  delete presets[selectedPreset.value]
  localStorage.setItem(CHAR_PRESETS_KEY, JSON.stringify(presets))
  updatePresetNames()
  selectedPreset.value = ''
  confirmModalOpen.value = false
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
    // Restore character reference image
    if (saved.charImage) charImageDataUrl.value = saved.charImage
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
      charImage: charImageDataUrl.value,
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

function getSingleSelectionLabel(cat) {
  if (cat.multi) return ''
  return selections[cat.key]?.label || ''
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

// In pose mode, only show categories that change scene/composition
const visibleCategories = computed(() => {
  if (!poseMode.value) return categories
  return categories.filter(c => ['pose', 'cameraAngle', 'lighting', 'expression'].includes(c.key))
})

function enterPoseMode() {
  if (!charImageDataUrl.value) {
    // Get the raw data URL from the API response
    const rawDataUrl = result.value?.raw?.images?.[0]?.dataUrl
    if (rawDataUrl) {
      charImageDataUrl.value = rawDataUrl
    } else if (result.value?.imageUrl?.startsWith('data:')) {
      charImageDataUrl.value = result.value.imageUrl
    }
  }
  if (charImageDataUrl.value) {
    poseMode.value = true
    // Collapse all categories, then expand the pose-related ones
    for (const key of Object.keys(collapsed)) {
      collapsed[key] = !['pose', 'cameraAngle', 'lighting', 'expression'].includes(key)
    }
  }
}

function exitPoseMode() {
  poseMode.value = false
}

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
  const cats = poseMode.value ? visibleCategories.value : TRAIT_CATEGORIES
  for (const cat of cats) {
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
    // In pose mode, send reference image to preserve appearance
    const images = poseMode.value && charImageDataUrl.value ? [charImageDataUrl.value] : []
    const res = await api.generateImage(prompt, CHAR_MODEL_KEY, images)
    const rawImage = res.images?.[0]
    const imageUrl = rawImage?.dataUrl || `/img/${rawImage?.file}`
    result.value = {
      imageUrl,
      prompt,
      model: res.model,
      cost: res.cost,
      cached: res.cached,
      tokens: (res.usage?.prompt || 0) + (res.usage?.output || 0),
      raw: res,
    }
    // Update character reference image
    if (rawImage?.dataUrl) {
      charImageDataUrl.value = rawImage.dataUrl
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

/* ── Pose Mode Banner ── */

.pose-mode-banner {
  margin-bottom: 10px;
}

.pose-mode-banner-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-subtle);
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  padding: 8px 12px;
  font-size: 12px;
  color: var(--accent);
}

.pose-mode-banner-inner svg {
  flex-shrink: 0;
}

.pose-mode-banner-inner span {
  flex: 1;
}

.pose-mode-banner-inner .btn-small {
  flex-shrink: 0;
}

/* ── Reference Character (Pose Mode) ── */

.char-reference {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.reference-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.reference-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
}

.reference-thumb {
  width: 64px;
  height: 64px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.reference-hint {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.4;
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

@media (max-width: 639px) {
  .char-config {
    padding: 12px;
    max-height: 45vh;
  }
  .char-preview {
    padding: 12px;
  }
  .category-body {
    gap: 4px;
  }
  .tag-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
  .char-actions {
    gap: 8px;
  }
  .btn-primary, .btn-secondary {
    padding: 8px 16px;
    font-size: 13px;
  }
  .char-result {
    padding: 14px;
  }
  .char-result img {
    max-width: 100%;
  }
  .char-result-actions {
    gap: 8px;
  }
  .char-prompt-box {
    padding: 10px 12px;
    font-size: 12px;
  }
  .btn-small {
    padding: 4px 8px;
    font-size: 11px;
  }
  .preset-select {
    min-width: 60px;
    font-size: 11px;
  }
  .char-presets {
    gap: 4px;
  }
  .model-bar {
    font-size: 11px;
  }
  .char-free-input {
    font-size: 12px;
    padding: 8px 10px;
  }
  .char-reference {
    gap: 8px;
  }
  .reference-header {
    font-size: 12px;
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

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s;
}

.close-btn:hover {
  color: var(--fg);
}

.modal-body {
  padding: 24px;
  color: var(--fg);
  font-size: 14px;
}

.modal-body p {
  margin: 0 0 16px 0;
}

.preset-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg);
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
}

.preset-input:focus {
  outline: none;
  border-color: var(--accent);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.btn-danger {
  background: #ff5252;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-danger:hover {
  opacity: 0.9;
}
</style>
