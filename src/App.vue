<template>
  <div class="app">
    <!-- ===== Sidebar ===== -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <svg viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="var(--accent)" opacity="0.2"/>
          <path d="M10 20L16 10l6 10H10z" fill="var(--accent)"/>
        </svg>
        <h1>ImaginCreator</h1>
      </div>

      <nav class="nav-tabs" role="tablist">
        <button
          :class="['nav-tab', { active: viewMode === 'chat' }]"
          role="tab"
          :aria-selected="viewMode === 'chat'"
          @click="viewMode = 'chat'"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 3h14a2 2 0 012 2v10a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2z"/></svg>
          <span>Chat</span>
        </button>
        <button
          :class="['nav-tab', { active: viewMode === 'character' }]"
          role="tab"
          :aria-selected="viewMode === 'character'"
          @click="viewMode = 'character'"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="7" r="3"/><path d="M3 17c0-4 3.13-6 7-6s7 2 7 6"/></svg>
          <span>Personajes</span>
        </button>
        <button
          :class="['nav-tab', { active: viewMode === 'gallery' }]"
          role="tab"
          :aria-selected="viewMode === 'gallery'"
          @click="viewMode = 'gallery'"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="6" height="6"/><rect x="12" y="2" width="6" height="6"/><rect x="2" y="12" width="6" height="6"/><rect x="12" y="12" width="6" height="6"/></svg>
          <span>Galería</span>
        </button>
      </nav>

      <ModelSelector :model-value="currentModel" @update:model-value="setModel" />

      <CostDashboard
        :total-cost="credit.totalCost.value"
        :total-tokens="credit.totalTokens.value"
        :total-images="credit.totalImages.value"
        :daily-remaining="credit.dailyRemaining.value"
        :weekly-remaining="credit.weeklyRemaining.value"
        :daily-limit="credit.dailyLimit.value"
        :weekly-limit="credit.weeklyLimit.value"
      />

      <div class="sidebar-footer">
        Prompts idénticos cargan desde caché y son gratuitos.
      </div>
    </aside>

    <!-- ===== Main content ===== -->
    <main class="main">

      <!-- ===== Chat view ===== -->
      <div v-if="viewMode === 'chat'" class="view-container active">
        <div class="chat-header">
          <h2>Chat</h2>
          <button class="new-chat-btn" @click="handleNewChat">+ Nuevo chat</button>
        </div>

        <div class="chat-messages" ref="chatRef">
          <!-- Empty state -->
          <div v-if="!hasMessages()" class="empty-state">
            <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="10" y="10" width="40" height="40" rx="8"></rect>
              <circle cx="30" cy="28" r="8"></circle>
              <path d="M18 44l6-12 8 8 8-16 8 20"></path>
            </svg>
            <h2>¿Qué quieres crear hoy?</h2>
            <div class="suggestions">
              <span
                v-for="s in suggestions"
                :key="s"
                class="suggestion-chip"
                @click="useSuggestion(s)"
              >{{ s }}</span>
            </div>
          </div>

          <!-- Messages -->
          <div
            v-for="msg in messages"
            :key="msg._id"
            :class="['message', msg.role === 'user' ? 'user' : 'ai']"
          >
            <div class="message-bubble">
              <div class="text">{{ msg.text }}</div>
              <div v-if="msg.images && msg.images.length" class="image-previews">
                <img
                  v-for="(img, j) in msg.images"
                  :key="j"
                  :src="img.dataUrl || `/img/${img.file}`"
                  :alt="`Image ${j + 1}`"
                  @click="openModal(img.dataUrl || `/img/${img.file}`)"
                />
              </div>
            </div>
            <div v-if="msg.role === 'assistant'" class="message-meta">
              <span v-if="msg.info">{{ msg.info.model }}</span>
              <span v-if="msg.info">·</span>
              <span v-if="msg.info && msg.info.cached" class="cache-badge">🆓 Caché</span>
              <span v-if="msg.info && !msg.info.cached">${{ msg.info.cost }}</span>
              <span v-if="msg.info">· {{ msg.info.tokens }} tokens</span>
            </div>
          </div>

          <!-- Generating indicator -->
          <div v-if="api.generating.value" class="message ai">
            <div class="message-bubble">
              <div class="generating">
                <div class="spinner"></div>
                <span>Generando...</span>
              </div>
            </div>
          </div>
        </div>

        <PromptInput
          :disabled="api.generating.value"
          :estimated-cost="credit.estimatedCost(currentModel)"
          :model-key="currentModel"
          @send="handleSend"
          @update:model-key="setModel"
        />
      </div>

      <!-- ===== Character Creator view ===== -->
      <div v-if="viewMode === 'character'" class="view-container active">
        <CharacterConfigurator
          @send-to-chat="handleCharacterToChat"
          @open-gallery="viewMode = 'gallery'"
        />
      </div>

      <!-- ===== Gallery view ===== -->
      <div v-if="viewMode === 'gallery'" class="view-container active">
        <ImageGallery :show="viewMode === 'gallery'" @preview="openModal" />
      </div>

    </main>

    <!-- ===== Lightbox ===== -->
    <ImageModal :src="modalSrc" :show="modalOpen" @close="modalOpen = false" />
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
const chatRef = ref(null)

