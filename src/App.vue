<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>🎨 ImaginCreator</h1>
        <p class="subtitle">Genera imágenes con IA</p>
      </div>

      <ModelSelector v-model="selectedModel" />

      <CostDashboard
        :total-cost="credit.totalCost.value"
        :total-tokens="credit.totalTokens.value"
        :total-images="credit.totalImages.value"
        :daily-remaining="credit.dailyRemaining.value"
        :weekly-remaining="credit.weeklyRemaining.value"
      />

      <div class="sidebar-footer">
        <p class="hint">💡 Prompts idénticos usan caché (sin gastar crédito)</p>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">
      <div class="chat" ref="chatRef">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">🎨</div>
          <h2>¿Qué quieres crear?</h2>
          <p>Escribe un prompt y genera imágenes con IA.</p>
          <p class="hint">Ej: "un gato astronauta en el espacio, estilo cyberpunk"</p>
        </div>

        <div
          v-for="(msg, i) in messages"
          :key="i"
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
            <span>{{ msg.info.model }}</span>
            <span>·</span>
            <span :class="{ free: msg.info.cached }">
              {{ msg.info.cached ? '🆓 Caché' : `$${msg.info.cost}` }}
            </span>
            <span>·</span>
            <span>{{ msg.info.tokens }} tokens</span>
          </div>
        </div>

        <div v-if="api.generating.value" class="message assistant">
          <div class="bubble generating">
            <span class="spinner"></span>
            Generando...
          </div>
        </div>
      </div>

      <PromptInput
        :disabled="api.generating.value"
        :estimated-cost="credit.estimatedCost(selectedModel)"
        :model-key="selectedModel"
        @send="handleSend"
      />
    </main>

    <!-- Fullscreen modal -->
    <ImageModal :src="modalSrc" :show="modalOpen" @close="modalOpen = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ModelSelector from './components/ModelSelector.vue'
import CostDashboard from './components/CostDashboard.vue'
import PromptInput from './components/PromptInput.vue'
import ImageModal from './components/ImageModal.vue'
import { useApi } from './composables/useApi.js'
import { useCreditTracker } from './composables/useCreditTracker.js'

const api = useApi()
const credit = useCreditTracker()

const selectedModel = ref('flux-2-klein')
const messages = ref([])
const modalSrc = ref('')
const modalOpen = ref(false)
const chatRef = ref(null)

function openModal(src) {
  modalSrc.value = src
  modalOpen.value = true
}

async function handleSend(prompt) {
  // Add user message
  messages.value.push({ role: 'user', text: prompt, images: [] })

  try {
    const result = await api.generateImage(prompt, selectedModel.value)

    // Add assistant message with images
    messages.value.push({
      role: 'assistant',
      text: result.cached ? '✅ Usando imagen en caché (sin coste)' : (result.text || ''),
      images: result.images || [],
      info: {
        model: result.model,
        cost: result.cost,
        tokens: (result.usage?.prompt || 0) + (result.usage?.output || 0),
        cached: result.cached
      }
    })

    credit.addGeneration(result)

    // Scroll to bottom
    setTimeout(() => {
      if (chatRef.value) {
        chatRef.value.scrollTop = chatRef.value.scrollHeight
      }
    }, 100)
  } catch (e) {
    messages.value.push({
      role: 'assistant',
      text: `❌ Error: ${e.message}`,
      images: []
    })
  }
}

onMounted(() => {
  credit.loadStats()

  // Load image history
  api.fetchImages().then((imgs) => {
    if (imgs.length > 0) {
      messages.value.push({ role: 'assistant', text: `📸 ${imgs.length} imágenes generadas anteriormente`, images: [] })
    }
  }).catch(() => {})
})
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-primary: #0f0f13;
  --bg-secondary: #1a1a24;
  --bg-tertiary: #2a2a3a;
  --border: #2a2a3a;
  --text-primary: #e0e0e0;
  --text-secondary: #888;
  --text-muted: #555;
  --accent: #6b5fff;
  --accent-hover: #5a4ee6;
  --accent-dim: #2a1f6e;
  --green: #4caf50;
  --sidebar-width: 300px;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
}

#app { height: 100%; }

.app-layout {
  display: flex;
  height: 100%;
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar-header h1 {
  font-size: 20px;
  color: var(--accent);
  font-weight: 700;
}

.subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
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

/* Main */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon { font-size: 64px; }

.empty-state h2 {
  color: var(--text-primary);
  font-size: 20px;
  margin-top: 8px;
}

.empty-state .hint {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 8px;
}

/* Messages */
.message {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 800px;
}

.message.user {
  align-self: flex-end;
}

.message.user .bubble {
  background: var(--accent-dim);
  border: 1px solid #4a3f9e;
  border-radius: 12px 12px 4px 12px;
  padding: 10px 14px;
  font-size: 14px;
  align-self: flex-end;
}

.message.assistant .bubble {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px 12px 12px 4px;
  padding: 10px 14px;
  font-size: 14px;
}

.message.assistant .bubble p {
  white-space: pre-wrap;
  word-break: break-word;
}

.generating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.thumb {
  max-width: 280px;
  max-height: 280px;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.2s;
}

.thumb:hover {
  transform: scale(1.03);
}

.msg-info {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  gap: 8px;
  align-items: center;
}

.msg-info .free { color: var(--green); }

/* Spinner */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Scrollbar */
.chat::-webkit-scrollbar { width: 8px; }
.chat::-webkit-scrollbar-track { background: transparent; }
.chat::-webkit-scrollbar-thumb { background: var(--bg-tertiary); border-radius: 4px; }
.chat::-webkit-scrollbar-thumb:hover { background: #3a3a4a; }
</style>
