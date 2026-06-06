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

  async function ponyGenerate(prompt, negativePrompt, params = {}, image = null) {
    const res = await fetch('/api/pony/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, negativePrompt, params, image })
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
        currentTags: options.currentTags || '',
        images: options.images || []
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

  async function videoGenerate(image, positive_prompt, options = {}) {
    const res = await fetch('/api/pony/video/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image,
        positive_prompt,
        negative_prompt: options.negative_prompt || '',
        seed: options.seed,
        steps: options.steps,
        cfg: options.cfg,
        num_frames: options.num_frames
      })
    })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { throw new Error(text || `Error ${res.status}`) }
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
    return data
  }

  async function checkVideoStatus(promptId) {
    const res = await fetch(`/api/pony/video/status/${promptId}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
    return data
  }

  return { generating, generateImage, fetchImages, fetchStats, checkCache, translatePrompt, ponyGenerate, ponyChat, videoGenerate, checkVideoStatus }
}
