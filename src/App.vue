<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-inner">
        <div class="sidebar-header">
          <h1>ImaginCreator</h1>
          <p class="subtitle">Generación con IA</p>
        </div>

        <div class="sidebar-actions">
          <button
            :class="['sidebar-btn', { primary: viewMode === 'chat' }]"
            @click="viewMode = 'chat'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Chat
          </button>
          <button
            :class="['sidebar-btn', { primary: viewMode === 'character' }]"
            @click="viewMode = 'character'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Creador Personajes
          </button>
          <button class="sidebar-btn" @click="showGallery = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            Galería
          </button>
        </div>

        <div class="sidebar-section">
          <label class="section-label">Modelo activo</label>
          <ModelSelector :model-value="currentModel" @update:model-value="setModel" />
        </div>

        <div class="sidebar-section">
          <CostDashboard
            :total-cost="credit.totalCost.value"
            :total-tokens="credit.totalTokens.value"
            :total-images="credit.totalImages.value"
            :daily-remaining="credit.dailyRemaining.value"
            :weekly-remaining="credit.weeklyRemaining.value"
          />
        </div>

        <div class="sidebar-footer">
          <p class="hint">Prompts idénticos usan caché — sin coste</p>
        </div>
      </div>
    </aside>

    <!-- Character Creator view -->
    <main v-if="viewMode === 'character'" class="main">
      <CharacterConfigurator
        @send-to-chat="handleCharacterToChat"
        @open-gallery="showGallery = true"
      />
    </main>

    <!-- Main chat -->
    <main v-else class="main">
      <div class="chat" ref="chatRef">
        <TransitionGroup name="msg" tag="div" class="msg-list">
          <div v-if="!hasMessages()" key="empty" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h2>¿Qué quieres crear?</h2>
            <p>Describe una imagen y la IA la generará al instante.</p>
            <p class="hint">Ej: "un gato astronauta en el espacio, estilo cyberpunk"</p>
          </div>

          <div
            v-for="(msg, i) in messages"
            :key="msg._id || i"
            :class="['message', msg.role]"
          >
            <div class="bubble">
              <p>{{ msg.text || '(imagen generada)' }}</p>
            </div>
            <div v-if="msg.images && msg.images.length" class="image-row">
              <img
                v-for="(img, j) in msg.images"
                :key="j"
                :src="img.dataUrl || `/img/${img.file}`"
                :alt="`Image ${j + 1}`"
                class="thumb"
                @click="openModal(img.dataUrl || `/img/${img.file}`)"
              />
            </div>
            <div v-if="msg.info" class="msg-info">
              <span class="model-tag">{{ msg.info.model }}</span>
              <span class="sep">·</span>
              <span :class="['cost-tag', { free: msg.info.cached }]">
                {{ msg.info.cached ? 'Caché' : `$${msg.info.cost}` }}
              </span>
              <span class="sep">·</span>
              <span class="tokens">{{ msg.info.tokens }} tokens</span>
            </div>
          </div>
        </TransitionGroup>

        <div v-if="api.generating.value" class="message assistant">
          <div class="bubble generating">
            <span class="spinner"></span>
            Generando...
          </div>
        </div>
      </div>

      <div class="model-context">
        <span class="ctx-badge">{{ getModel(currentModel).label }}</span>
        <span class="ctx-cost">${{ getModel(currentModel).cost.toFixed(3) }}/img</span>
      </div>

      <PromptInput
        :disabled="api.generating.value"
        :estimated-cost="credit.estimatedCost(currentModel)"
        :model-key="currentModel"
        @send="handleSend"
      />
    </main>

    <!-- Modals -->
    <ImageModal :src="modalSrc" :show="modalOpen" @close="modalOpen = false" />
    <ImageGallery :show="showGallery" @close="showGallery = false" @preview="openModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ModelSelector from './components/ModelSelector.vue'
import CostDashboard from './components/CostDashboard.vue'
import PromptInput from './components/PromptInput.vue'
import ImageModal from './components/ImageModal.vue'
import ImageGallery from './components/ImageGallery.vue'
import CharacterConfigurator from './components/CharacterConfigurator.vue'
import { useApi } from './composables/useApi.js'
import { useCreditTracker } from './composables/useCreditTracker.js'
import { useChatStore } from './composables/useChatStore.js'
import { getModel } from './config/models.js'

const api = useApi()
const credit = useCreditTracker()

const viewMode = ref('chat')

const {
  currentModel,
  setModel,
  messages,
  addMessage,
  newChat,
  hasMessages,
} = useChatStore()

const modalSrc = ref('')
const modalOpen = ref(false)
const showGallery = ref(false)
const chatRef = ref(null)

let msgCounter = 0

function openModal(src) {
  modalSrc.value = src
  modalOpen.value = true
}

async function handleSend({ prompt, images }) {
  // Unique key for transition
  const userKey = ++msgCounter

  addMessage({
    _id: `user-${userKey}`,
    role: 'user',
    text: prompt || '(imagen adjunta)',
    images: images.map((d) => ({ dataUrl: d })),
  })

  try {
    const result = await api.generateImage(prompt, currentModel.value, images)
    const aiKey = ++msgCounter

    addMessage({
      _id: `ai-${aiKey}`,
      role: 'assistant',
      text: result.cached
        ? 'Imagen servida desde caché (sin coste)'
        : result.text || '',
      images: result.images || [],
      info: {
        model: result.model,
        cost: result.cost,
        tokens: (result.usage?.prompt || 0) + (result.usage?.output || 0),
        cached: result.cached,
      },
    })

    credit.addGeneration(result)
  } catch (e) {
    addMessage({
      _id: `err-${++msgCounter}`,
      role: 'assistant',
      text: `Error: ${e.message}`,
      images: [],
    })
  }

  // Scroll to bottom after render
  setTimeout(() => {
    if (chatRef.value) {
      chatRef.value.scrollTop = chatRef.value.scrollHeight
    }
  }, 50)
}

