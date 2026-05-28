export const MODELS = [
  { key: 'flux-2-klein', id: 'black-forest-labs/flux.2-klein-4b', cost: 0.002, label: 'Flux.2 Klein 4B', desc: 'Rápido y barato, buena calidad' },
  { key: 'flux-dev',     id: 'black-forest-labs/flux-dev',         cost: 0.003, label: 'Flux Dev',          desc: 'Calidad media, versátil' },
  { key: 'flux-pro',     id: 'black-forest-labs/flux-1.1-pro',     cost: 0.005, label: 'Flux 1.1 Pro',      desc: 'Alta calidad, más lento' },
  { key: 'sd-3.5',       id: 'stabilityai/stable-diffusion-3.5-large', cost: 0.004, label: 'SD 3.5 Large', desc: 'Stable Diffusion, buena calidad' },
]

export function getModel(key) {
  return MODELS.find((m) => m.key === key) || MODELS[0]
}
