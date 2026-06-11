<template>
  <div class="view-container active" style="position: relative; height: 100%;">
    <!-- Header -->
    <div class="view-header">
      <div class="char-info" @click="router.push('/characters')" style="cursor: pointer;">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; margin-right: 8px;"><path d="M12 5l-5 5 5 5"/></svg>
        <span class="char-avatar-sm">{{ character?.avatar }}</span>
        <h2>{{ character?.name || 'Cargando...' }}</h2>
      </div>
      <div class="view-header-actions">
        <button class="new-chat-btn" @click="resetChat">Nueva conversación</button>
      </div>
    </div>

    <!-- Messages -->
    <div class="chat-messages" ref="chatRef">
      <!-- Empty state -->
      <div v-if="messages.length === 0" class="empty-state">
        <div class="char-avatar-lg">{{ character?.avatar }}</div>
        <h2>{{ character?.name }}</h2>
        <p class="char-role-hint">{{ character?.systemPrompt?.slice(0, 120) }}...</p>
        <button class="primary-btn" @click="sendGreeting">¡Empezar conversación!</button>
      </div>

      <!-- Messages list -->
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        :class="['message', msg.role]"
      >
        <div class="msg-header">
          <span v-if="msg.role === 'assistant'" class="msg-avatar-sm">{{ character?.avatar }}</span>
          <span v-else class="msg-avatar-sm">🧑</span>
          <span class="msg-type-badge" :class="msg.type">
            {{ typeIcon(msg.type) }} {{ typeLabel(msg.type) }}
          </span>
        </div>
        <div :class="['message-bubble', msg.type]">
          <div class="text">{{ msg.content }}</div>
        </div>
      </div>

      <!-- Generating indicator -->
      <div v-if="generating" class="message assistant">
        <div class="msg-header">
          <span class="msg-avatar-sm">{{ character?.avatar }}</span>
          <span class="msg-type-badge thought">💭 Pensando</span>
        </div>
        <div class="message-bubble">
          <div class="generating">
            <div class="spinner"></div>
            <span>{{ character?.name }} está escribiendo...</span>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="message assistant">
        <div class="message-bubble error-bubble">
          <div class="text">❌ {{ error }}</div>
          <button class="retry-btn" @click="retryLastMessage">Reintentar</button>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="chat-input-area">
      <!-- Mode selector -->
      <div class="mode-selector">
        <button
          v-for="mode in modes"
          :key="mode.key"
          :class="['mode-btn', { active: inputMode === mode.key }]"
          @click="inputMode = mode.key"
          :title="mode.label"
        >
          <span>{{ mode.icon }}</span>
          <span class="mode-label">{{ mode.label }}</span>
        </button>
      </div>

      <div class="input-row">
        <input
          ref="inputRef"
          v-model="inputText"
          type="text"
          :placeholder="inputMode === 'speech' ? 'Escribe lo que dices...' : inputMode === 'thought' ? 'Escribe lo que piensas...' : 'Describe el entorno o una acción...'"
          @keydown.enter.exact="sendMessage"
          :disabled="generating"
          maxlength="500"
        />
        <button
          class="send-btn"
          @click="sendMessage"
          :disabled="!inputText.trim() || generating"
          :title="typeLabel(inputMode)"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><path d="M10 3v14M3 10l7 7 7-7"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const character = ref(null)
const messages = ref([])
const inputText = ref('')
const inputMode = ref('speech') // speech | thought | narration
const generating = ref(false)
const error = ref('')
const chatRef = ref(null)
const inputRef = ref(null)

const modes = [
  { key: 'speech', icon: '💬', label: 'Decir' },
  { key: 'thought', icon: '💭', label: 'Pensar' },
  { key: 'narration', icon: '🌍', label: 'Narrar' },
]

function typeIcon(type) {
  return modes.find(m => m.key === type)?.icon || '💬'
}

function typeLabel(type) {
  const labels = { speech: 'Habla', thought: 'Piensa', narration: 'Narra' }
  return labels[type] || ''
}

function wrapContent(type, text) {
  if (type === 'speech') return `"${text}"`
  if (type === 'thought') return `(${text})`
  if (type === 'narration') return `*${text}*`
  return text
}

