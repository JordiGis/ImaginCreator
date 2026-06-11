<template>
  <div class="view-container active" style="position: relative; height: 100%;">
    <!-- Header -->
    <div class="view-header char-header">
      <div class="char-info" @click="router.push('/characters')">
        <button class="back-btn" title="Volver">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l-6 6 6 6"/></svg>
        </button>
        <span v-if="character?.avatarUrl" class="char-head-img">
          <img :src="character.avatarUrl" :alt="character.name" />
        </span>
        <span v-else class="char-head-emoji">{{ character?.avatar }}</span>
        <div class="char-head-text">
          <h2>{{ character?.name || 'Cargando...' }}</h2>
          <span class="char-head-status">{{ generating ? 'escribiendo...' : 'en línea' }}</span>
        </div>
      </div>
      <button class="header-action-btn" @click="resetChat" title="Nueva conversación">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14.5 2l3 3-11 11H3v-3.5L14.5 2z"/></svg>
      </button>
    </div>

    <!-- Messages -->
    <div class="chat-messages" ref="chatRef">
      <!-- Empty state -->
      <div v-if="messages.length === 0" class="empty-state">
        <div class="char-card-empty">
          <div class="char-card-ring">
            <img v-if="character?.avatarUrl" :src="character.avatarUrl" :alt="character.name" class="char-card-img" />
            <span v-else class="char-card-emoji">{{ character?.avatar }}</span>
          </div>
          <h3>{{ character?.name }}</h3>
          <p class="char-card-desc">{{ greetingPreview }}</p>
        </div>
        <button class="start-chat-btn" @click="sendGreeting">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M10 3v14M3 10l7 7 7-7"/></svg>
          Empezar conversación
        </button>
      </div>

      <!-- Messages list -->
      <div
        v-for="(msg, idx) in messages"
        :key="msg._key || idx"
        :class="['msg-row', msg.role, { 'same-speaker': idx > 0 && messages[idx-1].role === msg.role }]"
      >
        <div class="msg-avatar" v-if="msg.role === 'assistant' && (idx === 0 || messages[idx-1].role !== msg.role)">
          <img v-if="character?.avatarUrl" :src="character.avatarUrl" :alt="character.name" class="msg-avatar-img" />
          <span v-else class="msg-avatar-emoji">{{ character?.avatar }}</span>
        </div>
        <div class="msg-avatar" v-else-if="msg.role === 'assistant'">&nbsp;</div>
        <div class="msg-avatar user-avatar" v-if="msg.role === 'user' && (idx === 0 || messages[idx-1].role !== msg.role)">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="7" r="3"/><path d="M3 17c0-4 3.14-6 7-6s7 2 7 6"/></svg>
        </div>
        <div class="msg-body">
          <div class="msg-bubble">
            <div class="msg-text">
              <span
                v-for="(seg, si) in parseRaw(msg)"
                :key="si"
                :class="'seg-' + seg.type"
              >{{ seg.display }}</span>
            </div>
            <div v-if="msg.imageUrl" class="msg-scene-image-container">
              <img :src="msg.imageUrl" alt="escena generada" class="msg-scene-image" @click="openImage(msg.imageUrl)" />
              <div class="msg-scene-image-overlay" @click="openImage(msg.imageUrl)">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 3v14M3 10l7 7 7-7"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Generating indicator -->
      <div v-if="generating" class="msg-row assistant">
        <div class="msg-avatar">
          <img v-if="character?.avatarUrl" :src="character.avatarUrl" :alt="character.name" class="msg-avatar-img" />
          <span v-else class="msg-avatar-emoji">{{ character?.avatar }}</span>
        </div>
        <div class="msg-body">
          <div class="msg-bubble typing-bubble">
            <div class="typing-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scene image generation indicator -->
      <div v-if="generatingSceneImage" class="msg-row assistant">
        <div class="msg-avatar">
          <span class="msg-avatar-emoji">🎨</span>
        </div>
        <div class="msg-body">
          <div class="msg-bubble">
            <div class="img-gen-indicator">
              <span class="typing-dots" style="display: inline-flex; gap: 3px; margin-right: 8px;">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </span>
              <span>🎨 generando imagen de la escena...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="msg-row assistant">
        <div class="msg-avatar">
          <svg viewBox="0 0 20 20" fill="none" stroke="#ff5252" stroke-width="1.5" style="width: 20px;"><circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 13v1"/></svg>
        </div>
        <div class="msg-body">
          <div class="msg-bubble error-bubble">
            <div class="error-text">{{ error }}</div>
            <button class="retry-btn" @click="retryLastMessage">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px;"><path d="M2 10a8 8 0 0114.73-4M18 2v4h-4"/><path d="M18 10a8 8 0 01-14.73 4M2 18v-4h4"/></svg>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="chat-input-area">
      <div class="fmt-buttons">
        <button class="fmt-btn speech" @click="insertFmt('speech')" :disabled="generating">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px;"><path d="M6 5.5a4 4 0 118 0v2a4 4 0 01-8 0v-2z"/><path d="M3 9.5a7 7 0 0114 0M10 16v3"/></svg>
          <span class="fmt-label">" "</span>
        </button>
        <button class="fmt-btn thought" @click="insertFmt('thought')" :disabled="generating">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px;"><circle cx="10" cy="10" r="6"/><path d="M10 7v3l2 2"/></svg>
          <span class="fmt-label">( )</span>
        </button>
        <button class="fmt-btn narration" @click="insertFmt('narration')" :disabled="generating">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px;"><path d="M4 16l4-12M10 16l4-12"/></svg>
          <span class="fmt-label">* *</span>
        </button>
      </div>
      <div class="scene-action-row">
        <button
          class="scene-img-btn"
          @click="generateSceneImage"
          :disabled="generating || generatingSceneImage || messages.length === 0"
          :title="generatingSceneImage ? 'Generando imagen...' : 'Generar imagen de la escena actual con Pony'"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="16" height="14" rx="2"/><circle cx="7.5" cy="8.5" r="1.5"/><path d="M2 14l4.5-4.5 3 3 3-3L18 15"/></svg>
          <span v-if="generatingSceneImage">🎨 Generando escena...</span>
          <span v-else>🎨 Escena → Imagen Pony</span>
        </button>
      </div>
      <div class="input-row">
        <textarea
          ref="inputRef"
          v-model="inputText"
          class="chat-textarea"
          placeholder='Escribe aquí... Enter = salto de línea, Ctrl+Enter = enviar. Usa "texto" hablar, (texto) pensar, *texto* narrar'
          @keydown="handleKeydown"
          :disabled="generating"
          rows="1"
          @input="autoResizeTextarea"
        ></textarea>
        <button
          class="send-btn"
          @click="sendMessage"
          :disabled="!inputText.trim() || generating"
          title="Enviar mensaje"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17V3M3 10l7-7 7 7"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const character = ref(null)
