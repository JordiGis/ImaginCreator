<template>
  <div class="chat-input-area">
    <!-- Model status bar -->
    <div class="model-status-bar">
      <span class="desktop-model-info">{{ activeModelLabel }} / ${{ activeModelCost.toFixed(3) }}/img</span>
      <select class="mobile-model-select" :value="modelKey" @change="$emit('update:model-key', $event.target.value)">
        <option v-for="m in MODELS" :key="m.key" :value="m.key">
          {{ m.label }} – ${{ m.cost.toFixed(3) }}/img
        </option>
      </select>
    </div>

    <!-- Image preview strip -->
    <div v-if="images.length" class="image-preview-strip">
      <div v-for="(img, i) in images" :key="i" class="image-preview-thumb">
        <img :src="img.dataUrl" alt="" />
        <button class="remove-btn" @click="removeImage(i)">✕</button>
        <span class="size-label">{{ img.sizeKB }} KB</span>
      </div>
    </div>

    <!-- System prompt (collapsible) -->
    <div v-if="showSystemPrompt" class="system-prompt-area">
      <div class="system-prompt-header">
        <span>System Prompt</span>
        <div style="display: flex; gap: 8px;">
          <button class="clear-sys-btn" @click="showSystemPrompt = false">Plegar</button>
          <button class="clear-sys-btn" @click="clearSystemPrompt">Limpiar</button>
        </div>
      </div>
      <textarea
        v-model="systemPrompt"
        rows="2"
        placeholder="Instrucciones de sistema / jailbreak (se envía como role: system)"
        :disabled="disabled"
        @input="onSystemInput"
      ></textarea>
    </div>

    <!-- Erotic mode (collapsible) -->
    <div v-if="eroticMode" class="erotic-panel">
      <div class="erotic-header">
        <div class="erotic-header-title">
          <span>♥ Modo Erótico</span>
          <span class="erotic-preset-name">{{ activeEroticLabel }}</span>
        </div>
        <button class="clear-sys-btn" @click="eroticExpanded = !eroticExpanded">
          {{ eroticExpanded ? 'Plegar' : 'Desplegar' }}
        </button>
      </div>

      <div v-show="eroticExpanded">
        <div class="erotic-chips">
          <button
            v-for="p in EROTIC_PRESETS"
            :key="p.key"
            :class="['erotic-chip', { active: eroticStyle === p.key }]"
            @click="selectEroticStyle(p.key)"
            :title="p.desc"
          >{{ p.icon }} {{ p.label }}</button>
        </div>

        <!-- Scene configuration -->
        <div class="scene-config">
          <div class="scene-config-title">Configurar escena</div>
          <div v-for="cat in SCENE_CATEGORIES" :key="cat.key" class="scene-row">
            <label class="scene-label">{{ cat.icon }} {{ cat.label }}</label>
            <select class="scene-select" v-model="sceneSelections[cat.key]">
              <option :value="null">—</option>
              <option v-for="opt in cat.options" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
            </select>
          </div>
          <div v-if="hasSceneConfig" class="scene-preview">
            {{ sceneSuffix }}
          </div>
        </div>

        <!-- NSFW Presets -->
        <div class="erotic-presets">
          <button class="clear-sys-btn" @click="saveEroticPreset">💾 Guardar</button>
          <select v-model="selectedEroticPreset" class="erotic-preset-select">
            <option value="">— Cargar —</option>
            <option v-for="name in eroticPresetNames" :key="name" :value="name">{{ name }}</option>
          </select>
          <button class="clear-sys-btn" @click="loadEroticPreset" :disabled="!selectedEroticPreset" title="Cargar">📂</button>
          <button class="clear-sys-btn" @click="deleteEroticPreset" :disabled="!selectedEroticPreset" title="Eliminar">🗑️</button>
        </div>
      </div>
    </div>

    <!-- Translated text preview -->
    <div v-if="translatedPreview" class="translated-preview">
      <span class="tp-label">🌐 Traducido:</span>
      <span class="tp-text">{{ translatedPreview }}</span>
      <button class="tp-dismiss" @click="translatedPreview = ''">✕</button>
    </div>
    <div v-else-if="translateError" class="translated-preview error">
      <span class="tp-label">⚠️ Error traducción:</span>
      <span class="tp-text">{{ translateError }}</span>
      <button class="tp-dismiss" @click="translateError = ''">✕</button>
    </div>

    <!-- Input row -->
    <div class="input-row">
      <div class="input-wrap">
        <textarea
          ref="textareaRef"
          v-model="text"
          rows="1"
          placeholder="Describe lo que quieres generar…"
          :disabled="disabled"
          @keydown.enter.exact.prevent="send"
          @input="autoResize"
        ></textarea>
        <div class="input-footer">
          <div class="input-footer-left">
            <button class="attach-btn" @click="openFilePicker" :disabled="disabled" title="Adjuntar imágenes (hasta 4)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </button>
            <button class="attach-btn" :class="{ active: showSystemPrompt || hasActiveSystem }" @click="toggleSystemPrompt" :disabled="disabled" title="System prompt / jailbreak">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </button>
            <button class="attach-btn" :class="{ active: eroticMode }" @click="toggleEroticMode" :disabled="disabled" title="Modo erótico / artístico">
              ♥
            </button>
            <button class="attach-btn" :class="{ active: translateEnabled }" @click="translateEnabled = !translateEnabled" :disabled="disabled" title="Traducir a inglés antes de generar">
              🌐
            </button>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              hidden
              @change="handleFiles"
            />
            <span :class="['cache-indicator', { visible: hasCache }]">🆓 En caché</span>
          </div>
          <button class="send-btn" :disabled="disabled || (!text.trim() && !images.length)" @click="send">
            <span v-if="disabled && translating" class="spinner"></span>
            <span v-if="translating">Traduciendo…</span>
            <span v-else-if="disabled && !translating" class="spinner"></span>
            <span v-else>Generar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { getModel, MODELS, EROTIC_PRESETS } from '../config/models.js'
