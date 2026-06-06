<template>
  <div class="pony-layout">
    <!-- ── Left: Controls ── -->
    <div class="pony-config">
      <div class="pony-header">
        <h2>Video Wan 2.1 I2V</h2>
        <span class="pony-model-badge">M4 Pro 24GB</span>
      </div>

      <!-- Image upload / preview -->
      <div class="section-block">
        <div class="section-label">Imagen de entrada (I2V)</div>
        <div
          class="image-upload-zone"
          :class="{ 'has-image': !!inputImage, dragging }"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="handleDrop"
          @click="fileInputRef?.click()"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept="image/png,image/jpeg"
            style="display:none"
            @change="handleFile"
          />
          <template v-if="inputImage">
            <img :src="inputImage" alt="Input" class="upload-preview" />
            <div class="image-overlay" @click.stop>
              <button class="btn-xs" @click.stop="changeImage">Cambiar</button>
              <button class="btn-xs btn-danger" @click.stop="inputImage = null">Quitar</button>
            </div>
          </template>
          <template v-else>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>Arrastra una imagen o haz clic para subir</span>
          </template>
        </div>
      </div>

      <!-- Positive prompt -->
      <div class="section-block">
        <div class="section-label">Prompt positivo</div>
        <textarea
          v-model="positivePrompt"
          class="styled-textarea"
          placeholder="Describe la escena del video… score_9, cinematic, slow motion, majestic pony running through enchanted forest…"
          rows="3"
        ></textarea>
      </div>

      <!-- Negative prompt -->
      <div class="section-block">
        <div class="section-label">Prompt negativo</div>
        <textarea
          v-model="negativePrompt"
          class="styled-textarea"
          placeholder="ugly, deformed, blurry, low quality, bad anatomy…"
          rows="2"
        ></textarea>
      </div>

      <!-- Advanced params -->
      <div class="section-block">
        <div class="section-label collapsible" @click="showAdvanced = !showAdvanced">
          Parámetros avanzados
          <span class="collapse-arrow">{{ showAdvanced ? '▼' : '▶' }}</span>
        </div>
        <div v-show="showAdvanced" class="advanced-params">
          <div class="param-row">
            <label>Seed</label>
            <input v-model.number="seed" type="number" class="param-input" placeholder="random" />
            <button class="btn-xs" @click="seed = null">Aleatorio</button>
          </div>
          <div class="param-row">
            <label>Steps</label>
            <input v-model.number="steps" type="range" min="10" max="60" class="param-slider" />
            <span class="param-value">{{ steps }}</span>
          </div>
          <div class="param-row">
            <label>CFG</label>
            <input v-model.number="cfg" type="range" min="1" max="15" step="0.5" class="param-slider" />
            <span class="param-value">{{ cfg }}</span>
          </div>
          <div class="param-row">
            <label>Frames</label>
            <input v-model.number="numFrames" type="number" min="1" max="161" step="4" class="param-input param-input-short" />
            <span class="param-hint">(81 ≈ 5s @16fps)</span>
          </div>
          <div class="param-row">
            <label>Resolución</label>
            <span class="param-fixed">832×480 (480P)</span>
          </div>
        </div>
      </div>

      <!-- Generate button (mobile: also here) -->
      <button
        class="btn-generate-mobile"
        @click="generate"
        :disabled="generating || !inputImage || !positivePrompt.trim()"
        v-if="windowWidth < 700"
      >
        <span v-if="generating" class="spinner"></span>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        {{ generating ? 'Generando…' : 'Generar video' }}
      </button>
    </div>

    <!-- ── Right: Output ── -->
    <div class="pony-output">
      <!-- Generate button -->
      <button
        class="btn-generate-video"
        @click="generate"
        :disabled="generating || !inputImage || !positivePrompt.trim()"
      >
        <span v-if="generating" class="spinner"></span>
        <span v-else>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; margin-bottom:-2px"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </span>
        {{ generating ? `Generando… ${elapsed}s` : 'Generar video' }}
      </button>

      <!-- Empty state -->
      <div v-if="!generating && !result && !error" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
        <h3>Wan 2.1 Image-to-Video</h3>
        <p>Sube una imagen, escribe un prompt y genera un video de ~5s con la escena que describes. El modelo anima tu imagen siguiendo el prompt.</p>
        <div class="empty-info">
          <div class="info-chip"><span class="chip-dot" style="background:#7c3aed"></span>14B FP8</div>
          <div class="info-chip"><span class="chip-dot" style="background:#22c55e"></span>81 frames</div>
          <div class="info-chip"><span class="chip-dot" style="background:#f59e0b"></span>~3-6 min</div>
          <div class="info-chip"><span class="chip-dot" style="background:#ff5282"></span>MPS Accelerated</div>
        </div>
      </div>

      <!-- Progress / loading -->
      <div v-if="generating" class="progress-section">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <div class="progress-status">
          <span>{{ statusMessage }}</span>
        </div>
        <p class="progress-hint">M4 Pro 24GB genera ~2-6 min. Esto corre local en tu máquina.</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="error-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;margin-bottom:-2px;flex-shrink:0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>{{ error }}</span>
      </div>

      <!-- Result: video player -->
      <div v-if="result && !generating" class="result-section">
        <div v-if="result.mp4_ready && result.video_url" class="video-container">
          <video
            ref="videoRef"
            :src="result.video_url"
            controls
            autoplay
            loop
            muted
            playsinline
            class="video-player"
          ></video>
        </div>

        <div v-else-if="result.video_url" class="frame-preview">
          <img :src="result.video_url" alt="First frame" class="frame-image" />
          <p class="frame-hint">MP4 no disponible (ffmpeg no instalado). {{ result.total_frames }} frames generados.</p>
        </div>

        <div v-else class="no-video">
          <p>Video generado, pero no se pudo obtener el resultado.</p>
        </div>

        <!-- Result metadata + download -->
        <div class="result-actions">
          <div class="result-meta">
            <span>{{ result.total_frames || '?' }} frames</span>
            <span v-if="seed != null">· seed {{ seed }}</span>
            <span>· {{ steps }} steps · CFG {{ cfg }}</span>
          </div>
          <div class="result-buttons">
            <button v-if="result.mp4_ready && result.video_url" class="btn-primary" @click="downloadVideo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Descargar MP4
            </button>
            <button class="btn-secondary" @click="resetAll">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              Nueva generación
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useApi } from '../composables/useApi.js'

