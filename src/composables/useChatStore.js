import { reactive, computed, toRef } from 'vue'
import { MODELS } from '../config/models.js'

/**
 * Single reactive state object — no module-level refs, no watchers.
 * Current-model messages derived via computed.
 * Nothing shared between ref and store (no circular deps).
 */

const modelKeys = new Set(MODELS.map((m) => m.key))

function getModelFromUrl() {
  const p = new URLSearchParams(location.search)
  const m = p.get('model')
  return m && modelKeys.has(m) ? m : null
}

function syncModelToUrl(model) {
  const url = new URL(location)
  url.searchParams.set('model', model)
  history.replaceState({}, '', url)
}

const initialModel = getModelFromUrl() || MODELS[0].key
if (!getModelFromUrl()) syncModelToUrl(initialModel)

const store = reactive({
  currentModel: initialModel,
  /** Record<modelKey, Message[]> */
  messageMap: {},
})

// Seed initial model
if (!store.messageMap[initialModel]) {
  store.messageMap[initialModel] = []
}

export function useChatStore() {
  /**
   * Computed — reads from reactive store at access time.
   * When currentModel changes this re-evaluates → returns the correct model's array.
   * Adding messages mutates the reactive array (triggers template re-render).
   * No shared references between different sources of truth.
   */
  const messages = computed(() => store.messageMap[store.currentModel] || [])

  /** Expose currentModel as a ref-like for template auto-unwrap */
  const currentModel = toRef(store, 'currentModel')

  /* ── Actions ── */

  function setModel(model) {
    if (!modelKeys.has(model) || model === store.currentModel) return
    store.currentModel = model
    if (!store.messageMap[model]) {
      store.messageMap[model] = []
    }
    syncModelToUrl(model)
  }

  function addMessage(msg) {
    const arr = store.messageMap[store.currentModel]
    if (arr) arr.push(msg)
  }

  function newChat() {
    store.messageMap[store.currentModel] = []
  }

  function hasMessages() {
    const arr = store.messageMap[store.currentModel]
    return Boolean(arr && arr.length)
  }

  return {
    currentModel,
    setModel,
    messages,
    addMessage,
    newChat,
    hasMessages,
  }
}
