export const MODELS = [
  { key: 'riverflow-fast', id: 'sourceful/riverflow-v2-fast',  cost: 0.02,  label: 'Riverflow V2 Fast', desc: 'Rápido, $0.02/img' },
  { key: 'recraft-v41',   id: 'recraft/recraft-v4.1-utility',  cost: 0.04,  label: 'Recraft V4.1', desc: 'General, $0.04/img' },
  { key: 'recraft-vector',id: 'recraft/recraft-v4-vector',     cost: 0.08,  label: 'Recraft V4 Vector', desc: 'SVG, $0.08/img' },
]

export function getModel(key) {
  return MODELS.find((m) => m.key === key) || MODELS[0]
}
