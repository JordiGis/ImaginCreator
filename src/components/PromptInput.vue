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

    <!-- Translated text preview -->
    <div v-if="translatedPreview" class="translated-preview">
      <span class="tp-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; margin-bottom: -2px;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        Traducido:
      </span>
      <span class="tp-text">{{ translatedPreview }}</span>
      <button class="tp-dismiss" @click="translatedPreview = ''">✕</button>
    </div>
    <div v-else-if="translateError" class="translated-preview error">
      <span class="tp-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; margin-bottom: -2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        Error traducción:
      </span>
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
            <button class="attach-btn" :class="{ active: translateEnabled }" @click="translateEnabled = !translateEnabled" :disabled="disabled" title="Traducir a inglés antes de generar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </button>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              hidden
              @change="handleFiles"
            />
            <span :class="['cache-indicator', { visible: hasCache }]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
        En caché
      </span>
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
import { getModel, MODELS } from '../config/models.js'

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
  emit('send', { prompt: finalPrompt, images: images.value.map(i => i.dataUrl) })
  text.value = ''
  images.value = []
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
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
  textareaRef.value?.focus()
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
</style>
