<template>
  <div class="input-area">
    <div class="cost-preview">
      <span class="cost-label">Coste estimado:</span>
      <span class="cost-value">${{ estimatedCost.toFixed(4) }}</span>
      <span v-if="hasCache" class="cache-badge">🆓 En caché</span>
      <span v-if="images.length" class="img-count">{{ images.length }} img adjunta{{ images.length > 1 ? 's' : '' }}</span>
    </div>

    <!-- Image previews -->
    <div v-if="images.length" class="image-previews">
      <div v-for="(img, i) in images" :key="i" class="preview-item">
        <img :src="img.dataUrl" alt="preview" />
        <button class="remove-img" @click="removeImage(i)" title="Quitar imagen">✕</button>
        <span class="img-size">{{ img.sizeKB }}KB</span>
      </div>
    </div>

    <div class="input-row">
      <button class="attach-btn" @click="openFilePicker" :disabled="disabled" title="Adjuntar imagen">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        hidden
        @change="handleFiles"
      />
      <textarea
        ref="textareaRef"
        v-model="text"
        placeholder="Describe la imagen que quieres generar..."
        rows="1"
        :disabled="disabled"
        @keydown.enter.exact.prevent="send"
        @input="autoResize"
      ></textarea>
      <button
        :disabled="disabled || (!text.trim() && !images.length)"
        @click="send"
      >
        <span v-if="disabled" class="spinner"></span>
        <span v-else>Generar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const MAX_IMG_DIM = 1024
const JPEG_QUALITY = 0.75

const props = defineProps({
  disabled: { type: Boolean, default: false },
  estimatedCost: { type: Number, default: 0 },
  modelKey: { type: String, default: 'flux-2-pro' }
})

const emit = defineEmits(['send'])

const text = ref('')
const textareaRef = ref(null)
const fileInputRef = ref(null)
const hasCache = ref(false)
const images = ref([])

function autoResize() {
  const el = textareaRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }
}

function openFilePicker() {
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
      // Resize if needed — keep aspect ratio
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
  for (const file of files) {
    if (file.size > 20 * 1024 * 1024) continue // skip >20MB
    const compressed = await compressImage(file)
    images.value.push(compressed)
  }
  // Reset input so same file can be re-selected
  fileInputRef.value.value = ''
  autoResize()
}

async function send() {
  const trimmed = text.value.trim()
  if ((!trimmed && !images.value.length) || props.disabled) return
  emit('send', { prompt: trimmed, images: images.value.map(i => i.dataUrl) })
  text.value = ''
  images.value = []
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

// Check cache as user types (debounced)
let debounceTimer = null
watch(text, (val) => {
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

// Reset cache check on model change
watch(() => props.modelKey, () => {
  hasCache.value = false
})

// Focus on mount
import { onMounted } from 'vue'
onMounted(() => textareaRef.value?.focus())
</script>

<style scoped>
.input-area {
  border-top: 1px solid var(--border);
  padding: 12px 20px 16px;
  background: var(--bg-secondary);
}

.cost-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}

.cost-label {
  color: var(--text-secondary);
}

.cost-value {
  color: var(--green);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.cache-badge {
  background: #1a3a1a;
  color: var(--green);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.img-count {
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
}

.image-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-img {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.remove-img:hover {
  background: rgba(200,50,50,0.9);
}

.img-size {
  position: absolute;
  bottom: 2px;
  left: 2px;
  font-size: 9px;
  color: #fff;
  background: rgba(0,0,0,0.6);
  padding: 1px 4px;
  border-radius: 3px;
}

.input-row {
  display: flex;
  gap: 8px;
}

.attach-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  width: 44px;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
}

.attach-btn:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent);
}

.attach-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

textarea {
  flex: 1;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  min-height: 44px;
  max-height: 160px;
  transition: border-color 0.15s;
}

textarea:focus {
  outline: none;
  border-color: var(--accent);
}

textarea:disabled {
  opacity: 0.6;
}

button {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
}

button:hover:not(:disabled) {
  background: var(--accent-hover);
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