import { SCENE_CATEGORIES, buildScenePrompt, getDefaultSelections, wrapPrompt } from '../config/eroticScene.js'

const MAX_IMG_DIM = 1024
const JPEG_QUALITY = 0.75

const props = defineProps({
  disabled: { type: Boolean, default: false },
  estimatedCost: { type: Number, default: 0 },
  modelKey: { type: String, default: 'recraft-v41' },
  pendingAttachments: { type: Array, default: () => [] },
  translateFn: { type: Function, default: null }
})

const emit = defineEmits(['send', 'update:model-key'])

const text = ref('')
const textareaRef = ref(null)
const fileInputRef = ref(null)
const hasCache = ref(false)
const images = ref([])
const showSystemPrompt = ref(false)
const systemPrompt = ref('')
const userEditedSystem = ref(false)
const translateEnabled = ref(false)
const translating = ref(false)
const translatedPreview = ref('')
const translateError = ref('')

const modelConfig = computed(() => getModel(props.modelKey))
const activeModelLabel = computed(() => modelConfig.value.label)
const activeModelCost = computed(() => modelConfig.value.cost)

function autoResize() {
  const el = textareaRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }
}

function openFilePicker() {
  if (images.value.length >= 4) return
  fileInputRef.value?.click()
}

function removeImage(idx) {
  images.value.splice(idx, 1)
}

function toggleSystemPrompt() {
  showSystemPrompt.value = !showSystemPrompt.value
  if (showSystemPrompt.value && !systemPrompt.value) {
    const def = modelConfig.value.defaultSystemPrompt
    if (def) systemPrompt.value = def
  }
}

function onSystemInput() {
  userEditedSystem.value = true
}

function clearSystemPrompt() {
  systemPrompt.value = ''
  eroticMode.value = false
  showSystemPrompt.value = false
  userEditedSystem.value = false
  sceneSelections.value = getDefaultSelections()
}

// ── Erotic mode ──
const EROTIC_STORAGE_KEY = 'imagin-creator-erotic-config'
const eroticMode = ref(false)
const eroticExpanded = ref(true)
const eroticStyle = ref('boudoir')
const sceneSelections = ref(getDefaultSelections())

