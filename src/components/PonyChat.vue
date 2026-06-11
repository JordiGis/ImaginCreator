<template>
  <div class="pony-chat-layout">
    <!-- ── Project tabs ── -->
    <div class="pony-project-tabs">
      <button
        v-for="(p, i) in projects"
        :key="p.id"
        :class="['pony-project-tab', { active: i === currentProjectIdx }]"
        @click="switchProject(i)"
        :title="p.name"
      >
        <span class="pony-project-tab-name">{{ p.name || 'Sin nombre' }}</span>
        <span
          v-if="projects.length > 1"
          class="pony-project-tab-close"
          @click.stop="deleteProjectAt(i)"
          title="Eliminar proyecto"
        >&times;</span>
      </button>
      <button class="pony-project-tab-add" @click="newProject" title="Nuevo proyecto">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
    </div>

    <!-- ── Chat Messages ── -->
    <div class="pony-chat-messages" ref="chatRef">
      <!-- Empty state -->
      <div v-if="!messages.length" class="pony-chat-empty">
        <span class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"></path><path d="M9 21h6"></path><path d="M12 19v2"></path></svg>
        </span>
        <h3>Asistente de tags Pony</h3>
        <p>Pregúntame qué tags usar para tu escena NSFW.<br>Ej: <em>"chica pelirroja sumisa, atada, en un sótano"</em></p>
        <div class="suggested-prompts">
          <button v-for="s in suggestions" :key="s" class="suggestion-chip" @click="sendMessage(s)">
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Current tags summary (visible once there's activity) -->
      <div v-if="messages.length" class="pony-tag-summary">
        <div class="pony-tag-summary-header" @click="showTagSummary = !showTagSummary">
          <div class="pony-tag-summary-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Tags configurades
          </div>
          <div class="pony-tag-summary-meta">
            <button class="btn-clear-tags" @click.stop="clearAll" title="Limpiar tags actuales">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <span class="tag-count-badge">{{ activeCategoryCount }} cat.</span>
            <span class="collapse-icon">{{ showTagSummary ? '▼' : '▶' }}</span>
          </div>
        </div>
        <div v-if="showTagSummary" class="pony-tag-summary-body">
          <pre class="pony-tag-preview">{{ currentTagString || '—' }}</pre>
          <div v-if="ponyState.negativePrompt" class="pony-neg-row">
            <span class="neg-label">NEG:</span>
            <span class="neg-text">{{ ponyState.negativePrompt }}</span>
          </div>
        </div>
      </div>

      <!-- Typing indicator (shown before messages exist or between them) -->
      <div v-if="loading && !messages.length" class="pony-msg assistant">
        <div class="pony-msg-bubble">
          <div class="pony-typing">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </div>

      <!-- Message list -->
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['pony-msg', msg.role]"
      >
        <div class="pony-msg-bubble">
          <!-- User image attachments -->
          <div v-if="msg.images?.length" class="pony-msg-attachments">
            <img
              v-for="(img, j) in msg.images"
              :key="j"
              :src="img"
              class="pony-msg-attach-img"
              @click="previewImage(img)"
            />
          </div>
          <!-- Image result -->
          <div v-if="msg.imageUrl" class="pony-msg-image">
            <img :src="msg.imageUrl" @click="previewImage(msg.imageUrl)" />
            <div v-if="msg.meta" class="pony-msg-image-meta">{{ msg.meta }}</div>
          </div>
          <!-- Text message -->
          <div v-if="msg.content" class="pony-msg-text">{{ msg.content }}</div>
        </div>
      </div>

      <!-- Inline typing indicator (after first message) -->
      <div v-if="loading && messages.length" class="pony-msg assistant">
        <div class="pony-msg-bubble">
          <div class="pony-typing">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Input ── -->
    <div class="pony-chat-input">
      <div class="pony-chat-input-area">
        <!-- Image attachment previews -->
        <div v-if="attachedImages.length" class="pony-attach-previews">
          <div
            v-for="(img, i) in attachedImages"
            :key="i"
            class="pony-attach-thumb"
          >
            <img :src="img.dataUrl" :alt="img.name" />
            <button class="pony-attach-remove" @click="removeImage(i)">&times;</button>
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          class="pony-file-input"
          @change="handleFileSelect"
        />
        <textarea
          v-model="inputText"
          class="pony-chat-textarea"
          placeholder="Describe tu escena en español… Ej: dos chicas en una ducha, una arrodillada…"
          rows="2"
          @keydown.enter.prevent="handleEnter"
          :disabled="loading || generating"
        ></textarea>
      </div>
      <div class="pony-chat-buttons">
        <button
          class="btn-attach"
          @click="triggerFilePicker"
          :disabled="loading || generating || attachedImages.length >= MAX_IMAGES"
          title="Adjuntar imagen de referencia"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </button>
        <button
          class="btn-generate"
          @click="generate"
          :disabled="generating || !currentTagString"
          title="Generar imagen con los tags actuales"
        >
          <span v-if="generating" class="spinner"></span>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <span class="btn-label">Generar</span>
        </button>
        <button
          class="btn-scene"
          @click="generateScene"
          :disabled="generating || loading || !messages.length"
          title="Generar imagen representativa de la escena actual"
        >
          <span v-if="generating" class="spinner"></span>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          <span class="btn-label">Escena</span>
        </button>
        <button class="btn-send" @click="sendMessage" :disabled="loading || generating || !inputText.trim()">
          <span v-if="loading" class="spinner"></span>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          <span class="btn-label">Enviar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.js'
import { usePonyStore } from '../composables/usePonyStore.js'
import { composeTags, PONY_CATEGORIES } from '../config/ponyDiffusion.js'

const api = useApi()
const route = useRoute()
const router = useRouter()
const {
  ponyState, getConfigContext, getCurrentTagString, applyAiResponse, applyTextToConfig, clearAll,
  projects, createProject, saveProjectState, loadProjectState, deleteProject,
} = usePonyStore()

const inputText = ref('')
const messages = ref([])
const loading = ref(false)
const generating = ref(false)
const showTagSummary = ref(true)
const chatRef = ref(null)
const currentProjectIdx = ref(0)

// ── Init: restore last project or create first one ──

onMounted(() => {
  const projectId = route.params.projectId
  if (projectId) {
    const idx = projects.findIndex(p => p.id === projectId)
    if (idx >= 0) {
      currentProjectIdx.value = idx
      const msgs = loadProjectState(projectId)
      if (msgs) messages.value = msgs
      return
    }
  }
  // Fallback: last project or create new
  if (projects.length) {
    currentProjectIdx.value = projects.length - 1
    const last = projects[currentProjectIdx.value]
    const msgs = loadProjectState(last.id)
    if (msgs) messages.value = msgs
  } else {
    createProject()
    currentProjectIdx.value = 0
  }
  syncUrlWithProject()
})

// Sync URL when route param changes (browser back/forward)
watch(() => route.params.projectId, (newId, oldId) => {
  if (!newId || newId === oldId) return
  const idx = projects.findIndex(p => p.id === newId)
  if (idx < 0 || idx === currentProjectIdx.value) return
  saveCurrentProject()
  currentProjectIdx.value = idx
  const msgs = loadProjectState(newId)
  messages.value = msgs || []
  showTagSummary.value = true
  inputText.value = ''
  attachedImages.value = []
  scrollBottom()
})

// Save on page close
window.addEventListener('beforeunload', saveCurrentProject)

// ── Image attachments ──
const attachedImages = ref([])
const fileInput = ref(null)
const MAX_IMAGES = 4

const suggestions = [
  'chica sumisa atada a una cama, vendada, con expresión de miedo y excitación',
  'hombre musculoso desnudo en la ducha, agua cayendo, plano detalle pectorales',
  'dos chicas en la cama, 69, una con medias de red y la otra con tanga',
  'futanari dominante con correa, sumisa a cuatro patas, ambiente mazmorra',
]

// ── Reactive tag display ──

const currentTagString = computed(() => getCurrentTagString())

const activeCategoryCount = computed(() => {
  let count = 0
  for (const cat of PONY_CATEGORIES) {
    const val = ponyState.selections[cat.key]
    if (cat.multi) {
      if (val?.length) count++
    } else if (val && val.id !== 'none') {
      count++
    }
  }
  return count
})

// ── Image attachment helpers ──

function triggerFilePicker() {
  fileInput.value?.click()
}

function handleFileSelect(e) {
  const files = e.target.files
  if (!files?.length) return
  const remaining = MAX_IMAGES - attachedImages.value.length
  const toProcess = Array.from(files).slice(0, remaining)
  for (const file of toProcess) {
    if (!file.type.startsWith('image/')) continue
    compressImage(file, 1024, 0.75).then(dataUrl => {
      attachedImages.value.push({ dataUrl, name: file.name })
    })
  }
  e.target.value = ''
}

function removeImage(idx) {
  attachedImages.value.splice(idx, 1)
}

function compressImage(file, maxDim, quality) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = url
  })
}

