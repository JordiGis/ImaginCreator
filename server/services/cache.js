// Prompt cache service — avoid duplicate API calls
import { checkCache, getCachedImage } from './storage.js'

// Model config from OpenRouter
const MODELS = {
  'flux-2-klein': { id: 'black-forest-labs/flux.2-klein-4b', cost: 0.002, label: 'Flux.2 Klein 4B' },
  'flux-dev': { id: 'black-forest-labs/flux-dev', cost: 0.003, label: 'Flux Dev' },
  'flux-pro': { id: 'black-forest-labs/flux-1.1-pro', cost: 0.005, label: 'Flux 1.1 Pro' },
  'sd-3.5': { id: 'stabilityai/stable-diffusion-3.5-large', cost: 0.004, label: 'SD 3.5 Large' }
}

export function getModel(modelKey) {
  return MODELS[modelKey] || MODELS['flux-2-klein']
}

export function getAllModels() {
  return Object.entries(MODELS).map(([key, m]) => ({ key, ...m }))
}

export function checkPromptCache(prompt, modelKey) {
  const model = getModel(modelKey)
  const cached = checkCache(prompt, model.id)
  if (cached) {
    const dataUrl = getCachedImage(cached.hash)
    if (dataUrl) {
      return {
        hit: true,
        dataUrl,
        hash: cached.hash,
        age: cached.age
      }
    }
  }
  return { hit: false }
}
