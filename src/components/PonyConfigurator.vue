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

    <!-- ── Output Panel ── -->
    <div class="pony-output">
      <div class="output-section">
        <div class="output-label">Tags Pony Diffusion:</div>
        <pre class="tag-output">{{ composedTags || 'Selecciona opciones arriba…' }}</pre>
      </div>

      <div class="output-section">
        <div class="output-label">Tags adicionales (raw Danbooru):</div>
        <textarea
          v-model="extraTags"
          class="extra-tags-input"
          placeholder="Ej: (focus_on_breasts:1.1), from_side, solo_focus…"
          rows="2"
        ></textarea>
      </div>

      <div class="output-section">
        <div class="output-label">Prompt negativo:</div>
        <textarea
          v-model="negativePrompt"
          class="extra-tags-input"
          placeholder="bad anatomy, ugly, distorted, low quality…"
          rows="2"
        ></textarea>
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

      <!-- Settings recommendations -->
      <div class="settings-panel">
        <div class="settings-header">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
            Ajustes para Draw Things
          </span>
          <span class="settings-hint">Adaptados a tu selección</span>
        </div>
        <div class="settings-grid">
          <div v-for="s in drawThingsSettings" :key="s.param" class="settings-card">
            <div class="settings-card-header">
              <span class="settings-icon">{{ s.icon }}</span>
              <span class="settings-param">{{ s.param }}</span>
            </div>
            <div class="settings-card-body">
              <template v-if="s.min != null && s.max != null">
                <div class="settings-range">
                  <span class="range-val">{{ s.min }}</span>
                  <div class="range-bar">
                    <div class="range-fill" :style="{ left: pct(s.min, s.max, s.recommended), width: '8px' }"></div>
                  </div>
                  <span class="range-val">{{ s.max }}</span>
                </div>
                <div class="settings-rec">Recomendado: <strong>{{ s.recommended }}</strong></div>
              </template>
              <template v-else-if="s.value != null">
                <div class="settings-rec"><strong>{{ s.value }}</strong></div>
              </template>
              <template v-else-if="s.options">
                <div class="settings-res-list">
                  <div v-for="(r, ri) in s.options" :key="ri" :class="['res-item', { active: ri === s.recommendedIdx }]">
                    <span class="res-label">{{ r.label }}</span>
                    <span v-if="ri === s.recommendedIdx" class="res-badge">★</span>
                  </div>
                </div>
              </template>
            </div>
            <div class="settings-card-note">{{ s.note }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { PONY_CATEGORIES, getDefaultSelections, composeTags, getDrawThingsSettings } from '../config/ponyDiffusion.js'
import { useApi } from '../composables/useApi.js'

const api = useApi()
const selections = reactive(getDefaultSelections())
const copied = ref(false)
const extraTags = ref('')
const negativePrompt = ref('')
const generating = ref(false)
const result = ref(null)

const collapsed = reactive(
  Object.fromEntries(PONY_CATEGORIES.map(c => [c.key, true]))
)

// ── Persistence ──
const STORAGE_KEY = 'imagin-creator-pony-config'

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
          selections[cat.key].splice(0, selections[cat.key].length, ...validOpts)
        } else {
          const opt = cat.options.find(o => o.id === savedVal)
          if (opt) selections[cat.key] = opt
        }
      }
    }
    if (saved.extraTags) extraTags.value = saved.extraTags
    if (saved.negativePrompt) negativePrompt.value = saved.negativePrompt
    if (saved.collapsed) {
      for (const key of Object.keys(collapsed)) {
        if (saved.collapsed[key] === false) collapsed[key] = false
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
        s[cat.key] = selections[cat.key].map(o => o.id)
      } else {
        s[cat.key] = selections[cat.key]?.id || null
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      selections: s,
      extraTags: extraTags.value,
      negativePrompt: negativePrompt.value,
      collapsed: { ...collapsed },
    }))
  } catch {}
}

watch([() => selections, extraTags, negativePrompt, () => collapsed], saveConfig, { deep: true })
loadSavedConfig()

function toggleCollapse(key) {
  collapsed[key] = !collapsed[key]
}

function getCount(cat) {
  if (!cat.multi) return 0
  return selections[cat.key].length
}

function isSelected(cat, opt) {
  if (cat.multi) return selections[cat.key].some(s => s.id === opt.id)
  return selections[cat.key]?.id === opt.id
}

function toggleTrait(cat, opt) {
  if (cat.multi) {
    const arr = selections[cat.key]
    const idx = arr.findIndex(s => s.id === opt.id)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(opt)
  } else {
    selections[cat.key] = opt
  }
}

const categories = PONY_CATEGORIES

const composedTags = computed(() => composeTags(selections))

const drawThingsSettings = computed(() => getDrawThingsSettings(selections))

const finalTagString = computed(() => {
  const base = composedTags.value
  const extra = extraTags.value.trim()
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
    const neg = negativePrompt.value.trim() || ''
    const settings = drawThingsSettings.value

    // Extract params from recommendations
    const cfgSetting = settings.find(s => s.param === 'Escala CFG')
    const stepsSetting = settings.find(s => s.param === 'Pasos')
    const samplerSetting = settings.find(s => s.param === 'Muestreador')
    const sizeSetting = settings.find(s => s.param === 'Tamaño')

    const params = {
      cfg: cfgSetting?.recommended || 7,
      steps: stepsSetting?.recommended || 30,
      sampler: samplerSetting?.value || 'DPM++ 2M Karras',
      width: sizeSetting?.options?.[sizeSetting.recommendedIdx]?.w || 1024,
      height: sizeSetting?.options?.[sizeSetting.recommendedIdx]?.h || 1024,
    }

    const res = await api.ponyGenerate(finalTagString.value, neg, params)
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

function clearAll() {
  const defaults = getDefaultSelections()
  for (const cat of PONY_CATEGORIES) {
    if (cat.multi) selections[cat.key].splice(0, selections[cat.key].length)
    else selections[cat.key] = defaults[cat.key]
  }
  extraTags.value = ''
  negativePrompt.value = ''
  result.value = null
}

function pct(min, max, val) {
  if (max === min) return '50%'
  return ((val - min) / (max - min)) * 100 + '%'
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

/* Settings */
.settings-panel {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg);
}
.settings-hint { font-size: 11px; color: var(--muted); font-weight: 400; }
.settings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.settings-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.settings-card-header {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; color: #ff5282;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.settings-icon { font-size: 13px; }
.settings-card-body { flex: 1; }
.settings-range { display: flex; align-items: center; gap: 8px; }
.range-val { font-size: 11px; color: var(--muted); min-width: 20px; text-align: center; }
.range-bar { flex: 1; height: 4px; background: var(--border); border-radius: 2px; position: relative; }
.range-fill { position: absolute; top: -2px; height: 8px; width: 8px; background: #ff5282; border-radius: 50%; transform: translateX(-50%); }
.settings-rec { font-size: 12px; color: var(--muted); margin-top: 6px; }
.settings-rec strong { color: var(--fg); }
.settings-res-list { display: flex; flex-direction: column; gap: 4px; }
.res-item { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--muted); padding: 2px 0; }
.res-item.active { color: var(--fg); font-weight: 500; }
.res-badge { color: #ff5282; font-size: 11px; }
.settings-card-note { font-size: 10px; line-height: 1.4; color: var(--muted); padding-top: 6px; border-top: 1px solid var(--border); }

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

@media (max-width: 900px) {
  .pony-config { flex: 1 1 100%; max-width: 100%; border-right: none; border-bottom: 1px solid var(--border); max-height: 50vh; }
  .pony-output { padding: 16px; }
}
</style>
