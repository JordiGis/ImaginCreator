import { reactive, computed, toRef } from 'vue'
import { MODELS } from '../config/models.js'

const modelKeys = new Set(MODELS.map((m) => m.key))

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

function loadSessions() {
  try {
    const data = localStorage.getItem('imagin-chat-sessions')
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('Failed to load chat sessions', e)
  }
  return []
}

function saveSessions(sessions) {
  try {
    localStorage.setItem('imagin-chat-sessions', JSON.stringify(sessions))
  } catch (e) {
    console.error('Failed to save chat sessions', e)
  }
}

const store = reactive({
  currentModel: MODELS[0].key,
  currentSessionId: null,
  sessions: loadSessions(),
})

// Initialize with an empty session if none exists
if (store.sessions.length === 0) {
  const initialSession = {
    id: generateId(),
    title: 'Nuevo chat',
    model: MODELS[0].key,
    messages: [],
    updatedAt: Date.now()
  }
  store.sessions.push(initialSession)
  store.currentSessionId = initialSession.id
  saveSessions(store.sessions)
} else if (!store.currentSessionId) {
  // Sort by updatedAt descending
  store.sessions.sort((a, b) => b.updatedAt - a.updatedAt)
  store.currentSessionId = store.sessions[0].id
  store.currentModel = store.sessions[0].model || MODELS[0].key
}

export function useChatStore() {
  const currentSession = computed(() => {
    return store.sessions.find(s => s.id === store.currentSessionId) || store.sessions[0]
  })

  const messages = computed(() => currentSession.value?.messages || [])
  const currentModel = toRef(store, 'currentModel')
  const sessions = toRef(store, 'sessions')

  function setModel(model) {
    if (!modelKeys.has(model)) return
    store.currentModel = model
    if (currentSession.value) {
      currentSession.value.model = model
      currentSession.value.updatedAt = Date.now()
      saveSessions(store.sessions)
    }
  }

  function addMessage(msg) {
    if (currentSession.value) {
      currentSession.value.messages.push(msg)
      currentSession.value.updatedAt = Date.now()
      
      // Auto-generate title from first user message
      if (currentSession.value.messages.length === 1 && msg.role === 'user') {
        const text = msg.text || 'Imagen'
        currentSession.value.title = text.length > 30 ? text.substring(0, 30) + '...' : text
      }
      
      saveSessions(store.sessions)
    }
  }

  function newChat() {
    const newSession = {
      id: generateId(),
      title: 'Nuevo chat',
      model: store.currentModel,
      messages: [],
      updatedAt: Date.now()
    }
    store.sessions.unshift(newSession)
    store.currentSessionId = newSession.id
    saveSessions(store.sessions)
    return newSession.id
  }

  function loadSession(id) {
    const session = store.sessions.find(s => s.id === id)
    if (session) {
      store.currentSessionId = id
      if (session.model && modelKeys.has(session.model)) {
        store.currentModel = session.model
      }
      return true
    }
    return false
  }
  
  function deleteSession(id) {
    const index = store.sessions.findIndex(s => s.id === id)
    if (index !== -1) {
      store.sessions.splice(index, 1)
      if (store.sessions.length === 0) {
        newChat() // create at least one
      } else if (store.currentSessionId === id) {
        store.currentSessionId = store.sessions[0].id
        store.currentModel = store.sessions[0].model
      }
      saveSessions(store.sessions)
    }
  }

  function hasMessages() {
    return messages.value.length > 0
  }

  return {
    currentModel,
    setModel,
    messages,
    addMessage,
    newChat,
    hasMessages,
    sessions,
    loadSession,
    deleteSession,
    currentSessionId: toRef(store, 'currentSessionId')
  }
}