function detectType(text) {
  if (text.startsWith('"') && text.endsWith('"')) return { type: 'speech', content: text.slice(1, -1) }
  if (text.startsWith('(') && text.endsWith(')')) return { type: 'thought', content: text.slice(1, -1) }
  if (text.startsWith('*') && text.endsWith('*')) return { type: 'narration', content: text.slice(1, -1) }
  // Mixed: use first detected marker
  if (text.startsWith('*')) return { type: 'narration', content: text }
  if (text.startsWith('"')) return { type: 'speech', content: text }
  if (text.startsWith('(')) return { type: 'thought', content: text }
  return { type: 'speech', content: text }
}

// Load character
async function loadCharacter(id) {
  try {
    const res = await fetch('/api/characters')
    const data = await res.json()
    const found = (data.characters || []).find(c => c.id === id)
    if (!found) {
      router.replace('/characters')
      return
    }
    character.value = found
    // Restore saved messages
    restoreMessages(id)
    // Auto-send greeting if no messages
    if (messages.value.length === 0 && found.greeting) {
      const detected = detectType(found.greeting)
      messages.value.push({
        role: 'assistant',
        type: detected.type,
        content: detected.content,
        raw: found.greeting,
      })
      saveMessages(id)
    }
  } catch (e) {
    console.error('Failed to load character', e)
    router.replace('/characters')
  }
}

const STORAGE_KEY_PREFIX = 'ichar-msg-'

function saveMessages(charId) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + charId, JSON.stringify(messages.value))
  } catch {}
}

function restoreMessages(charId) {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + charId)
    if (data) messages.value = JSON.parse(data)
  } catch {}
}

function resetChat() {
  messages.value = []
  if (character.value?.id) {
    localStorage.removeItem(STORAGE_KEY_PREFIX + character.value.id)
    // Re-send greeting if exists
    if (character.value.greeting) {
      const detected = detectType(character.value.greeting)
      messages.value.push({
        role: 'assistant',
        type: detected.type,
        content: detected.content,
        raw: character.value.greeting,
      })
      saveMessages(character.value.id)
    }
  }
  inputText.value = ''
  error.value = ''
  focusInput()
}

function scrollBottom() {
  nextTick(() => {
    if (chatRef.value) {
      chatRef.value.scrollTop = chatRef.value.scrollHeight
    }
  })
}