function loadSavedConfig() {
  try {
    const raw = localStorage.getItem(EROTIC_STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (saved.eroticMode) eroticMode.value = true
    if (saved.eroticStyle) eroticStyle.value = saved.eroticStyle
    if (saved.sceneSelections) {
      const merged = getDefaultSelections()
      for (const k of Object.keys(merged)) {
        if (saved.sceneSelections[k] != null) merged[k] = saved.sceneSelections[k]
      }
      sceneSelections.value = merged
    }
    if (saved.translateEnabled) translateEnabled.value = true
  } catch {}
}

function saveConfig() {
  try {
    localStorage.setItem(EROTIC_STORAGE_KEY, JSON.stringify({
      eroticMode: eroticMode.value,
      eroticStyle: eroticStyle.value,
      sceneSelections: sceneSelections.value,
      translateEnabled: translateEnabled.value,
    }))
  } catch {}
}

const sceneSuffix = computed(() => buildScenePrompt(sceneSelections.value))
const hasSceneConfig = computed(() => !!sceneSuffix.value)

const activeEroticLabel = computed(() => {
  const p = EROTIC_PRESETS.find(e => e.key === eroticStyle.value)
  return p ? p.label : ''
})

function toggleEroticMode() {
  eroticMode.value = !eroticMode.value
  if (eroticMode.value) {
    eroticExpanded.value = true
    // Auto-switch to Recraft V4.1 — provider más permisivo con arte erótico
    emit('update:model-key', 'recraft-v41')
    selectEroticStyle(eroticStyle.value)
    if (!showSystemPrompt.value) toggleSystemPrompt()
  } else {
    // Turned off — restore model default or clear, reset scene config
    const def = getModel(props.modelKey).defaultSystemPrompt || ''
    systemPrompt.value = def
    if (!def) showSystemPrompt.value = false
    userEditedSystem.value = false
    sceneSelections.value = getDefaultSelections()
  }
}

function selectEroticStyle(key) {
  eroticStyle.value = key
  const preset = EROTIC_PRESETS.find(p => p.key === key)
  if (preset) {
    systemPrompt.value = preset.systemPrompt
    if (!showSystemPrompt.value) showSystemPrompt.value = true
  }
}

// ── NSFW / Erotic presets ──
const EROTIC_PRESETS_KEY = 'imagin-creator-erotic-presets'
const selectedEroticPreset = ref('')

const eroticPresetNames = computed(() => {
  try { return Object.keys(JSON.parse(localStorage.getItem(EROTIC_PRESETS_KEY) || '{}')).sort() } catch { return [] }
})

function saveEroticPreset() {
  const name = prompt('Nombre del preset erótico:')
  if (!name || !name.trim()) return
  const presets = JSON.parse(localStorage.getItem(EROTIC_PRESETS_KEY) || '{}')
  presets[name.trim()] = {
    eroticStyle: eroticStyle.value,
    sceneSelections: { ...sceneSelections.value },
    translateEnabled: translateEnabled.value,
    systemPrompt: systemPrompt.value,
  }
  localStorage.setItem(EROTIC_PRESETS_KEY, JSON.stringify(presets))
  selectedEroticPreset.value = name.trim()
}

function loadEroticPreset() {
  if (!selectedEroticPreset.value) return
  const presets = JSON.parse(localStorage.getItem(EROTIC_PRESETS_KEY) || '{}')
  const preset = presets[selectedEroticPreset.value]
  if (!preset) return
  if (preset.eroticStyle) {
    eroticStyle.value = preset.eroticStyle
    const p = EROTIC_PRESETS.find(e => e.key === preset.eroticStyle)
    if (p) systemPrompt.value = p.systemPrompt
  }
  if (preset.sceneSelections) {
    const merged = { ...sceneSelections.value }  // preserve user's current selections
    for (const k of Object.keys(getDefaultSelections())) {
      if (preset.sceneSelections[k] != null) merged[k] = preset.sceneSelections[k]  // preset wins where specified
    }
    sceneSelections.value = merged
  }
  if (preset.translateEnabled != null) translateEnabled.value = preset.translateEnabled
  if (preset.systemPrompt && !preset.eroticStyle) systemPrompt.value = preset.systemPrompt
  if (!showSystemPrompt.value && systemPrompt.value.trim()) showSystemPrompt.value = true
}

function deleteEroticPreset() {
  if (!selectedEroticPreset.value) return
  if (!confirm(`¿Eliminar preset "${selectedEroticPreset.value}"?`)) return
  const presets = JSON.parse(localStorage.getItem(EROTIC_PRESETS_KEY) || '{}')
  delete presets[selectedEroticPreset.value]
  localStorage.setItem(EROTIC_PRESETS_KEY, JSON.stringify(presets))
  selectedEroticPreset.value = ''
}

// Auto-save erotic config on changes (not immediate — let onMounted load first)
watch([eroticMode, eroticStyle, sceneSelections, translateEnabled], saveConfig, { deep: true })

// When model changes, reset system prompt to model's default
watch(() => props.modelKey, () => {
  eroticMode.value = false
  sceneSelections.value = getDefaultSelections()
  const def = getModel(props.modelKey).defaultSystemPrompt || ''
  systemPrompt.value = def
  showSystemPrompt.value = !!def
})

const hasActiveSystem = computed(() => !!systemPrompt.value.trim())

function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > MAX_IMG_DIM || height > MAX_IMG_DIM) {
        const ratio = Math.min(MAX_IMG_DIM / width, MAX_IMG_DIM / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
      const sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024)
      URL.revokeObjectURL(img.src)
      resolve({ dataUrl, sizeKB, width, height, name: file.name })
    }
    img.src = URL.createObjectURL(file)
  })
}

