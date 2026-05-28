<template>
  <div class="cost-dashboard">
    <label class="section-label">Estadísticas</label>

    <div class="stat-row">
      <span class="stat-icon">🖼️</span>
      <div class="stat-info">
        <span class="stat-value">{{ totalImages }}</span>
        <span class="stat-label">Imágenes</span>
      </div>
    </div>

    <div class="stat-row">
      <span class="stat-icon">💰</span>
      <div class="stat-info">
        <span class="stat-value cost">${{ totalCost.toFixed(4) }}</span>
        <span class="stat-label">Gastado</span>
      </div>
    </div>

    <div class="stat-row">
      <span class="stat-icon">📊</span>
      <div class="stat-info">
        <span class="stat-value">{{ formatTokens(totalTokens) }}</span>
        <span class="stat-label">Tokens</span>
      </div>
    </div>

    <div v-if="hasLimits" class="limits-info">
      <div v-if="dailyRemaining !== Infinity" class="limit-row">
        <span>Límite diario</span>
        <span :class="limitClass(dailyRemaining)">${{ dailyRemaining.toFixed(4) }} restantes</span>
      </div>
      <div v-if="weeklyRemaining !== Infinity" class="limit-row">
        <span>Límite semanal</span>
        <span :class="limitClass(weeklyRemaining)">${{ weeklyRemaining.toFixed(4) }} restantes</span>
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
  weeklyRemaining: { type: Number, default: Infinity }
})

const hasLimits = computed(() =>
  props.dailyRemaining !== Infinity || props.weeklyRemaining !== Infinity
)

function formatTokens(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function limitClass(remaining) {
  if (remaining <= 0) return 'limit-exceeded'
  if (remaining < 0.02) return 'limit-low'
  return 'limit-ok'
}
</script>

<style scoped>
.cost-dashboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  font-weight: 600;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--bg-primary);
  border-radius: 6px;
}

.stat-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
}

.stat-value.cost { color: var(--green); }

.stat-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.limits-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  background: var(--bg-primary);
  border-radius: 6px;
  font-size: 11px;
}

.limit-row {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
}

.limit-ok { color: var(--green); }
.limit-low { color: #ff9800; }
.limit-exceeded { color: #f44336; }
</style>
