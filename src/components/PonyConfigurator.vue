<template>
  <div class="pony-layout">
    <!-- ── Config Panel ── -->
    <div class="pony-config">
      <div class="pony-header">
        <h2>Configurador Pony NSFW</h2>
        <span class="pony-model-badge">ponyDiffusionV6XL</span>
      </div>

      <div
        v-for="cat in categories"
        :key="cat.key"
        :class="['category', { open: !ponyState.collapsed[cat.key], multi: cat.multi }]"
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

    <!-- ── Output Panel ── -->
    <div class="pony-output">
      <div class="output-section">
        <div class="output-label">Tags Pony Diffusion:</div>
        <pre class="tag-output">{{ composedTags || 'Selecciona opciones arriba…' }}</pre>
      </div>

      <div class="output-section">
        <div class="output-label">Tags adicionales (raw Danbooru):</div>
        <textarea
          v-model="ponyState.extraTags"
          class="extra-tags-input"
          placeholder="Ej: (focus_on_breasts:1.1), from_side, solo_focus…"
          rows="2"
        ></textarea>
      </div>

      <div class="output-section">
        <div class="output-label">Prompt negativo:</div>
        <textarea
          v-model="ponyState.negativePrompt"
          class="extra-tags-input"
          placeholder="bad anatomy, ugly, distorted, low quality…"
          rows="2"
        ></textarea>
      </div>

      <!-- Image Input -->
      <div class="output-section">
        <div class="output-label">Imagen base (opcional, para edición):</div>
        <div class="image-upload-box" @click="triggerFileInput">
          <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" style="display: none;" />
          <div v-if="!uploadedImage" class="upload-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>Haz clic para subir una imagen</span>
          </div>
          <div v-else class="uploaded-image-container">
            <img :src="uploadedImage" class="uploaded-preview" />
            <button class="remove-image-btn" @click.stop="removeImage">✕</button>
          </div>
        </div>
        
        <div class="denoising-control" v-if="uploadedImage">
          <div class="denoising-header">
            <span>Fuerza de alteración (Denoising):</span>
            <span>{{ denoisingStrength.toFixed(2) }}</span>
          </div>
          <input type="range" v-model.number="denoisingStrength" min="0" max="1" step="0.05" />
          <div class="denoising-desc">
            <small>0 = Igual a la original | 1 = Imagen completamente nueva</small>
          </div>
        </div>
      </div>

      <div class="output-section">
        <div class="output-label">Tag final:</div>
        <pre class="tag-output final-tag">{{ finalTagString || '—' }}</pre>
        <div class="tag-actions">
          <button class="btn-primary" @click="copyTags" :disabled="!finalTagString.trim()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            {{ copied ? 'Copiado' : 'Copiar tags' }}
          </button>
          <button
            class="btn-generate"
            @click="generate"
            :disabled="generating || !finalTagString.trim()"
          >
            <span v-if="generating" class="spinner"></span>
            <span v-else>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Generar con Pony
            </span>
          </button>
          <button class="btn-secondary" @click="clearAll">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Limpiar
          </button>
        </div>
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
            alt="Pony generated"
            @click="previewModal"
          />
          <div class="char-result-actions">
            <span class="result-meta">{{ result.model }} · {{ result.params.steps }} steps · CFG {{ result.params.cfg }}</span>
            <button class="btn-secondary" @click="downloadResult">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Descargar
            </button>
          </div>
        </template>
      </div>

      <!-- Paràmetres enviats a SD WebUI (configuració via port 7860) -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePonyStore } from '../composables/usePonyStore.js'
import { composeTags, PONY_CATEGORIES } from '../config/ponyDiffusion.js'
import { useApi } from '../composables/useApi.js'

const { ponyState, clearAll: storeClearAll } = usePonyStore()
const api = useApi()
const copied = ref(false)
const generating = ref(false)
const result = ref(null)

const fileInput = ref(null)
const uploadedImage = ref(null)
const denoisingStrength = ref(0.7)

// ── State managed by usePonyStore (syncs to localStorage automatically)

function toggleCollapse(key) {
  ponyState.collapsed[key] = !ponyState.collapsed[key]
}

function getCount(cat) {
  if (!cat.multi) return 0
  return ponyState.selections[cat.key].length
}

function getSingleSelectionLabel(cat) {
  if (cat.multi) return ''
  return ponyState.selections[cat.key]?.label || ''
}

function isSelected(cat, opt) {
  if (cat.multi) return ponyState.selections[cat.key].some(s => s.id === opt.id)
  return ponyState.selections[cat.key]?.id === opt.id
}

function toggleTrait(cat, opt) {
  if (cat.multi) {
    const arr = ponyState.selections[cat.key]
    const idx = arr.findIndex(s => s.id === opt.id)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(opt)
  } else {
    ponyState.selections[cat.key] = opt
  }
}

const categories = PONY_CATEGORIES

const composedTags = computed(() => composeTags(ponyState.selections))

const finalTagString = computed(() => {
  const base = composedTags.value
  const extra = ponyState.extraTags.trim()
  if (!extra) return base
  return base ? `${base}, ${extra}` : extra
})