const api = useApi()

// ── State ──
const inputImage = ref(null)
const fileInputRef = ref(null)
const positivePrompt = ref('')
const negativePrompt = ref('')
const seed = ref(null)
const steps = ref(30)
const cfg = ref(6.0)
const numFrames = ref(81)
const showAdvanced = ref(false)
const dragging = ref(false)
const windowWidth = ref(window.innerWidth)

const generating = ref(false)
const result = ref(null)
const error = ref(null)
const elapsed = ref(0)
const progressPct = ref(0)
const statusMessage = ref('Preparando…')
const videoRef = ref(null)

let pollTimer = null
let elapsedTimer = null
let currentPromptId = null

// ── Responsive ──
const resizeHandler = () => { windowWidth.value = window.innerWidth }
window.addEventListener('resize', resizeHandler)
onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
  stopPolling()
})

// ── Image handling ──
function handleFile(e) {
  const file = e.target.files[0]
  if (!file) return
  loadFile(file)
}

function handleDrop(e) {
  dragging.value = false
  const file = e.dataTransfer.files[0]
  if (!file || !/^image\/(png|jpeg)/.test(file.type)) return
  loadFile(file)
}

function loadFile(file) {
  const reader = new FileReader()
  reader.onload = (e) => { inputImage.value = e.target.result }
  reader.readAsDataURL(file)
}

function changeImage() {
  fileInputRef.value?.click()
}

