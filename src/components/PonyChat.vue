<template>
  <div class="pony-chat-layout">
    <!-- ── Chat Messages ── -->
    <div class="pony-chat-messages" ref="chatRef">
      <div v-if="!messages.length" class="pony-chat-empty">
        <span class="empty-icon">🤖</span>
        <h3>Asistente de tags Pony</h3>
        <p>Pregúntame qué tags usar para tu escena NSFW.<br>Ej: <em>"chica pelirroja sumisa, atada, en un sótano"</em></p>
        <div class="suggested-prompts">
          <button v-for="s in suggestions" :key="s" class="suggestion-chip" @click="sendMessage(s)">
            {{ s }}
          </button>
        </div>
      </div>

      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['pony-msg', msg.role]"
      >
        <div class="pony-msg-bubble">
          <div class="pony-msg-text">{{ msg.content }}</div>
          <div v-if="msg.role === 'assistant'" class="pony-msg-actions">
            <button class="pony-msg-btn" @click="copyMsg(msg.content)" title="Copiar tags">
              📋 Copiar
            </button>
            <button class="pony-msg-btn" @click="applyTags(msg.content)" title="Enviar al configurador">
              ⚡ Aplicar al config
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="pony-msg assistant">
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
      <textarea
        v-model="inputText"
        class="pony-chat-textarea"
        placeholder="Describe tu escena en español… Ej: dos chicas en una ducha, una arrodillada…"
        rows="2"
        @keydown.enter.prevent="handleEnter"
        :disabled="loading"
      ></textarea>
      <button class="btn-send" @click="sendMessage" :disabled="loading || !inputText.trim()">
        <span v-if="loading" class="spinner"></span>
        <span v-else>Enviar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useApi } from '../composables/useApi.js'

const api = useApi()
const emit = defineEmits(['apply-tags'])

const inputText = ref('')
const messages = ref([])
const loading = ref(false)
const chatRef = ref(null)
const copiedIdx = ref(-1)

const suggestions = [
  'chica sumisa atada a una cama, vendada, con expresión de miedo y excitación',
  'hombre musculoso desnudo en la ducha, agua cayendo, plano detalle pectorales',
  'dos chicas en la cama, 69, una con medias de red y la otra con tanga',
  'futanari dominante con correa, sumisa a cuatro patas, ambiente mazmorra',
]

function scrollBottom() {
  nextTick(() => {
    if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
  })
}

async function sendMessage(text) {
  const msg = (text || inputText.value).trim()
  if (!msg || loading.value) return

  messages.value.push({ role: 'user', content: msg })
  inputText.value = ''
  loading.value = true
  scrollBottom()

  try {
    const res = await api.ponyChat(messages.value.map(m => ({ role: m.role, content: m.content })))
    messages.value.push({ role: 'assistant', content: res.text })
  } catch (e) {
    messages.value.push({ role: 'assistant', content: `Error: ${e.message}` })
  } finally {
    loading.value = false
    scrollBottom()
  }
}

function handleEnter(e) {
  if (e.shiftKey) return // allow newline with shift+enter
  sendMessage()
}

function copyMsg(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}

function applyTags(text) {
  emit('apply-tags', text)
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

/* Messages */
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

.pony-msg-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.pony-msg-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.pony-msg-btn:hover {
  border-color: #ff5282;
  color: #ff5282;
}

/* Typing indicator */
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

/* Input */
.pony-chat-input {
  display: flex;
  gap: 10px;
  padding: 16px 32px;
  border-top: 1px solid var(--border);
  background: var(--surface);
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

.btn-send {
  background: #7c3aed;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 14px;
  font-family: inherit;
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-send:hover:not(:disabled) {
  background: #8b5cf6;
}

.btn-send:disabled {
  opacity: 0.5;
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
  .pony-chat-messages,
  .pony-chat-input {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
}
</style>