function handleCharacterToChat(charResult) {
  // Switch to chat view and add character result as a message
  viewMode.value = 'chat'
  setModel('recraft-v41')
  const aiKey = ++msgCounter
  addMessage({
    _id: `char-${aiKey}`,
    role: 'assistant',
    text: charResult.prompt || 'Personaje generado',
    images: charResult.imageUrl ? [{ dataUrl: charResult.imageUrl }] : [],
    info: {
      model: charResult.model || 'Recraft V4.1',
      cost: charResult.cost || '0',
      tokens: charResult.tokens || 0,
      cached: charResult.cached || false,
    },
  })
}

onMounted(() => {
  credit.loadStats()
  api
    .fetchImages()
    .then((imgs) => {
      if (imgs.length > 0 && !hasMessages()) {
        addMessage({
          _id: 'greeting',
          role: 'assistant',
          text: `Hay ${imgs.length} imágenes guardadas. Explóralas en la galería o genera una nueva.`,
          images: [],
        })
      }
    })
    .catch(() => {})
})
</script>

<style>
/* ── Reset & base ── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg-deep: #08080e;
  --bg-primary: #0c0c18;
  --bg-secondary: #12121e;
  --bg-tertiary: #1a1a2e;
  --bg-elevated: #22223a;
  --border: #282840;
  --border-light: #383858;
  --text-primary: #eeeef8;
  --text-secondary: #9494b8;
  --text-muted: #55557a;
  --accent: #7c5cfc;
  --accent-hover: #6b4be6;
  --accent-bg: #1e1660;
  --accent-glow: rgba(124, 92, 252, 0.15);
  --green: #00d4aa;
  --green-bg: #0a2a22;
  --green-glow: rgba(0, 212, 170, 0.12);
  --gradient: linear-gradient(135deg, #7c5cfc, #9470ff);
  --sidebar-width: 290px;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

html,
body {
  height: 100%;
  font-family: var(--font);
  background: var(--bg-deep);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
}

/* ── Layout ── */
.app-layout {
  display: flex;
  height: 100%;
}

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

/* Top accent line */
.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient);
}

.sidebar-inner {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;
}

.sidebar-header h1 {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.3px;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 1px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-weight: 500;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.sidebar-btn:hover {
  border-color: var(--accent);
  background: var(--accent-bg);
  box-shadow: 0 0 20px var(--accent-glow);
}

.sidebar-btn.primary {
  background: var(--accent-bg);
  border-color: #3a28a0;
  color: var(--accent);
  font-weight: 600;
}

.sidebar-btn.primary:hover {
  background: #2a1e80;
  border-color: var(--accent);
  box-shadow: 0 0 24px var(--accent-glow);
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-muted);
  font-weight: 600;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.hint {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* ── Main chat ── */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-primary);
  position: relative;
}

/* Subtle grid background */
.main::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0);
  background-size: 32px 32px;
  opacity: 0.3;
  pointer-events: none;
}

.chat {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  z-index: 1;
}

.msg-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Empty state */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
}

.empty-icon {
  margin-bottom: 8px;
  color: var(--text-muted);
}

.empty-state h2 {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
}

.empty-state p {
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-state .hint {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 4px;
  font-style: italic;
}

/* ── Messages ── */
.message {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 720px;
  animation: msgIn 0.2s ease-out;
}

@keyframes msgIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  align-self: flex-end;
}

.message.user .bubble {
  background: var(--gradient);
  border-radius: 14px 14px 4px 14px;
  padding: 12px 16px;
  font-size: 14px;
  align-self: flex-end;
  line-height: 1.5;
  box-shadow: 0 4px 16px var(--accent-glow);
}

.message.assistant .bubble {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 14px 14px 14px 4px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
}

.message.assistant .bubble p {
  white-space: pre-wrap;
  word-break: break-word;
}

.generating {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
}

/* Image thumbs */
.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.thumb {
  max-width: 260px;
  max-height: 260px;
  border-radius: 10px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.thumb:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

/* Message meta */
.msg-info {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 0 4px;
}

.model-tag {
  background: var(--bg-tertiary);
  padding: 1px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 10px;
  color: var(--text-secondary);
}

.cost-tag {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.cost-tag.free {
  color: var(--green);
}

.sep {
  color: var(--border-light);
}

.tokens {
  color: var(--text-muted);
}

/* ── Model context bar ── */
.model-context {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 32px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  position: relative;
  z-index: 1;
}

.ctx-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-bg);
  padding: 2px 10px;
  border-radius: 5px;
}

.ctx-cost {
  font-size: 11px;
  color: var(--green);
  font-weight: 500;
}

/* ── Transition group ── */
.msg-enter-active {
  transition: all 0.25s ease-out;
}

.msg-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.msg-move {
  transition: transform 0.25s ease;
}

/* ── Spinner ── */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Scrollbar ── */
.chat::-webkit-scrollbar {
  width: 6px;
}

.chat::-webkit-scrollbar-track {
  background: transparent;
}

.chat::-webkit-scrollbar-thumb {
  background: var(--bg-elevated);
  border-radius: 3px;
}

.chat::-webkit-scrollbar-thumb:hover {
  background: var(--border-light);
}

.sidebar-inner::-webkit-scrollbar {
  width: 4px;
}

.sidebar-inner::-webkit-scrollbar-thumb {
  background: var(--bg-elevated);
  border-radius: 2px;
}
</style>