const messages = ref([])
const inputText = ref('')
const generating = ref(false)
const error = ref('')
const generatingSceneImage = ref(false)
const chatRef = ref(null)
const inputRef = ref(null)
let msgCounter = 0

const STORAGE_KEY_PREFIX = 'ichar-msg-'

// Greeting preview for empty state
const greetingPreview = computed(() => {
  if (!character.value?.greeting) return 'No hay saludo disponible.'
  const stripped = character.value.greeting
    .replace(/\*[^*]*\*/g, '')
    .replace(/"[^"]*"/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return stripped.slice(0, 100) + (stripped.length > 100 ? '…' : '')
})

// Parse raw text into display segments for mixed-type rendering
function parseRaw(msg) {
  const raw = msg.raw || msg.content || ''
  if (!msg.raw && msg.type && msg.content) {
    return [{ type: msg.type, display: msg.content }]
  }
  const segments = []
  const re = /"([^"]*)"|\(([^)]*)\)|\*([^*]*)\*/g
  let last = 0, m
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) {
      const plain = raw.slice(last, m.index).trim()
      if (plain) segments.push({ type: 'speech', display: plain })
    }
    if (m[1] !== undefined) segments.push({ type: 'speech', display: m[1] })
    else if (m[2] !== undefined) segments.push({ type: 'thought', display: '(' + m[2] + ')' })
    else if (m[3] !== undefined) segments.push({ type: 'narration', display: '*' + m[3] + '*' })
    last = m.index + m[0].length
  }
  if (last < raw.length) {
    const rest = raw.slice(last).trim()
    if (rest) segments.push({ type: 'speech', display: rest })
  }
  return segments.length ? segments : [{ type: 'speech', display: raw }]
}