// ── Generate ──
async function generate() {
  if (generating.value || !inputImage.value || !positivePrompt.value.trim()) return

  generating.value = true
  result.value = null
  error.value = null
  elapsed.value = 0
  progressPct.value = 5
  statusMessage.value = 'Encolando en ComfyUI…'

  // Start elapsed timer
  elapsedTimer = setInterval(() => { elapsed.value++ }, 1000)

  // Time-based progress simulation (gives user feedback while ComfyUI works)
  let progressPhase = 0
  const progressInterval = setInterval(() => {
    progressPhase++
    if (progressPhase < 5) {
      statusMessage.value = 'Cargando modelos (VAE + T5 + CLIP)…'
      progressPct.value = 10
    } else if (progressPhase < 15) {
      statusMessage.value = 'Procesando imagen + texto…'
      progressPct.value = 15 + ((progressPhase - 5) / 10) * 15
    } else {
      statusMessage.value = `Generando frames (${steps.value} steps × ${numFrames.value} frames)…`
      const additional = ((progressPhase - 15) / 60) * 55
      progressPct.value = Math.min(30 + additional, 85)
    }
  }, 2000)

  try {
    // 1. Queue generation
    const queueRes = await api.videoGenerate(inputImage.value, positivePrompt.value, {
      negative_prompt: negativePrompt.value,
      seed: seed.value,
      steps: steps.value,
      cfg: cfg.value,
      num_frames: numFrames.value
    })

    currentPromptId = queueRes.prompt_id
    statusMessage.value = 'Generando…'
    progressPct.value = 10

    // 2. Poll for completion
    const pollResult = await pollUntilComplete(currentPromptId, (pct, msg) => {
      progressPct.value = Math.max(progressPct.value, pct)
      if (msg) statusMessage.value = msg
    })

    clearInterval(progressInterval)
    progressPct.value = 100
    statusMessage.value = '¡Video generado!'

    // Small delay to show 100%
    await new Promise(r => setTimeout(r, 500))

    result.value = pollResult
  } catch (e) {
    clearInterval(progressInterval)
    error.value = e.message || 'Error desconocido'
  } finally {
    generating.value = false
    clearInterval(elapsedTimer)
    elapsedTimer = null
    stopPolling()
  }
}

function pollUntilComplete(promptId, onProgress) {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const maxAttempts = 180 // 15 min @ 5s

    function poll() {
      attempts++
      api.checkVideoStatus(promptId)
        .then(data => {
          if (data.status === 'completed') {
            resolve(data)
          } else if (data.status === 'failed') {
            reject(new Error(data.error || 'Generación fallida'))
          } else if (data.status === 'processing') {
            const pct = 15 + (attempts / maxAttempts) * 70
            onProgress(pct, `Procesando… paso ${attempts}`)
            pollTimer = setTimeout(poll, 5000)
          } else {
            // queued
            onProgress(8, 'En cola…')
            pollTimer = setTimeout(poll, 3000)
          }
        })
        .catch(err => {
          if (attempts < 5) {
            pollTimer = setTimeout(poll, 3000)
          } else {
            reject(new Error(`Error de conexión con ComfyUI: ${err.message}`))
          }
        })
    }

    poll()
  })
}

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

// ── Actions ──
function downloadVideo() {
  if (!result.value?.video_url) return
  const a = document.createElement('a')
  a.href = result.value.video_url
  a.download = `wan_video_${Date.now()}.mp4`
  a.click()
}

function resetAll() {
  result.value = null
  error.value = null
  progressPct.value = 0
  generating.value = false
  currentPromptId = null
  stopPolling()
}
</script>

<style scoped>
/* Reuse pony-layout base styles (flex two-column) */
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
  background: rgba(124, 58, 237, 0.15);
  color: #9b7ef0;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
}

/* Sections */
.section-block {
  margin-bottom: 14px;
}
.section-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  margin-bottom: 6px;
}
.section-label.collapsible {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}
.collapse-arrow { font-size: 10px; color: var(--muted); }

