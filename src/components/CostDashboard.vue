<template>
  <div class="cost-dashboard">
    <h3>Costes</h3>
    <div class="cost-item">
      <span class="label">Gasto total</span>
      <span class="value">${{ totalCost.toFixed(2) }}</span>
    </div>
    <div class="cost-item">
      <span class="label">Tokens</span>
      <span class="value">{{ formatTokens(totalTokens) }}</span>
    </div>
    <div class="cost-item">
      <span class="label">Imágenes</span>
      <span class="value">{{ totalImages }}</span>
    </div>
    <div v-if="hasLimits" class="cost-limits">
      <div class="limit-row">
        <span class="label">Diario restante</span>
        <span class="remaining">${{ dailyRemaining.toFixed(2) }} / ${{ dailyLimit.toFixed(2) }}</span>
      </div>
      <div class="limit-row">
        <span class="label">Semanal restante</span>
        <span class="remaining">${{ weeklyRemaining.toFixed(2) }} / ${{ weeklyLimit.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalCost: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  totalImages: { type: Number, default: 0 },
  dailyRemaining: { type: Number, default: Infinity },
  weeklyRemaining: { type: Number, default: Infinity },
  dailyLimit: { type: Number, default: 0 },
  weeklyLimit: { type: Number, default: 0 },
})

const hasLimits = computed(() =>
  props.dailyRemaining !== Infinity || props.weeklyRemaining !== Infinity
)

function formatTokens(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}
</script>

<style scoped>
.cost-dashboard {
  background: var(--surface-2);
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 24px;
}

.cost-dashboard h3 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin-bottom: 10px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.cost-item .label { color: var(--muted); }
.cost-item .value { font-weight: 500; color: var(--fg); }

.cost-limits {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.limit-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.limit-row .label { color: var(--muted); }
.limit-row .remaining { color: var(--success); font-weight: 500; }
</style>