function autoResizeTextarea() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

// Enter = newline, Ctrl/Cmd+Enter = send
function handleKeydown(e) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    sendMessage()
  }
}

// Insert delimiter pair at cursor in textarea
function insertFmt(type) {
  const el = inputRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const sel = inputText.value.slice(start, end)
  let pre = '', post = ''
  if (type === 'speech') { pre = '"'; post = '"' }
  else if (type === 'thought') { pre = '('; post = ')' }
  else if (type === 'narration') { pre = '*'; post = '*' }
  const wrapped = pre + (sel || '') + post
  inputText.value = inputText.value.slice(0, start) + wrapped + inputText.value.slice(end)
  const cursor = start + pre.length + (sel ? sel.length : 0)
  nextTick(() => { el.focus(); el.setSelectionRange(cursor, cursor); autoResizeTextarea() })
}

function detectType(text) {
  if (text.startsWith('"') && text.endsWith('"')) return { type: 'speech', content: text.slice(1, -1) }
  if (text.startsWith('(') && text.endsWith(')')) return { type: 'thought', content: text.slice(1, -1) }
  if (text.startsWith('*') && text.endsWith('*')) return { type: 'narration', content: text.slice(1, -1) }
  if (text.startsWith('*')) return { type: 'narration', content: text }
  if (text.startsWith('"')) return { type: 'speech', content: text }
  if (text.startsWith('(')) return { type: 'thought', content: text }
  return { type: 'speech', content: text }
}

function genKey() { return 'm_' + (++msgCounter) + '_' + Date.now() }

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
    restoreMessages(id)
    if (messages.value.length === 0 && found.greeting) {
      const detected = detectType(found.greeting)
      messages.value.push({
        _key: genKey(),
        role: 'assistant',
        type: detected.type,
        content: detected.content,
        raw: found.greeting,
      })
      saveMessages(id)
    }
    scrollBottom()
  } catch (e) {
    console.error('Failed to load character', e)
    router.replace('/characters')
  }
}

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
    if (character.value.greeting) {
      const detected = detectType(character.value.greeting)
      messages.value.push({
        _key: genKey(),
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

function scrollBottom(smooth) {
  nextTick(() => {
    if (chatRef.value) {
      chatRef.value.scrollTo({
        top: chatRef.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  })
}

function focusInput() {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function sendGreeting() {
  if (messages.value.length > 0) return
  if (character.value?.greeting) {
    const detected = detectType(character.value.greeting)
    messages.value.push({
      _key: genKey(),
      role: 'assistant',
      type: detected.type,
      content: detected.content,
      raw: character.value.greeting,
    })
    saveMessages(character.value.id)
  }
  focusInput()
  scrollBottom(true)
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || generating.value || !character.value) return

  error.value = ''

  messages.value.push({
    _key: genKey(),
    role: 'user',
    raw: text,
  })
  inputText.value = ''
  saveMessages(character.value.id)
  scrollBottom(true)
  if (inputRef.value) { inputRef.value.style.height = 'auto' }

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
      _key: genKey(),
      role: 'assistant',
      type: detected.type,
      content: detected.content,
      raw: aiText,
    })
    saveMessages(character.value.id)
    scrollBottom(true)
  } catch (e) {
    error.value = e.message
  } finally {
    generating.value = false
    focusInput()
  }
}

const openImage = (url) => window.open(url, '_blank')

async function generateSceneImage() {
  if (messages.value.length === 0 || generatingSceneImage.value || !character.value?.id) return
  error.value = ''
  generatingSceneImage.value = true
  try {
    const recentMessages = messages.value.slice(-10).map(m => ({
      role: m.role,
      content: m.raw || m.content || '',
    }))
    const sceneRes = await fetch('/api/pony/scene-to-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: recentMessages,
        characterName: character.value?.name,
        characterAppearance: character.value?.appearance || '',
      }),
    })
    const sceneData = await sceneRes.json()
    if (!sceneRes.ok || !sceneData.prompt) throw new Error(sceneData.error || 'Error al generar prompt de escena')
    const prompt = sceneData.prompt
    const imgRes = await fetch('/api/pony/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    const imgData = await imgRes.json()
    if (!imgRes.ok) throw new Error(imgData.error || 'Error al generar imagen')
    const imgUrl = imgData.imageUrl || imgData.dataUrl
    messages.value.push({
      _key: genKey(),
      role: 'assistant',
      type: 'narration',
      raw: '*🎨 Ilustración de la escena*',
      imageUrl: imgUrl,
    })
    saveMessages(character.value.id)
    scrollBottom(true)
  } catch (e) {
    error.value = e.message
  } finally {
    generatingSceneImage.value = false
    focusInput()
  }
}

async function retryLastMessage() {
  if (messages.value.length < 1) return
  const lastMsg = messages.value[messages.value.length - 1]
  if (lastMsg.role === 'user') {
    error.value = ''
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
        _key: genKey(),
        role: 'assistant',
        type: detected.type,
        content: detected.content,
        raw: aiText,
      })
      saveMessages(character.value.id)
      scrollBottom(true)
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
/* ── Header ── */
.char-header {
  padding: 0 16px;
}

.char-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 0;
  flex: 1;
}

