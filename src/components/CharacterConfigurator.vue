<template>
  <div class="creator-layout">
    <!-- ── Config Panel ── -->
    <div class="creator-config">
      <div class="cc-header">
        <h2>Creador de Personajes</h2>
        <p class="cc-subtitle">Configura la apariencia y genera un retrato con IA</p>
      </div>

      <div class="cc-sections">
        <div
          v-for="cat in categories"
          :key="cat.key"
          :class="['trait-category', { 'multi-cat': cat.multi }]"
        >
          <div class="cat-header" @click="toggleCollapse(cat.key)">
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-label">{{ cat.label }}</span>
            <span v-if="cat.multi" class="cat-count">{{ selections[cat.key].length }}</span>
            <svg
              :class="['chevron', { open: !collapsed[cat.key] }]"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
            ><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <Transition name="collapse">
            <div v-if="!collapsed[cat.key]" class="cat-options">
              <button
                v-for="opt in cat.options"
                :key="opt.id"
                :class="['trait-btn', {
                  active: isSelected(cat, opt),
                  multi: cat.multi,
                }]"
                @click="toggleTrait(cat, opt)"
                :title="opt.label"
              >
                <span v-if="cat.multi && isSelected(cat, opt)" class="check">✓</span>
                {{ opt.label }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- ── Preview / Result Panel ── -->
    <div class="creator-preview">
      <!-- Prompt -->
      <div class="prompt-box">
        <div class="pb-header">
          <span class="pb-label">Prompt generado</span>
          <button class="pb-copy" @click="copyPrompt" :title="copied ? '✓ Copiado' : 'Copiar'">
            <svg v-if="!copied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span v-else class="copied-text">✓</span>
          </button>
        </div>
        <p class="pb-text">{{ composedPrompt }}</p>
      </div>

      <!-- Model info -->
      <div class="model-bar">
        <span class="mb-model">🎯 recraft/recraft-v4.1-utility</span>
        <span class="mb-cost">~$0.040/img</span>
      </div>

      <!-- Actions -->
      <div class="action-row">
        <button class="btn btn-secondary" @click="randomize" :disabled="generating">
          🎲 Aleatorio
        </button>
        <button class="btn btn-primary" @click="generate" :disabled="generating || !composedPrompt.trim()">
          <span v-if="generating" class="spinner"></span>
          <span v-else>🎨 Generar Personaje</span>
        </button>
      </div>

      <!-- Buttons to insert into chat or view gallery -->
      <div v-if="result" class="result-actions">
        <button class="btn btn-ghost" @click="sendToChat">
          💬 Enviar al chat
        </button>
        <button class="btn btn-ghost" @click="openInGallery">
          🖼️ Abrir en galería
        </button>
      </div>

      <!-- Result image -->
      <div v-if="result" class="result-area">
        <!-- Error state -->
        <div v-if="result.error" class="error-box">
          <span class="error-icon">⚠️</span>
          <span>{{ result.error }}</span>
        </div>
        <template v-else>
          <div class="result-img-wrap" @click="previewResult">
            <img :src="result.imageUrl" alt="Generated character" class="result-img" />
            <div class="result-overlay">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
          </div>
          <div class="result-meta">
            <span class="rm-model">{{ result.model }}</span>
            <span class="rm-sep">·</span>
            <span :class="['rm-cost', { free: result.cached }]">
              {{ result.cached ? 'Caché' : `$${result.cost}` }}
            </span>
            <span class="rm-sep">·</span>
            <span class="rm-tokens">{{ result.tokens }} tokens</span>
          </div>
        </template>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-preview">
        <div class="ep-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <p class="ep-text">Selecciona rasgos y genera tu personaje</p>
        <p class="ep-hint">o haz click en <strong>Aleatorio</strong> para una combinación al azar</p>
      </div>
    </div>

    <!-- Full-size image modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="modalSrc" class="image-modal" @click.self="modalSrc = ''">
          <button class="modal-close" @click="modalSrc = ''">✕</button>
          <img :src="modalSrc" alt="Full character" class="modal-img" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { TRAIT_CATEGORIES, getDefaultSelections, composePrompt } from '../config/characterTraits.js'
import { useApi } from '../composables/useApi.js'
import { useCreditTracker } from '../composables/useCreditTracker.js'

const CHAR_MODEL_KEY = 'recraft-v41'

const api = useApi()
const credit = useCreditTracker()

// ── State ──

const selections = reactive(getDefaultSelections())
const generating = ref(false)
const result = ref(null)
const modalSrc = ref('')
const copied = ref(false)

// Collapse state per category
const collapsed = reactive(
  Object.fromEntries(TRAIT_CATEGORIES.map(c => [c.key, false]))
)

function toggleCollapse(key) {
  collapsed[key] = !collapsed[key]
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

// ── Computed ──

const categories = TRAIT_CATEGORIES

const composedPrompt = computed(() => composePrompt(selections))

// ── Randomize ──

function randomize() {
  for (const cat of TRAIT_CATEGORIES) {
    if (cat.multi) {
      // Pick 0-3 random special traits
      const shuffled = [...cat.options].sort(() => Math.random() - 0.5)
      const count = Math.floor(Math.random() * Math.min(4, cat.options.length + 1))
      selections[cat.key].splice(0, selections[cat.key].length, ...shuffled.slice(0, count))
    } else {
      const idx = Math.floor(Math.random() * cat.options.length)
      selections[cat.key] = cat.options[idx]
    }
  }
}

// ── Generate ──

async function generate() {
  if (generating.value) return
  generating.value = true
  result.value = null

  try {
    const prompt = composedPrompt.value
    // Force model to recraft-v4.1-utility
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

// ── Copy prompt ──

function copyPrompt() {
  navigator.clipboard.writeText(composedPrompt.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

// ── Preview ──

function previewResult() {
  if (result.value?.imageUrl) {
    modalSrc.value = result.value.imageUrl
  }
}

// ── Emits ──

const emit = defineEmits(['send-to-chat', 'open-gallery'])

function sendToChat() {
  if (result.value) {
    emit('send-to-chat', result.value)
  }
}

function openInGallery() {
  emit('open-gallery')
}
</script>

<style scoped>
.creator-layout {
  flex: 1;
  display: flex;
  min-height: 0;
  background: var(--bg-primary);
  position: relative;
}

/* Grid background */
.creator-layout::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0);
  background-size: 32px 32px;
  opacity: 0.2;
  pointer-events: none;
}

/* ── Config Panel ── */

.creator-config {
  width: 420px;
  min-width: 380px;
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.cc-header {
  margin-bottom: 4px;
}

.cc-header h2 {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.3px;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cc-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* ── Trait Categories ── */

.cc-sections {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.trait-category {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.cat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.cat-header:hover {
  background: var(--bg-tertiary);
}

.cat-icon {
  font-size: 14px;
  line-height: 1;
}

.cat-label {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.cat-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-bg);
  padding: 0 7px;
  border-radius: 6px;
  line-height: 18px;
  min-width: 20px;
  text-align: center;
}

.chevron {
  color: var(--text-muted);
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.cat-options {
  padding: 4px 12px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

/* ── Trait Buttons ── */

.trait-btn {
  font-family: inherit;
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.12s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.trait-btn:hover {
  border-color: var(--accent);
  color: var(--text-primary);
  background: var(--accent-bg);
}

.trait-btn.active {
  border-color: var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 600;
  box-shadow: 0 0 12px var(--accent-glow);
}

.trait-btn.multi.active {
  border-color: var(--green);
  background: var(--green-bg);
  color: var(--green);
  box-shadow: 0 0 12px var(--green-glow);
}

.check {
  font-size: 11px;
  font-weight: 700;
}

/* ── Preview / Result Panel ── */

.creator-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 28px;
  gap: 14px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  min-width: 0;
}

/* ── Prompt Box ── */

.prompt-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
}

.pb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pb-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-muted);
  font-weight: 600;
}

.pb-copy {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.15s;
}

.pb-copy:hover {
  color: var(--accent);
  background: var(--accent-bg);
}

.copied-text {
  color: var(--green);
  font-weight: 700;
}

.pb-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-secondary);
  word-break: break-word;
  white-space: pre-wrap;
}

/* ── Model Bar ── */

.model-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.mb-model {
  color: var(--accent);
  font-weight: 600;
  background: var(--accent-bg);
  padding: 2px 10px;
  border-radius: 5px;
}

.mb-cost {
  color: var(--green);
  font-weight: 500;
}

/* ── Actions ── */

.action-row {
  display: flex;
  gap: 8px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  border: none;
  white-space: nowrap;
}

.btn-primary {
  flex: 1;
  background: var(--gradient);
  color: #fff;
  box-shadow: 0 4px 20px var(--accent-glow);
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 6px 28px var(--accent-glow);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn-secondary {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
}

.btn-secondary:hover {
  border-color: var(--accent);
  background: var(--accent-bg);
  box-shadow: 0 0 16px var(--accent-glow);
}

.result-actions {
  display: flex;
  gap: 8px;
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 12px;
  padding: 7px 14px;
  font-weight: 500;
}

.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Result ── */

.result-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeIn 0.3s ease-out;
}

.error-box {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ff6b6b;
  font-size: 13px;
  line-height: 1.5;
  background: #2a1010;
  border: 1px solid #4a2020;
  border-radius: 10px;
  padding: 14px 18px;
}

.error-icon {
  font-size: 18px;
  flex-shrink: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-img-wrap {
  position: relative;
  max-width: 480px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 0.2s;
}

.result-img-wrap:hover {
  border-color: var(--accent);
}

.result-img {
  width: 100%;
  height: auto;
  display: block;
}

.result-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.result-overlay svg {
  color: #fff;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s;
}

.result-img-wrap:hover .result-overlay {
  background: rgba(0,0,0,0.35);
}

.result-img-wrap:hover .result-overlay svg {
  opacity: 1;
  transform: scale(1);
}

.result-meta {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  gap: 6px;
  align-items: center;
}

.rm-model {
  background: var(--bg-tertiary);
  padding: 1px 8px;
  border-radius: 4px;
  color: var(--text-secondary);
  font-weight: 500;
}

.rm-sep {
  color: var(--border-light);
}

.rm-cost {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.rm-cost.free {
  color: var(--green);
}

.rm-tokens {
  color: var(--text-muted);
}

/* ── Error state ── */

.result-area .error-text {
  color: #ff6b6b;
  font-size: 13px;
  background: #2a1010;
  border: 1px solid #4a2020;
  border-radius: 8px;
  padding: 12px 16px;
}

/* ── Empty state ── */

.empty-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-muted);
  text-align: center;
  padding: 40px;
}

.ep-icon {
  margin-bottom: 6px;
}

.ep-text {
  font-size: 15px;
  color: var(--text-secondary);
}

.ep-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.ep-hint strong {
  color: var(--accent);
}

/* ── Full image modal ── */

.image-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 24px;
  background: rgba(0,0,0,0.5);
  border: 1px solid var(--border-light);
  color: #fff;
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  font-family: inherit;
}

.modal-close:hover {
  background: rgba(255,50,50,0.3);
  border-color: #ff4444;
}

.modal-img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

/* ── Collapse transition ── */

.collapse-enter-active {
  transition: all 0.15s ease-out;
}

.collapse-leave-active {
  transition: all 0.1s ease-in;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* ── Fade transition (modal) ── */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Scrollbar ── */

.creator-config::-webkit-scrollbar,
.creator-preview::-webkit-scrollbar {
  width: 6px;
}

.creator-config::-webkit-scrollbar-track,
.creator-preview::-webkit-scrollbar-track {
  background: transparent;
}

.creator-config::-webkit-scrollbar-thumb,
.creator-preview::-webkit-scrollbar-thumb {
  background: var(--bg-elevated);
  border-radius: 3px;
}

.creator-config::-webkit-scrollbar-thumb:hover,
.creator-preview::-webkit-scrollbar-thumb:hover {
  background: var(--border-light);
}
</style>