// ── Helpers ──

function scrollBottom() {
  nextTick(() => {
    if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
  })
}

function syncUrlWithProject() {
  const p = projects[currentProjectIdx.value]
  if (p) {
    router.replace({ name: 'PonyChatProject', params: { projectId: p.id } })
  } else {
    router.replace({ name: 'PonyChat' })
  }
}

// ── Projects ──

function saveCurrentProject() {
  const idx = currentProjectIdx.value
  const p = projects[idx]
  if (!p) return
  // Auto-name from first user message
  if (!p.name.startsWith('Proyecto') && p.name) {
    // custom name, keep it
  } else {
    const firstUser = messages.value.find(m => m.role === 'user')
    p.name = firstUser
      ? firstUser.content.slice(0, 40) + (firstUser.content.length > 40 ? '…' : '')
      : `Proyecto ${idx + 1}`
  }
  saveProjectState(p.id, messages.value)
}

function switchProject(idx) {
  if (idx === currentProjectIdx.value || idx < 0 || idx >= projects.length) return
  // Save current
  saveCurrentProject()
  // Switch
  currentProjectIdx.value = idx
  const p = projects[idx]
  const msgs = loadProjectState(p.id)
  messages.value = msgs || []
  showTagSummary.value = true
  inputText.value = ''
  attachedImages.value = []
  syncUrlWithProject()
  scrollBottom()
}