.back-btn {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: var(--surface-2);
  color: var(--fg);
}

.char-head-img img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--accent);
  flex-shrink: 0;
}

.char-head-emoji {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
}

.char-head-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.char-head-text h2 {
  font-size: 15px;
  font-weight: 600;
  color: var(--fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  line-height: 1.3;
}

.char-head-status {
  font-size: 11px;
  color: var(--muted);
  line-height: 1;
}

.header-action-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.header-action-btn:hover {
  background: var(--surface-2);
  color: var(--fg);
  border-color: var(--border);
}

/* ── Chat Messages Container ── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scroll-behavior: smooth;
}

/* ── Empty State ── */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px 24px;
  text-align: center;
  animation: fadeIn 0.4s ease-out;
}

.char-card-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.char-card-ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid var(--accent);
  padding: 4px;
  box-shadow: 0 0 30px rgba(255, 82, 130, 0.15);
  animation: pulse-ring 3s ease-in-out infinite;
}

.char-card-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.char-card-emoji {
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.char-card-empty h3 {
  font-size: 22px;
  font-weight: 600;
  color: var(--fg);
  margin: 0;
}

.char-card-desc {
  font-size: 13px;
  color: var(--muted);
  max-width: 340px;
  line-height: 1.5;
  margin: 0;
}

.start-chat-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.start-chat-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 82, 130, 0.3);
}

.start-chat-btn:active {
  transform: translateY(0);
}

/* ── Message Rows ── */
.msg-row {
  display: flex;
  gap: 8px;
  max-width: clamp(300px, 75%, 680px);
  animation: msgIn 0.25s ease-out;
}

.msg-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-row.same-speaker {
  margin-top: 2px;
}

.msg-avatar {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.msg-avatar-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

.msg-avatar-emoji {
  font-size: 20px;
  line-height: 1;
}

.user-avatar svg {
  width: 20px;
  height: 20px;
  color: var(--muted);
  opacity: 0.6;
}

.msg-body {
  min-width: 0;
  flex: 1;
}

/* ── Message Bubbles ── */
.msg-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  max-width: 100%;
  word-break: break-word;
  line-height: 1.5;
  font-size: 14px;
}

.msg-row.assistant .msg-bubble {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}

.msg-row.user .msg-bubble {
  background: linear-gradient(135deg, var(--accent) 0%, #ff3d6f 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.msg-row.same-speaker.assistant .msg-bubble {
  border-top-left-radius: 8px;
}

.msg-row.same-speaker.user .msg-bubble {
  border-top-right-radius: 8px;
}

.msg-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

/* ── Segment Styles ── */
.seg-speech {
  color: #b0d8ff;
}

.seg-speech::before { content: '\201c'; opacity: 0.45; }
.seg-speech::after { content: '\201d'; opacity: 0.45; }

.msg-row.user .seg-speech {
  color: rgba(255, 255, 255, 0.95);
}

.msg-row.user .seg-speech::before,
.msg-row.user .seg-speech::after {
  opacity: 0.5;
}

.seg-thought {
  color: #c88cff;
  font-style: italic;
}

.seg-narration {
  color: #50dca0;
  font-style: italic;
}

.msg-row.user .seg-narration {
  color: rgba(255, 255, 255, 0.8);
}

.msg-row.user .seg-thought {
  color: rgba(200, 140, 255, 0.9);
}

/* ── Typing Indicator ── */
.typing-bubble {
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typing-dots {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--muted);
  animation: typingBounce 1.4s ease-in-out infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

/* ── Error ── */
.error-bubble {
  border: 1px solid rgba(255, 82, 82, 0.3);
  background: rgba(255, 82, 82, 0.08);
  border-bottom-left-radius: 4px;
}

.error-text {
  color: #ff6b6b;
  font-size: 13px;
  white-space: pre-wrap;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 82, 82, 0.15);
  color: #ff6b6b;
  border: 1px solid rgba(255, 82, 82, 0.2);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.15s;
  font-family: inherit;
}

.retry-btn:hover {
  background: rgba(255, 82, 82, 0.25);
}

/* ── Input Area ── */
.chat-input-area {
  padding: 8px 16px 12px;
  border-top: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fmt-buttons {
  display: flex;
  gap: 4px;
}

.fmt-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.fmt-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-subtle);
}