async function copyTags() {
  try {
    await navigator.clipboard.writeText(finalTagString.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = finalTagString.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}

async function generate() {
  if (generating.value) return
  generating.value = true
  result.value = null

  try {
    const neg = ponyState.negativePrompt.trim() || 'bad anatomy, ugly, distorted, low quality, worst quality'
    const sel = ponyState.selections

    // Defaults adaptats al context (SD WebUI gestiona la resta)
    const isPhotorealistic = sel.emphasis?.id === 'photorealistic'
    const isAnime = sel.emphasis?.id === 'anime'
    const hasAction = sel.action?.id !== 'none'

    const params = {
      cfg: isPhotorealistic ? 5 : isAnime ? 9 : (hasAction ? 7.5 : 7),
      steps: isPhotorealistic ? 25 : isAnime ? 38 : (hasAction ? 34 : 30),
      sampler: isPhotorealistic ? 'Euler a' : isAnime ? 'DPM++ 2M SDE Karras' : 'DPM++ 2M Karras',
      width: 1024,
      height: 1024,
    }

    if (uploadedImage.value) {
      params.denoising = denoisingStrength.value
    }

    const res = await api.ponyGenerate(finalTagString.value, neg, params, uploadedImage.value)
    result.value = res
  } catch (e) {
    result.value = { error: e.message }
  } finally {
    generating.value = false
  }
}

function previewModal() {
  if (result.value?.dataUrl) {
    window.openLightbox?.(result.value.dataUrl)
  }
}

function downloadResult() {
  if (!result.value?.dataUrl) return
  const a = document.createElement('a')
  a.href = result.value.dataUrl
  a.download = `pony_${Date.now()}.png`
  a.click()
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  uploadedImage.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function clearAll() {
  storeClearAll()
  result.value = null
  removeImage()
}
</script>

<style scoped>
.pony-layout {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  min-height: 0;
  background: var(--bg-deep);
}
.pony-config {
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
.pony-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pony-header h2 { font-size: 16px; font-weight: 600; color: var(--fg); }
.pony-model-badge {
  font-size: 10px;
  background: rgba(255, 82, 130, 0.15);
  color: #ff5282;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
}
.pony-config .category + .category { margin-top: 6px; }

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
.category-header:hover { background: var(--border); }
.category-header .count { color: var(--accent); font-size: 12px; }
.category-body {
  overflow: hidden; max-height: 0; padding: 0 14px;
  flex-wrap: wrap; gap: 6px;
  border-top: 1px solid var(--border);
  transition: max-height 0.25s ease, padding 0.25s ease;
  visibility: hidden;
}
.category.open .category-body {
  max-height: 600px; padding: 10px 14px; visibility: visible;
}

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
.tag-btn:hover { border-color: #ff5282; color: #ff5282; }
.tag-btn.selected {
  background: rgba(255, 82, 130, 0.12);
  border-color: #ff5282;
  color: #ff5282;
}

.pony-output {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}
.output-section { display: flex; flex-direction: column; gap: 8px; }
.output-label { font-size: 13px; font-weight: 500; color: var(--muted); }

.tag-output {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 18px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--fg);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 100px;
  overflow-y: auto;
  font-family: var(--font-mono, monospace);
  margin: 0;
}
.final-tag { max-height: none; min-height: 50px; }

.tag-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.extra-tags-input {
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  color: var(--fg);
  font: inherit;
  font-size: 13px;
  font-family: var(--font-mono, monospace);
  min-height: 50px;
  resize: vertical;
  outline: none;
  line-height: 1.5;
}
.extra-tags-input:focus { border-color: #ff5282; }
.extra-tags-input::placeholder { color: var(--muted); }

/* Result */
.char-result {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
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
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin: 0 auto;
  cursor: pointer;
  transition: border-color 0.2s;
}
.char-result img:hover { border-color: #ff5282; }

.char-result-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.result-meta {
  font-size: 11px;
  color: var(--muted);
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

/* Buttons */
.btn-primary {
  background: #ff5282; color: #fff; border: none;
  padding: 10px 24px; border-radius: var(--radius);
  font-weight: 500; cursor: pointer; transition: background 0.15s;
  font-size: 14px; font-family: inherit;
  display: flex; align-items: center; gap: 8px;
}
.btn-primary:hover:not(:disabled) { background: #ff6b94; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }

.btn-generate {
  background: #7c3aed; color: #fff; border: none;
  padding: 10px 24px; border-radius: var(--radius);
  font-weight: 500; cursor: pointer; transition: background 0.15s;
  font-size: 14px; font-family: inherit;
  display: flex; align-items: center; gap: 8px;
}
.btn-generate:hover:not(:disabled) { background: #8b5cf6; }
.btn-generate:disabled { opacity: 0.5; cursor: default; }

.btn-secondary {
  background: var(--surface-2); color: var(--fg);
  border: 1px solid var(--border);
  padding: 10px 20px; border-radius: var(--radius);
  font-weight: 500; cursor: pointer; transition: background 0.15s;
  font-size: 14px; font-family: inherit;
}
.btn-secondary:hover:not(:disabled) { background: var(--border); }

.spinner {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.pony-config::-webkit-scrollbar, .pony-output::-webkit-scrollbar { width: 6px; }
.pony-config::-webkit-scrollbar-track, .pony-output::-webkit-scrollbar-track { background: transparent; }
.pony-config::-webkit-scrollbar-thumb, .pony-output::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.image-upload-box {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  background: var(--surface-2);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  position: relative;
}
.image-upload-box:hover {
  border-color: #ff5282;
  background: rgba(255, 82, 130, 0.05);
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
  padding: 20px;
}
.uploaded-image-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}
.uploaded-preview {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}
.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}
.remove-image-btn:hover {
  background: #ff5252;
}

.denoising-control {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
  margin-top: 4px;
}
.denoising-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--fg);
  margin-bottom: 8px;
}
.denoising-control input[type=range] {
  width: 100%;
  accent-color: #ff5282;
}
.denoising-desc {
  margin-top: 4px;
  color: var(--muted);
  font-size: 11px;
}

@media (max-width: 900px) {
  .pony-config { flex: 1 1 100%; max-width: 100%; border-right: none; border-bottom: 1px solid var(--border); max-height: 50vh; }
  .pony-output { padding: 16px; }
}
</style>