async function handleFiles(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return
  const remaining = 4 - images.value.length
  for (const file of files.slice(0, remaining)) {
    if (file.size > 20 * 1024 * 1024) continue
    const compressed = await compressImage(file)
    images.value.push(compressed)
  }
  fileInputRef.value.value = ''
  autoResize()
}

async function send() {
  const trimmed = text.value.trim()
  if ((!trimmed && !images.value.length) || props.disabled) return
  let finalPrompt = trimmed
  translatedPreview.value = ''
  translateError.value = ''
  // Translate to English if toggle is on
  if (translateEnabled.value && trimmed && props.translateFn) {
    translating.value = true
    try {
      finalPrompt = await props.translateFn(trimmed)
      translatedPreview.value = finalPrompt
      console.log('🌐 Translated:', trimmed, '→', finalPrompt)
    } catch (e) {
      console.warn('🌐 Translation failed:', e)
      translateError.value = String(e).slice(0, 120)
      finalPrompt = trimmed
    }
    translating.value = false
  }
  // Wrap in artistic context if erotic mode active
  if (eroticMode.value) {
    finalPrompt = wrapPrompt(finalPrompt, sceneSuffix.value, eroticStyle.value)
  }
  emit('send', { prompt: finalPrompt, images: images.value.map(i => i.dataUrl), systemPrompt: systemPrompt.value })
  text.value = ''
  images.value = []
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
  eroticExpanded.value = false
  showSystemPrompt.value = false
}