.fmt-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.fmt-btn.speech:hover:not(:disabled) {
  border-color: #b0d8ff;
  color: #b0d8ff;
  background: rgba(176, 216, 255, 0.06);
}

.fmt-btn.thought:hover:not(:disabled) {
  border-color: #c88cff;
  color: #c88cff;
  background: rgba(200, 140, 255, 0.06);
}

.fmt-btn.narration:hover:not(:disabled) {
  border-color: #50dca0;
  color: #50dca0;
  background: rgba(80, 220, 160, 0.06);
}

.fmt-label {
  font-size: 11px;
  opacity: 0.7;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.chat-textarea {
  flex: 1;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--fg);
  font-family: inherit;
  outline: none;
  resize: none;
  line-height: 1.5;
  max-height: 120px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.chat-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(255, 82, 130, 0.08);
}

.chat-textarea:disabled {
  opacity: 0.5;
}

.chat-textarea::placeholder {
  color: var(--muted);
  opacity: 0.5;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: var(--accent);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: scale(1.05);
  box-shadow: 0 2px 12px rgba(255, 82, 130, 0.35);
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

/* ── Scene image generation ── */
.scene-action-row {
  display: flex;
  gap: 6px;
}

.scene-img-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 6px 14px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  width: 100%;
  justify-content: center;
}

.scene-img-btn svg {
  width: 16px;
  height: 16px;
}

.scene-img-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-subtle);
}

.scene-img-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.img-gen-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
  padding: 4px 0;
}

.msg-scene-image-container {
  position: relative;
  margin-top: 10px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  line-height: 0;
}

.msg-scene-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--border);
  transition: transform 0.2s;
}

.msg-scene-image-container:hover .msg-scene-image {
  transform: scale(1.02);
}

.msg-scene-image-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}

.msg-scene-image-container:hover .msg-scene-image-overlay {
  opacity: 1;
}

.msg-scene-image-overlay svg {
  width: 14px;
  height: 14px;
}

/* ── Scrollbar ── */
.chat-messages::-webkit-scrollbar {
  width: 5px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--muted);
}

/* ── Animations ── */
@keyframes msgIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

@keyframes pulse-ring {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 82, 130, 0.1);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 82, 130, 0.2);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ── Mobile Responsive ── */
@media (max-width: 639px) {
  .chat-messages {
    padding: 16px 10px;
  }
  .msg-row {
    max-width: 92%;
  }
  .msg-bubble {
    padding: 9px 12px;
    font-size: 15px;
    border-radius: 14px;
  }
  .msg-row.assistant .msg-bubble {
    border-bottom-left-radius: 3px;
  }
  .msg-row.user .msg-bubble {
    border-bottom-right-radius: 3px;
  }
  .chat-input-area {
    padding: 8px 10px 10px;
  }
  .chat-textarea {
    font-size: 16px;
    padding: 8px 12px;
    border-radius: 12px;
  }
  .char-head-img img {
    width: 30px;
    height: 30px;
  }
  .char-card-ring {
    width: 80px;
    height: 80px;
  }
  .char-card-emoji {
    font-size: 36px;
  }
  .char-card-empty h3 {
    font-size: 18px;
  }
}

/* fix view-header padding from global */
.char-header {
  padding: 0 16px !important;
}
</style>
