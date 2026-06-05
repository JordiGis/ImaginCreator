// Prompt cache service — avoid duplicate API calls
import { checkCache, getCachedImage } from './storage.js'

// Model config from OpenRouter
// maxTokens = max output tokens (model context minus safe margin for input)

const MODELS = {
  'flux-2-max':    { id: 'black-forest-labs/flux.2-max',  cost: 0.07,  label: 'Flux 2 Max',     maxTokens: 45000 },
  'flux-2-pro':    { id: 'black-forest-labs/flux.2-pro',  cost: 0.03,  label: 'Flux 2 Pro',     maxTokens: 45000 },
  'seedream-4.5':  { id: 'bytedance-seed/seedream-4.5',   cost: 0.04,  label: 'Seedream 4.5',  maxTokens: 45000 },
  'riverflow-fast': { id: 'sourceful/riverflow-v2-fast',  cost: 0.02,  label: 'Riverflow V2 Fast', maxTokens: 7000 },
  'riverflow-std': { id: 'sourceful/riverflow-v2-standard-preview', cost: 0.035, label: 'Riverflow V2 Std', maxTokens: 7000 },
  'recraft-v41':   { id: 'recraft/recraft-v4.1-utility',  cost: 0.04,  label: 'Recraft V4.1',  maxTokens: 64000 },
  'recraft-vector':{ id: 'recraft/recraft-v4-vector',     cost: 0.08,  label: 'Recraft V4 Vector', maxTokens: 64000 },
  'deepseek-chat': { id: 'deepseek/deepseek-chat', label: 'DeepSeek Flash', maxTokens: 32000, cost: 0 },
}

export function getModel(modelKey) {
  return MODELS[modelKey] || MODELS['flux-2-pro']
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
