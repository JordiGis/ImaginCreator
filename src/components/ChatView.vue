<template>
  <div class="view-container active" style="position: relative; height: 100%;">
    <div class="view-header">
      <h2>Chat</h2>
      <div class="view-header-actions">
        <button class="history-btn" @click="historyOpen = true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 2.5"/></svg>
          Historial
        </button>
        <button class="new-chat-btn" @click="handleNewChat">+ Nuevo chat</button>
      </div>
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
            <div v-for="(img, j) in msg.images" :key="j" class="image-preview-wrapper">
              <img
                :src="img.dataUrl || `/img/${img.file}`"
                :alt="`Image ${j + 1}`"
                @click="openModal(img.dataUrl || `/img/${img.file}`)"
              />
              <button class="ref-btn" title="Usar como referencia" @click.stop="useAsRef(img.dataUrl || `/img/${img.file}`)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>
              </button>
            </div>
          </div>
        </div>
        <div v-if="msg.role === 'assistant'" class="message-meta">
          <span v-if="msg.info">{{ msg.info.model }}</span>
          <span v-if="msg.info">·</span>
          <span v-if="msg.info && msg.info.cached" class="cache-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Caché
          </span>
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
      :pending-attachments="pendingAttachments"
      :translate-fn="api.translatePrompt"
      @send="handleSend"
      @update:model-key="setModel"
    />

    <!-- ===== Lightbox ===== -->
    <ImageModal :src="modalSrc" :show="modalOpen" @close="modalOpen = false" />

    <!-- ===== History Modal ===== -->
    <div v-if="historyOpen" class="history-modal-overlay" @click="historyOpen = false">
      <div class="history-modal" @click.stop>
        <div class="history-modal-header">
          <h3>Historial de Chats</h3>
          <button @click="historyOpen = false" class="close-btn">×</button>
        </div>
        <div class="history-list">
          <div v-if="sessions.length === 0" class="history-empty">No hay chats guardados</div>
          <div
            v-for="s in sessions"
            :key="s.id"
            class="history-item"
            @click="openSession(s.id)"
          >
            <div class="history-item-info">
              <h4>{{ s.title }}</h4>
              <span class="history-date">{{ new Date(s.updatedAt).toLocaleString() }}</span>
            </div>
            <button class="delete-btn" @click.stop="deleteSession(s.id)" title="Eliminar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PromptInput from './PromptInput.vue'
import ImageModal from './ImageModal.vue'
import { useApi } from '../composables/useApi.js'
import { useCreditTracker } from '../composables/useCreditTracker.js'
import { useChatStore } from '../composables/useChatStore.js'

const route = useRoute()
const router = useRouter()
const api = useApi()
const credit = useCreditTracker()

const {
  currentModel,
  setModel,
  messages,
  addMessage,
  newChat,
  hasMessages,
  loadSession,
  currentSessionId,
  sessions,
  deleteSession
} = useChatStore()

const modalSrc = ref('')
const modalOpen = ref(false)
const chatRef = ref(null)
const historyOpen = ref(false)

function openSession(id) {
  router.push(`/chat/${id}`)
  historyOpen.value = false
}

let msgCounter = 0

const suggestions = [
  'un gato astronauta en el espacio, estilo cyberpunk',
  'retrato de un elfo guerrero con armadura dorada',
  'paisaje surrealista con ríos de lava',
  'logo minimalista para startup de IA',
]

const pendingAttachments = ref([])

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      if (!loadSession(newId)) {
        // Session not found, redirect back
        router.replace('/chat')
      }
    }
  },
  { immediate: true }
)

// Ensure URL matches current session ID
watch(currentSessionId, (newId) => {
  if (newId && route.params.id !== newId) {
    router.replace(`/chat/${newId}`)
  }
}, { immediate: true })

function useAsRef(src) {
  fetch(src)
    .then(r => r.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        pendingAttachments.value.push(reader.result)
        resolve()
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))
    .catch(() => pendingAttachments.value.push(src))
}

function openModal(src) {
  modalSrc.value = src
  modalOpen.value = true
}

function useSuggestion(text) {
  handleSend({ prompt: text, images: [] })
}

function handleNewChat() {
  const id = newChat()
  router.push(`/chat/${id}`)
}

async function handleSend({ prompt, images }) {
  const contextParts = []
  const msgs = messages.value
  for (const msg of msgs.slice(-6)) {
    if (msg.role === 'user' && msg.text && msg.text !== '(imagen adjunta)') {
      contextParts.push(`User: ${msg.text}`)
    } else if (msg.role === 'assistant' && msg.text && !msg.text.startsWith('Error')) {
      contextParts.push(`Assistant: ${msg.text}`)
    }
  }
  let historyCtx = ''
  if (contextParts.length > 2) {
    historyCtx = `[Conversation history:\n${contextParts.join('\n')}\n]`
  }

  let finalImages = [...images]
  if (!finalImages.length) {
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i]
      if (m.role === 'assistant' && m.images?.length) {
        const last = m.images[m.images.length - 1]
        const src = last.dataUrl
        if (src && finalImages.length < 4) {
          finalImages.push(src)
        }
        break
      }
    }
  }

  const userKey = ++msgCounter

  addMessage({
    _id: `user-${userKey}`,
    role: 'user',
    text: prompt || '(imagen adjunta)',
    images: finalImages.map((d) => ({ dataUrl: d })),
  })

  const fullPrompt = historyCtx ? `${historyCtx}\n\nCurrent request: ${prompt || ''}`.trim() : (prompt || '')

  try {
    const result = await api.generateImage(fullPrompt, currentModel.value, finalImages)
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

onMounted(() => {
  setTimeout(() => {
    if (chatRef.value) {
      chatRef.value.scrollTop = chatRef.value.scrollHeight
    }
  }, 100)
})
</script>

<style scoped>

.history-btn {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg);
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-btn:hover {
  background: var(--border);
}

.history-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.history-modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.history-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
}

.history-modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s;
}

.close-btn:hover {
  color: var(--fg);
}

.history-list {
  padding: 16px 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-empty {
  text-align: center;
  color: var(--muted);
  padding: 32px 0;
  font-size: 14px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
}

.history-item:hover {
  border-color: var(--accent);
  background: var(--accent-subtle);
}

.history-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  flex: 1;
}

.history-item-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-date {
  font-size: 12px;
  color: var(--muted);
}

.delete-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.15s;
}

.delete-btn:hover {
  background: rgba(255, 82, 82, 0.1);
  color: #ff5252;
}

/* -- Mobile responsive -- */
@media (max-width: 639px) {
  .history-modal {
    width: 95%;
    max-height: 90vh;
  }
  .history-modal-header {
    padding: 12px 16px;
  }
  .history-list {
    padding: 12px 16px;
  }
  .history-item {
    padding: 10px 12px;
  }
}
</style>