// Debounced cache check
let debounceTimer = null
watch(text, (val) => {
  if (translatedPreview.value || translateError.value) {
    translatedPreview.value = ''
    translateError.value = ''
  }
  clearTimeout(debounceTimer)
  if (val.trim().length < 5) {
    hasCache.value = false
    return
  }
  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/check-cache?prompt=${encodeURIComponent(val.trim())}&model=${encodeURIComponent(props.modelKey)}`)
      const data = await res.json()
      hasCache.value = data.cached
    } catch {
      hasCache.value = false
    }
  }, 600)
})

watch(() => props.modelKey, () => {
  hasCache.value = false
})

import { onMounted } from 'vue'
onMounted(() => {
  loadSavedConfig()
  textareaRef.value?.focus()
  const def = getModel(props.modelKey).defaultSystemPrompt || ''
  if (def) {
    systemPrompt.value = def
    showSystemPrompt.value = true
  }
})

// Auto-load pending attachments from parent (e.g. clicking "use as ref" on chat images)
watch(() => props.pendingAttachments?.length ?? 0, (newLen, oldLen) => {
  if (newLen <= oldLen) return
  for (let i = oldLen; i < props.pendingAttachments.length; i++) {
    const dataUrl = props.pendingAttachments[i]
    if (dataUrl && images.value.length < 4) {
      images.value.push({ dataUrl, sizeKB: Math.round(dataUrl.length / 1024) })
    }
  }
})
</script>

<style scoped>
.chat-input-area {
  padding: 16px 32px;
  border-top: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}

.model-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--success);
  margin-bottom: 8px;
  padding: 0 4px;
}

.desktop-model-info {
  display: none;
}

@media (min-width: 901px) {
  .desktop-model-info {
    display: inline;
  }
}

.mobile-model-select {
  display: block;
  width: 100%;
  padding: 4px 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--success);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%2300c853' d='M5 7L1 3h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  padding-right: 22px;
}

.mobile-model-select:focus {
  outline: none;
  border-color: var(--accent);
}

@media (min-width: 901px) {
  .mobile-model-select {
    display: none;
  }
}

.image-preview-strip {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.image-preview-thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border);
  position: relative;
}

.image-preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #ff5252;
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 10px;
  cursor: pointer;
  display: grid;
  place-content: center;
  line-height: 1;
  padding: 0;
}

.size-label {
  position: absolute;
  bottom: 2px;
  left: 2px;
  font-size: 9px;
  color: #fff;
  background: rgba(0,0,0,0.6);
  padding: 0 4px;
  border-radius: 2px;
}

.input-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 12px;
  transition: border-color 0.2s;
}

.input-wrap:focus-within {
  border-color: var(--accent);
}

.input-wrap textarea {
  width: 100%;
  background: none;
  border: none;
  color: var(--fg);
  font: inherit;
  font-size: 14px;
  resize: none;
  outline: none;
  min-height: 24px;
  line-height: 1.5;
  padding: 0;
}

.input-wrap textarea:disabled {
  opacity: 0.5;
}

.input-wrap textarea::placeholder {
  color: var(--muted);
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.input-footer-left {
  display: flex;
  gap: 6px;
  align-items: center;
}

.system-prompt-area {
  margin-bottom: 8px;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 12px;
}

.system-prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin-bottom: 6px;
}

.clear-sys-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--muted);
  font-size: 11px;
  padding: 2px 8px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.1s, border-color 0.1s;
}

.clear-sys-btn:hover {
  color: var(--fg);
  border-color: var(--accent);
}

.system-prompt-area textarea {
  width: 100%;
  background: none;
  border: none;
  color: var(--fg);
  font: inherit;
  font-size: 12px;
  resize: none;
  outline: none;
  line-height: 1.4;
  padding: 0;
}

.system-prompt-area textarea::placeholder {
  color: var(--muted);
  font-size: 12px;
}

/* ── Erotic panel ── */
.erotic-panel {
  margin-bottom: 8px;
  background: linear-gradient(135deg, rgba(255,64,129,0.06), rgba(156,39,176,0.04));
  border: 1px solid rgba(255,64,129,0.25);
  border-radius: var(--radius);
  padding: 8px 12px;
}

.erotic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.erotic-header-title {
  display: flex;
  gap: 8px;
  align-items: center;
}

.erotic-header-title span:first-child {
  color: #ff4081;
  font-weight: 600;
}

.erotic-preset-name {
  color: var(--muted);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.erotic-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.erotic-chip {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  white-space: nowrap;
}

.erotic-chip:hover {
  border-color: #ff4081;
  color: var(--fg);
  background: rgba(255,64,129,0.08);
}

.erotic-chip.active {
  border-color: #ff4081;
  color: #ff4081;
  background: rgba(255,64,129,0.15);
  font-weight: 500;
}

/* ── Scene config ── */
.scene-config {
  margin-top: 10px;
  border-top: 1px solid rgba(255,64,129,0.15);
  padding-top: 10px;
}

.scene-config-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ff4081;
  font-weight: 600;
  margin-bottom: 8px;
}

.scene-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.scene-label {
  font-size: 12px;
  color: var(--muted);
  min-width: 110px;
  flex-shrink: 0;
}

.scene-select {
  flex: 1;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg);
  font: inherit;
  font-size: 12px;
  padding: 4px 8px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%238a8a96' d='M5 7L1 3h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  padding-right: 22px;
}

.scene-select:focus {
  outline: none;
  border-color: #ff4081;
}

.scene-select option {
  background: var(--surface);
  color: var(--fg);
}

.scene-preview {
  margin-top: 8px;
  padding: 6px 10px;
  background: var(--bg-deep);
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: var(--muted);
  line-height: 1.4;
  word-break: break-word;
  max-height: 48px;
  overflow-y: auto;
}

/* ── Translated preview ── */
.translated-preview {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 8px;
  padding: 6px 10px;
  background: rgba(0, 230, 118, 0.06);
  border: 1px solid rgba(0, 230, 118, 0.2);
  border-radius: var(--radius-sm);
  font-size: 11px;
  line-height: 1.4;
  word-break: break-word;
}
.translated-preview.error {
  background: rgba(255, 82, 82, 0.06);
  border-color: rgba(255, 82, 82, 0.25);
}
.tp-label {
  flex-shrink: 0;
  font-weight: 500;
  color: var(--success);
}
.translated-preview.error .tp-label {
  color: #ff5252;
}
.tp-text {
  color: var(--fg);
  flex: 1;
}
.tp-dismiss {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 12px;
  padding: 0 2px;
  flex-shrink: 0;
}
.tp-dismiss:hover {
  color: var(--fg);
}

.attach-btn {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.1s, color 0.1s;
  display: flex;
  align-items: center;
  font-size: 16px;
  line-height: 1;
}

.attach-btn:hover {
  background: var(--surface-2);
  color: var(--fg);
}

.attach-btn.active {
  color: #ff4081;
  background: rgba(255,64,129,0.12);
}

.attach-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.cache-indicator {
  font-size: 12px;
  color: var(--success);
  display: none;
}

.cache-indicator.visible {
  display: inline;
}

.send-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  white-space: nowrap;
}

.send-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Erotic presets ── */
.erotic-presets {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255,64,129,0.15);
  flex-wrap: wrap;
}

.erotic-preset-select {
  flex: 1;
  min-width: 70px;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--fg);
  font: inherit;
  font-size: 11px;
  padding: 3px 6px;
  cursor: pointer;
}

.erotic-preset-select:focus {
  outline: none;
  border-color: #ff4081;
}

.erotic-preset-select option {
  background: var(--surface);
  color: var(--fg);
}
</style>
