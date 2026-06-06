<template>
  <div class="pony-chat-layout">
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
          <!-- Image result -->
          <div v-if="msg.imageUrl" class="pony-msg-image">
            <img :src="msg.imageUrl" @click="previewImage(msg.imageUrl)" />
            <div v-if="msg.meta" class="pony-msg-image-meta">{{ msg.meta }}</div>
          </div>
          <!-- Text message -->
          <div v-else class="pony-msg-text">{{ msg.content }}</div>
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
      <textarea
        v-model="inputText"
        class="pony-chat-textarea"
        placeholder="Describe tu escena en español… Ej: dos chicas en una ducha, una arrodillada…"
        rows="2"
        @keydown.enter.prevent="handleEnter"
        :disabled="loading || generating"
      ></textarea>
      <div class="pony-chat-buttons">
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
import { ref, computed, nextTick } from 'vue'
import { useApi } from '../composables/useApi.js'
import { usePonyStore } from '../composables/usePonyStore.js'
import { composeTags, PONY_CATEGORIES } from '../config/ponyDiffusion.js'

const api = useApi()
const { ponyState, getConfigContext, getCurrentTagString, applyAiResponse } = usePonyStore()

const inputText = ref('')
const messages = ref([])
const loading = ref(false)
const generating = ref(false)
const showTagSummary = ref(true)
const chatRef = ref(null)

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

// ── Helpers ──

function scrollBottom() {
  nextTick(() => {
    if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
  })
}

// ── Chat with DeepSeek ──

async function sendMessage(text) {
  const msg = (text || inputText.value).trim()
  if (!msg || loading.value || generating.value) return

  messages.value.push({ role: 'user', content: msg })
  inputText.value = ''
  loading.value = true
  scrollBottom()

  try {
    const configContext = getConfigContext()
    const curTags = getCurrentTagString()
    const res = await api.ponyChat(
      messages.value.map(m => ({ role: m.role, content: m.content })),
      { configContext, currentTags: curTags }
    )

    const summary = applyAiResponse(res.text)

    let displayText = res.text
    const changes = []
    if (summary.changed.length) changes.push(`${summary.changed.length} categoría(s) actualizada(s)`)
    if (summary.rawTagsAdded.length) changes.push(`${summary.rawTagsAdded.length} raw tag(s) añadida(s)`)
    if (summary.negativePromptChanged) changes.push('negative prompt actualizado')
    if (changes.length) displayText += `\n\n✅ Tags aplicadas al configurador: ${changes.join(', ')}.`

    messages.value.push({ role: 'assistant', content: displayText })
  } catch (e) {
    messages.value.push({ role: 'assistant', content: `Error: ${e.message}` })
  } finally {
    loading.value = false
    scrollBottom()
  }
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

.btn-label {
  display: inline;
}

@media (max-width: 600px) {
  .btn-label {
    display: none;
  }
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