function deleteProjectAt(idx) {
  if (projects.length <= 1) {
    // Can't delete last — reset instead
    clearAll()
    messages.value = []
    showTagSummary.value = true
    inputText.value = ''
    attachedImages.value = []
    scrollBottom()
    return
  }
  const p = projects[idx]
  if (!p) return
  const wasCurrent = idx === currentProjectIdx.value
  deleteProject(p.id)
  // Adjust currentProjectIdx if needed
  if (wasCurrent) {
    const target = Math.min(idx, projects.length - 1)
    currentProjectIdx.value = target
    const next = projects[target]
    const msgs = loadProjectState(next.id)
    messages.value = msgs || []
  } else if (idx < currentProjectIdx.value) {
    currentProjectIdx.value--
  }
  showTagSummary.value = true
  inputText.value = ''
  attachedImages.value = []
  syncUrlWithProject()
  scrollBottom()
}

// ── New project — save current, create blank tab ──

function newProject() {
  saveCurrentProject()
  createProject()
  currentProjectIdx.value = projects.length - 1
  clearAll()
  messages.value = []
  showTagSummary.value = true
  inputText.value = ''
  attachedImages.value = []
  syncUrlWithProject()
  scrollBottom()
}

// ── Send message → local tag matching + optional DeepSeek + auto-gen ──

