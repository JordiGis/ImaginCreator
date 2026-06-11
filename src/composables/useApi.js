import { ref } from 'vue'

const generating = ref(false)

export function useApi() {
  async function generateImage(prompt, modelKey, images = []) {
    generating.value = true
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelKey, images })
      })
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(text || `Error ${res.status}: servidor no disponible`)
      }
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      return data
    } finally {
      generating.value = false
    }
  }

  async function fetchImages() {
    const res = await fetch('/api/images')
    const data = await res.json()
    return data.images || []
  }

  async function fetchStats() {
    const res = await fetch('/api/stats')
    const data = await res.json()
    return data
  }

  async function checkCache(prompt, modelKey) {
    const res = await fetch(`/api/check-cache?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(modelKey)}`)
    const data = await res.json()
    return data
  }

  async function translatePrompt(text) {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Translation failed')
    return data.translated
  }

  async function ponyGenerate(prompt, negativePrompt, params = {}, images = []) {
    const res = await fetch('/api/pony/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, negativePrompt, params, images })
    })
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(text || `Error ${res.status}`)
    }
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
    return data
  }

  async function ponyChat(messages, options = {}) {
    const res = await fetch('/api/pony/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        configContext: options.configContext || '',
        currentTags: options.currentTags || ''
      })
    })
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(text || `Error ${res.status}`)
    }
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
    return data
  }

  return { generating, generateImage, fetchImages, fetchStats, checkCache, translatePrompt, ponyGenerate, ponyChat }
}