let msgCounter = 0

const suggestions = [
  'un gato astronauta en el espacio, estilo cyberpunk',
  'retrato de un elfo guerrero con armadura dorada',
  'paisaje surrealista con ríos de lava',
  'logo minimalista para startup de IA',
]

function openModal(src) {
  modalSrc.value = src
  modalOpen.value = true
}

function useSuggestion(text) {
  // Fill prompt and immediately send
  handleSend({ prompt: text, images: [] })
}

function handleNewChat() {
  newChat()
}

async function handleSend({ prompt, images }) {
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

  setTimeout(() => {
    if (chatRef.value) {
      chatRef.value.scrollTop = chatRef.value.scrollHeight
    }
  }, 50)
}

function handleCharacterToChat(charResult) {
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
/* ── Design tokens ── */
:root {
  --bg-deep: #0b0b0f;
  --surface: #14141a;
  --surface-2: #1a1a22;
  --border: #2a2a35;
  --fg: #e8e8ed;
  --muted: #8a8a96;
  --accent: #4f8cff;
  --accent-hover: #6ba0ff;
  --accent-subtle: rgba(79,140,255,0.12);
  --success: #00c853;
  --success-bg: rgba(0,200,83,0.1);
  --radius: 8px;
  --radius-sm: 6px;
  --font: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', 'Cascadia Code', monospace;
  --sidebar-width: 280px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: var(--bg-deep);
  color: var(--fg);
  font: 14px/1.5 var(--font);
  -webkit-font-smoothing: antialiased;
}

#app { height: 100%; }

/* ── Layout ── */
.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  overflow-y: auto;
  z-index: 10;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  padding-left: 4px;
}

.sidebar-logo svg {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.sidebar-logo h1 {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--fg);
}

/* ── Nav Tabs ── */
.nav-tabs {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 24px;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius);
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  background: none;
  border: none;
  font: inherit;
  font-size: 14px;
  text-align: left;
  width: 100%;
}

.nav-tab:hover { background: var(--surface-2); color: var(--fg); }
.nav-tab.active {
  background: var(--accent-subtle);
  color: var(--accent);
  font-weight: 500;
}

.nav-tab svg {
  width: 20px; height: 20px;
  flex-shrink: 0;
  opacity: 0.7;
}
.nav-tab.active svg { opacity: 1; }

/* ── Sidebar Footer ── */
.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  line-height: 1.4;
}

/* ── Main content ── */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-deep);
}

.view-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ── Chat view ── */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
  z-index: 2;
}

.chat-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
}

.new-chat-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
}

.new-chat-btn:hover {
  background: var(--surface-2);
  color: var(--fg);
}

/* ── Chat Messages ── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px;
  color: var(--muted);
}

.empty-state svg {
  width: 72px; height: 72px;
  opacity: 0.25;
}

.empty-state h2 {
  font-size: 20px;
  font-weight: 500;
  color: var(--muted);
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 460px;
}

.suggestion-chip {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.suggestion-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-subtle);
}

/* ── Message bubbles ── */
.message {
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

.message.user {
  align-self: flex-end;
  align-items: flex-end;
}

.message.ai {
  align-self: flex-start;
  align-items: flex-start;
}

.message-bubble {
  background: var(--surface-2);
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 100%;
  word-break: break-word;
}

.message.user .message-bubble {
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message.ai .message-bubble {
  border-bottom-left-radius: 4px;
}

.message .text { line-height: 1.5; }

.image-previews {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.image-previews img {
  width: 80px; height: 80px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.1s;
}

.image-previews img:hover {
  transform: scale(1.05);
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--muted);
}

.cache-badge {
  background: var(--success-bg);
  color: var(--success);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.generating {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 14px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Scrollbar ── */
.sidebar::-webkit-scrollbar,
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track,
.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb,
.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .sidebar {
    width: 72px;
    min-width: 72px;
    padding: 16px 8px;
  }
  .sidebar-logo h1,
  .nav-tab span,
  .model-selector,
  .cost-dashboard,
  .sidebar-footer {
    display: none;
  }
  .nav-tab {
    justify-content: center;
    padding: 10px;
  }
  .chat-messages,
  .chat-header,
  .chat-input-area {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
}
</style>