async function sendMessage(text) {
  const msg = (text || inputText.value).trim()
  if (!msg || loading.value || generating.value) return

  const userMsg = { role: 'user', content: msg }
  const imgs = attachedImages.value.slice()
  if (imgs.length) {
    userMsg.images = imgs.map(i => i.dataUrl)
  }
  messages.value.push(userMsg)
  inputText.value = ''
  attachedImages.value = []

  // STEP 1: Local keyword matching → immediate config update
  const localResult = applyTextToConfig(msg)
  const tagLines = localResult.changes.map(c => `• ${c.label}: ${c.option}`)

  scrollBottom()

  // STEP 2: AI tag refinement (independent from gen)
  let aiResult = null
  let aiError = null
  if (api.ponyChat) {
    loading.value = true
    try {
      const configContext = getConfigContext()
      const curTags = getCurrentTagString()
      const res = await api.ponyChat(
        messages.value.map(m => {
          if (m.role === 'user' && m.images?.length) {
            return {
              role: m.role,
              content: m.content + `\n\n[El usuario adjuntó ${m.images.length} imagen(es) de referencia — tenlas en cuenta para escena, composición, pose y estilo al generar los tags]`
            }
          }
          return { role: m.role, content: m.content }
        }),
        { configContext, currentTags: curTags }
      )
      const summary = applyAiResponse(res.text)
      aiResult = { text: res.text, summary }
    } catch (e) {
      aiError = e
      console.warn('AI chat failed, proceeding with local tags:', e.message)
    } finally {
      loading.value = false
    }
  }

  // STEP 3: Build display text
  let displayText = ''
  if (aiResult) {
    displayText = aiResult.text
    const summary = aiResult.summary
    const aiChanges = []
    if (summary.changed.length) aiChanges.push(`${summary.changed.length} categoría(s) actualizada(s)`)
    if (summary.rawTagsAdded.length) aiChanges.push(`${summary.rawTagsAdded.length} raw tag(s) añadida(s)`)
    if (summary.negativePromptChanged) aiChanges.push('negative prompt actualizado')
    if (aiChanges.length) displayText += `\n\n✅ IA aplicó cambios: ${aiChanges.join(', ')}.`
    if (localResult.changes.length && aiChanges.length === 0) {
      displayText += `\n\n📌 Tags por palabras clave: ${localResult.changes.map(c => c.option).join(', ')}`
    }
  } else if (tagLines.length) {
    displayText = `✅ Tags aplicadas al configurador:\n${tagLines.join('\n')}`
    if (aiError) {
      displayText += `\n\n⚠️ IA no disponible (${aiError.message}), imagen generada con tags locales.`
    } else {
      displayText += '\n\nRevisa el configurador y pulsa "Generar" cuando estés listo.'
    }
  } else {
    displayText = aiError
      ? `Error AI: ${aiError.message}`
      : 'No se detectaron tags en tu mensaje. Prueba a describir: "chica pelirroja desnuda en la ducha" o "sumisa atada a la cama".'
  }

  // STEP 4: Auto-generate image (always try if tags exist)
  const curTagString = getCurrentTagString()
  if (curTagString) {
    generating.value = true
    try {
      const neg = ponyState.negativePrompt.trim() || 'bad anatomy, ugly, distorted, low quality, worst quality'
      const sel = ponyState.selections
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

      const genRes = await api.ponyGenerate(curTagString, neg, params, imgs.map(i => i.dataUrl))

      messages.value.push({
        role: 'assistant',
        content: displayText,
        imageUrl: genRes.dataUrl || genRes.imageUrl,
        meta: `${genRes.model} · ${genRes.params.steps} steps · CFG ${genRes.params.cfg}`
      })
    } catch (e) {
      messages.value.push({
        role: 'assistant',
        content: `${displayText}\n\nError generando: ${e.message}`
      })
    } finally {
      generating.value = false
    }
  } else if (displayText) {
    messages.value.push({ role: 'assistant', content: displayText })
  }

  scrollBottom()
  saveCurrentProject()
}

function handleEnter(e) {
  if (e.shiftKey) return
  sendMessage()
}

// ── Generate image from current tags ──

async function generate() {
  if (generating.value || !currentTagString.value) return
  generating.value = true

  try {
    const neg = ponyState.negativePrompt.trim() || 'bad anatomy, ugly, distorted, low quality, worst quality'
    const sel = ponyState.selections

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

    const res = await api.ponyGenerate(currentTagString.value, neg, params)

    messages.value.push({
      role: 'assistant',
      content: '',
      imageUrl: res.dataUrl || res.imageUrl,
      meta: `${res.model} · ${res.params.steps} steps · CFG ${res.params.cfg}`
    })
  } catch (e) {
    messages.value.push({ role: 'assistant', content: `Error generando: ${e.message}` })
  } finally {
    generating.value = false
    scrollBottom()
    saveCurrentProject()
  }
}

// ── Generate scene image from last 10 messages ──

