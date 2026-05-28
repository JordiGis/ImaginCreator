import { ref, computed } from 'vue'
import { MODELS } from '../config/models.js'

const totalCost = ref(0)
const totalTokens = ref(0)
const totalImages = ref(0)
const dailyLimit = ref(0)
const weeklyLimit = ref(0)
const imageHistory = ref([])

export function useCreditTracker() {
  async function loadStats() {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      totalCost.value = data.stats?.totalCost || 0
      totalTokens.value = data.stats?.totalTokens || 0
      totalImages.value = data.stats?.totalImages || 0
      dailyLimit.value = data.limits?.daily || 0
      weeklyLimit.value = data.limits?.weekly || 0
    } catch {}
  }

  function addGeneration({ cost, usage, images, model, prompt }) {
    totalCost.value += parseFloat(cost || 0)
    totalTokens.value += (usage?.prompt || 0) + (usage?.output || 0)
    totalImages.value += (images || []).length
  }

  const estimatedCost = (modelKey) => {
    const model = MODELS.find((m) => m.key === modelKey) || MODELS[0]
    return model.cost
  }

  const dailyRemaining = computed(() => {
    if (dailyLimit.value <= 0) return Infinity
    return Math.max(0, dailyLimit.value - totalCost.value)
  })

  const weeklyRemaining = computed(() => {
    if (weeklyLimit.value <= 0) return Infinity
    return Math.max(0, weeklyLimit.value - totalCost.value)
  })

  return {
    totalCost,
    totalTokens,
    totalImages,
    dailyLimit,
    weeklyLimit,
    dailyRemaining,
    weeklyRemaining,
    estimatedCost,
    loadStats,
    addGeneration
  }
}