/* Image upload */
.image-upload-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
  position: relative;
  min-height: 120px;
  justify-content: center;
}
.image-upload-zone:hover { border-color: #7c3aed; }
.image-upload-zone.dragging { border-color: #7c3aed; background: rgba(124,58,237,0.05); }
.image-upload-zone.has-image { padding: 4px; min-height: auto; }
.upload-preview {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
  border-radius: 6px;
}
.image-overlay {
  position: absolute;
  top: 6px; right: 6px;
  display: flex;
  gap: 4px;
}

/* Textarea */
.styled-textarea {
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  color: var(--fg);
  font: inherit;
  font-size: 13px;
  font-family: var(--font-mono, monospace);
  resize: vertical;
  outline: none;
  line-height: 1.5;
  box-sizing: border-box;
}
.styled-textarea:focus { border-color: #7c3aed; }
.styled-textarea::placeholder { color: var(--muted); }

/* Advanced params */
.advanced-params {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
}
.param-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.param-row label {
  font-size: 12px;
  color: var(--muted);
  min-width: 50px;
  flex-shrink: 0;
}
.param-input {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 8px;
  color: var(--fg);
  font-size: 13px;
  width: 120px;
  font-family: inherit;
  outline: none;
}
.param-input:focus { border-color: #7c3aed; }
.param-input-short { width: 70px; }
.param-slider {
  flex: 1;
  max-width: 120px;
  accent-color: #7c3aed;
}
.param-value { font-family: var(--font-mono, monospace); font-size: 13px; min-width: 24px; color: var(--fg); }
.param-fixed { font-size: 13px; color: var(--fg); font-family: var(--font-mono, monospace); }
.param-hint { font-size: 11px; color: var(--muted); white-space: nowrap; }

/* Buttons */
.btn-xs {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 11px;
  color: var(--fg);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}
.btn-xs:hover { background: var(--border); }
.btn-danger { color: #ff5252; border-color: #4a2020; }
.btn-danger:hover { background: #2a1010; }

/* ── Output panel ── */
.pony-output {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.btn-generate-video {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  border: none;
  padding: 14px 32px;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
}
.btn-generate-video:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(124,58,237,0.35); }
.btn-generate-video:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-generate-mobile { display: none; }
@media (max-width: 700px) {
  .btn-generate-mobile {
    display: flex;
    width: 100%;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: #fff;
    border: none;
    padding: 12px 24px;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .btn-generate-mobile:disabled { opacity: 0.5; }
  .btn-generate-video { display: none; }
}

/* Empty state */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--muted);
  text-align: center;
  padding: 40px 20px;
}
.empty-state h3 { font-size: 18px; font-weight: 500; color: var(--fg); margin: 0; }
.empty-state p { font-size: 14px; line-height: 1.6; max-width: 420px; }
.empty-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 6px;
}
.info-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 999px;
  color: var(--muted);
}
.chip-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

/* Progress */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: var(--surface-2);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.progress-bar-track {
  height: 8px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border-radius: 999px;
  transition: width 0.5s ease;
}
.progress-status {
  font-size: 14px;
  font-weight: 500;
  color: var(--fg);
  text-align: center;
}
.progress-hint {
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  margin: 0;
}

/* Error */
.error-box {
  display: flex;
  gap: 8px;
  color: #ffcc00;
  font-size: 13px;
  background: #2a2510;
  border: 1px solid #4a4020;
  border-radius: var(--radius);
  padding: 14px 18px;
  text-align: left;
  align-items: flex-start;
}

/* Result */
.result-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.video-container {
  background: #000;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
}
.video-player {
  width: 100%;
  max-height: 480px;
  display: block;
  background: #000;
}
.frame-preview {
  text-align: center;
}
.frame-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.frame-hint {
  font-size: 12px;
  color: var(--muted);
  margin-top: 8px;
}
.no-video {
  color: var(--muted);
  text-align: center;
  padding: 20px;
}

/* Result actions */
.result-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.result-meta {
  font-size: 12px;
  color: var(--muted);
  font-family: var(--font-mono, monospace);
}
.result-buttons {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background: #7c3aed; color: #fff; border: none;
  padding: 10px 24px; border-radius: var(--radius);
  font-weight: 500; cursor: pointer; transition: background 0.15s;
  font-size: 14px; font-family: inherit;
  display: flex; align-items: center; gap: 8px;
}
.btn-primary:hover:not(:disabled) { background: #8b5cf6; }

.btn-secondary {
  background: var(--surface-2); color: var(--fg);
  border: 1px solid var(--border);
  padding: 10px 20px; border-radius: var(--radius);
  font-weight: 500; cursor: pointer; transition: background 0.15s;
  font-size: 14px; font-family: inherit;
  display: flex; align-items: center;
}
.btn-secondary:hover:not(:disabled) { background: var(--border); }

.spinner {
  display: inline-block; width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.pony-config::-webkit-scrollbar, .pony-output::-webkit-scrollbar { width: 6px; }
.pony-config::-webkit-scrollbar-track, .pony-output::-webkit-scrollbar-track { background: transparent; }
.pony-config::-webkit-scrollbar-thumb, .pony-output::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

@media (max-width: 900px) {
  .pony-config { flex: 1 1 100%; max-width: 100%; border-right: none; border-bottom: 1px solid var(--border); max-height: 50vh; }
  .pony-output { padding: 16px; }
}
</style>