function focusInput() {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function sendGreeting() {
  // If already has greeting message, just focus input
  if (messages.value.length > 0) return
  if (character.value?.greeting) {
    const detected = detectType(character.value.greeting)
    messages.value.push({
      role: 'assistant',
      type: detected.type,
      content: detected.content,
      raw: character.value.greeting,
    })
    saveMessages(character.value.id)
  }
  focusInput()
  scrollBottom()
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || generating.value || !character.value) return

  const type = inputMode.value
  const wrapped = wrapContent(type, text)
  error.value = ''

  // Add user message
  messages.value.push({
    role: 'user',
    type,
    content: text,
    raw: wrapped,
  })
  inputText.value = ''
  saveMessages(character.value.id)
  scrollBottom()

  // Send to API
  generating.value = true
  try {
    const apiMessages = messages.value.map(m => ({
      role: m.role,
      content: m.raw,
    }))

    const res = await fetch('/api/characters/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterId: character.value.id,
        messages: apiMessages,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error del servidor')

    const aiText = data.text || ''
    const detected = detectType(aiText)

    messages.value.push({
      role: 'assistant',
      type: detected.type,
      content: detected.content,
      raw: aiText,
    })
    saveMessages(character.value.id)
    scrollBottom()
  } catch (e) {
    error.value = e.message
  } finally {
    generating.value = false
    focusInput()
  }
}

async function retryLastMessage() {
  // Remove last user message was the one that failed
  // Re-send the last user message
  if (messages.value.length < 1) return
  const lastMsg = messages.value[messages.value.length - 1]
  if (lastMsg.role === 'user') {
    error.value = ''
    // Actually re-send from the last user message
    generating.value = true
    try {
      const apiMessages = messages.value.map(m => ({
        role: m.role,
        content: m.raw,
      }))

      const res = await fetch('/api/characters/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.value.id,
          messages: apiMessages,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error del servidor')

      const aiText = data.text || ''
      const detected = detectType(aiText)

      messages.value.push({
        role: 'assistant',
        type: detected.type,
        content: detected.content,
        raw: aiText,
      })
      saveMessages(character.value.id)
      scrollBottom()
    } catch (e) {
      error.value = e.message
    } finally {
      generating.value = false
      focusInput()
    }
  }
}

// Reset on route change
watch(() => route.params.id, (newId) => {
  if (newId) {
    messages.value = []
    character.value = null
    error.value = ''
    inputText.value = ''
    loadCharacter(newId)
  }
}, { immediate: true })

onMounted(() => {
  focusInput()
})
</script>

<style scoped>
.char-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.char-avatar-sm {
  font-size: 24px;
  line-height: 1;
  margin-right: 8px;
}

.char-avatar-lg {
  font-size: 64px;
  line-height: 1;
}

.char-role-hint {
  font-size: 13px;
  color: var(--muted);
  max-width: 400px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Messages ── */

.msg-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.msg-avatar-sm {
  font-size: 18px;
  line-height: 1;
}

.msg-type-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--muted);
  letter-spacing: 0.02em;
}

.msg-type-badge.speech {
  background: rgba(100, 180, 255, 0.15);
  color: #64b4ff;
}

.msg-type-badge.thought {
  background: rgba(200, 140, 255, 0.15);
  color: #c88cff;
  font-style: italic;
}

.msg-type-badge.narration {
  background: rgba(80, 220, 160, 0.15);
  color: #50dca0;
  font-style: italic;
}

.message-bubble.speech {
  border-left: 3px solid #64b4ff;
}

.message-bubble.thought {
  border-left: 3px solid #c88cff;
  font-style: italic;
  color: #c8c8d0;
}

.message-bubble.narration {
  border-left: 3px solid #50dca0;
  font-style: italic;
  color: #90d8b0;
}

.message.user {
  align-self: flex-end;
  align-items: flex-end;
}

.message.assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.error-bubble {
  border-left: 3px solid #ff5252 !important;
  background: rgba(255, 82, 82, 0.08);
}

.retry-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 4px 14px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 8px;
  font-family: inherit;
}

.retry-btn:hover {
  background: var(--accent-hover);
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

/* ── Input Area ── */

.chat-input-area {
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mode-selector {
  display: flex;
  gap: 4px;
  background: var(--bg-deep);
  padding: 4px;
  border-radius: var(--radius-sm);
  width: fit-content;
}

.mode-btn {
  background: none;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: inherit;
}

.mode-btn:hover {
  color: var(--fg);
  background: var(--surface-2);
}

.mode-btn.active {
  background: var(--surface);
  color: var(--fg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.mode-label {
  display: none;
}

@media (min-width: 600px) {
  .mode-label { display: inline; }
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-row input {
  flex: 1;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 14px;
  color: var(--fg);
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.input-row input:focus {
  border-color: var(--accent);
}

.input-row input:disabled {
  opacity: 0.5;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
}

.send-btn:hover { background: var(--accent-hover); }
.send-btn:disabled { opacity: 0.4; cursor: default; }

.primary-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}

.primary-btn:hover { background: var(--accent-hover); }

/* ── Mobile responsive ── */
@media (max-width: 639px) {
  .chat-input-area {
    padding: 10px 10px 12px;
  }
  .mode-selector {
    width: 100%;
  }
  .mode-btn {
    flex: 1;
    justify-content: center;
    padding: 8px 6px;
    font-size: 11px;
  }
  .input-row input {
    font-size: 16px; /* prevent iOS zoom */
    padding: 12px 12px;
  }
  .char-avatar-lg {
    font-size: 48px;
  }
  .char-role-hint {
    max-width: 280px;
    font-size: 12px;
  }
  .message {
    max-width: 92%;
  }
  .message-bubble {
    padding: 10px 12px;
  }
  .msg-type-badge {
    font-size: 10px;
    padding: 1px 6px;
  }
}
</style>