async function generateScene() {
  if (generating.value || loading.value || !messages.value.length) return

  const recent = messages.value.slice(-10)
  generating.value = true

  try {
    // Step 1: DeepSeek analyzes chat → Danbooru prompt
    const res = await api.ponySceneToPrompt(recent.map(m => ({
      role: m.role,
      content: m.content || (m.imageUrl ? '[Imagen generada]' : '')
    })))
    const prompt = res.prompt

    // Step 2: Generate image with Pony model
    const neg = ponyState.negativePrompt.trim() || 'bad anatomy, ugly, distorted, low quality, worst quality'
    const params = {
      cfg: 7,
      steps: 30,
      sampler: 'DPM++ 2M Karras',
      width: 1024,
      height: 1024,
    }

    const genRes = await api.ponyGenerate(prompt, neg, params)

    messages.value.push({
      role: 'assistant',
      content: `🎬 Escena representativa:\n\n${prompt}`,
      imageUrl: genRes.dataUrl || genRes.imageUrl,
      meta: `${genRes.model} · ${genRes.params.steps} steps · CFG ${genRes.params.cfg}`
    })
  } catch (e) {
    messages.value.push({
      role: 'assistant',
      content: `❌ Error generando escena: ${e.message}`
    })
  } finally {
    generating.value = false
    scrollBottom()
    saveCurrentProject()
  }
}

function previewImage(url) {
  window.openLightbox?.(url)
}
</script>

<style scoped>
.pony-chat-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-deep);
  height: 100%;
  min-height: 0;
}

.pony-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Project tabs ── */
.pony-project-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 32px 0;
  background: var(--bg-deep);
  flex-shrink: 0;
  overflow-x: auto;
  border-bottom: 1px solid var(--border);
}

.pony-project-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-family: inherit;
  background: transparent;
  color: var(--muted);
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  position: relative;
  min-width: 0;
  max-width: 180px;
}

.pony-project-tab:hover {
  color: var(--fg);
  background: var(--surface-2);
}

.pony-project-tab.active {
  color: var(--fg);
  background: var(--surface);
  border-color: var(--border);
}

.pony-project-tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pony-project-tab-close {
  font-size: 14px;
  line-height: 1;
  color: var(--muted);
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  padding: 0 2px;
}

.pony-project-tab:hover .pony-project-tab-close {
  opacity: 1;
}

.pony-project-tab-close:hover {
  color: #ff5282;
}

.pony-project-tab-add {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  font-family: inherit;
  background: transparent;
  color: var(--muted);
  border: 1px dashed var(--border);
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.pony-project-tab-add:hover {
  color: #ff5282;
  border-color: #ff5282;
  background: rgba(255, 82, 130, 0.06);
}

/* ── Empty state ── */
.pony-chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--muted);
  text-align: center;
  padding: 40px;
}

.empty-icon { font-size: 48px; }

.pony-chat-empty h3 {
  font-size: 18px;
  font-weight: 500;
  color: var(--fg);
}

.pony-chat-empty p {
  font-size: 14px;
  line-height: 1.6;
  max-width: 400px;
}

.suggested-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
  max-width: 500px;
}

.suggestion-chip {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.suggestion-chip:hover {
  border-color: #ff5282;
  color: #ff5282;
  background: rgba(255, 82, 130, 0.08);
}

/* ── Tag summary panel ── */
.pony-tag-summary {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
  flex-shrink: 0;
}

.pony-tag-summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 12px;
  color: var(--muted);
  transition: background 0.1s;
  user-select: none;
}

.pony-tag-summary-header:hover {
  background: var(--surface-2);
}

.pony-tag-summary-title {
  display: flex;
  align-items: center;
  color: var(--fg);
  font-weight: 500;
}

.pony-tag-summary-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-clear-tags {
  background: none;
  border: none;
  padding: 3px;
  cursor: pointer;
  color: var(--muted);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  line-height: 1;
}

.btn-clear-tags:hover {
  color: #ff5282;
  background: rgba(255, 82, 130, 0.1);
}

.tag-count-badge {
  font-size: 10px;
  background: rgba(255, 82, 130, 0.12);
  color: #ff5282;
  padding: 2px 7px;
  border-radius: 999px;
  font-weight: 500;
}

.collapse-icon {
  font-size: 10px;
  color: var(--muted);
}

.pony-tag-summary-body {
  border-top: 1px solid var(--border);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pony-tag-preview {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--fg);
  font-family: var(--font-mono, monospace);
  white-space: pre-wrap;
  word-break: break-all;
}

.pony-neg-row {
  display: flex;
  gap: 6px;
  font-size: 11px;
  align-items: flex-start;
}

.neg-label {
  color: #ff6b6b;
  font-weight: 600;
  flex-shrink: 0;
  font-family: var(--font-mono, monospace);
}

.neg-text {
  color: var(--muted);
  font-family: var(--font-mono, monospace);
}

/* ── Messages ── */
.pony-msg {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.pony-msg.user {
  align-self: flex-end;
  align-items: flex-end;
}

.pony-msg.assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.pony-msg-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 100%;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.5;
}

.pony-msg.user .pony-msg-bubble {
  background: #7c3aed;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.pony-msg.assistant .pony-msg-bubble {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}

.pony-msg-text {
  white-space: pre-wrap;
  font-family: var(--font-mono, monospace);
  font-size: 12px;
}

/* ── Image result in message ── */
.pony-msg-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.pony-msg-image img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 0.2s;
}

.pony-msg-image img:hover {
  border-color: #ff5282;
}

.pony-msg-image-meta {
  font-size: 10px;
  color: var(--muted);
  font-family: var(--font-mono, monospace);
}

/* ── Typing indicator ── */
.pony-typing {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--muted);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ── Input ── */
.pony-chat-input {
  display: flex;
  gap: 10px;
  padding: 16px 32px;
  border-top: 1px solid var(--border);
  background: var(--surface);
  align-items: flex-end;
}

.pony-chat-textarea {
  flex: 1;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  color: var(--fg);
  font: inherit;
  font-size: 13px;
  resize: none;
  outline: none;
  line-height: 1.5;
  font-family: inherit;
}

.pony-chat-textarea:focus {
  border-color: #7c3aed;
}

.pony-chat-textarea::placeholder {
  color: var(--muted);
}

.pony-chat-textarea:disabled {
  opacity: 0.5;
}

.pony-chat-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.btn-send {
  background: #7c3aed;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 14px;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-send:hover:not(:disabled) {
  background: #8b5cf6;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn-generate {
  background: #22c55e;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 14px;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-generate:hover:not(:disabled) {
  background: #16a34a;
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn-scene {
  background: #f59e0b;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 14px;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-scene:hover:not(:disabled) {
  background: #d97706;
}

.btn-scene:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn-label {
  display: inline;
}

@media (max-width: 600px) {
  .btn-label {
    display: none;
  }
}

/* ── Image attachments in messages ── */
.pony-msg-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.pony-msg-attach-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 0.2s;
}

.pony-msg-attach-img:hover {
  border-color: #ff5282;
}

/* ── Input area with image previews ── */
.pony-chat-input-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pony-file-input {
  display: none;
}

.pony-attach-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pony-attach-thumb {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.pony-attach-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pony-attach-remove {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border: none;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.pony-attach-remove:hover {
  background: rgba(255, 0, 0, 0.8);
}

.btn-attach {
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
  padding: 10px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-attach:hover:not(:disabled) {
  color: var(--fg);
  border-color: #7c3aed;
}

.btn-attach:disabled {
  opacity: 0.4;
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

.pony-chat-messages::-webkit-scrollbar {
  width: 6px;
}
.pony-chat-messages::-webkit-scrollbar-track {
  background: transparent;
}
.pony-chat-messages::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

@media (max-width: 900px) {
  .pony-project-tabs {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  .pony-chat-messages,
  .pony-chat-input {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
}

@media (max-width: 639px) {
  .pony-project-tabs {
    padding: 6px 10px !important;
    gap: 4px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .pony-project-tab {
    font-size: 11px;
    padding: 4px 8px;
  }
  .pony-chat-messages {
    padding: 12px !important;
  }
  .pony-chat-input {
    padding: 10px 12px !important;
  }
  .pony-chat-empty {
    padding: 24px 16px;
  }
  .pony-chat-empty h3 {
    font-size: 16px;
  }
  .pony-chat-empty p {
    font-size: 13px;
  }
  .suggested-prompts {
    gap: 6px;
  }
  .suggested-prompts .suggestion-chip {
    font-size: 11px;
    padding: 5px 10px;
  }
  .pony-msg-bubble {
    max-width: 90%;
    padding: 10px 14px;
    font-size: 13px;
  }
  .pony-msg-row {
    gap: 8px;
  }
}
</style>
