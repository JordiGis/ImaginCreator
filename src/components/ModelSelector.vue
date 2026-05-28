<template>
  <div class="model-selector">
    <label class="section-label">Modelo</label>
    <div class="model-options">
      <button
        v-for="m in MODELS"
        :key="m.key"
        :class="['model-btn', { active: modelValue === m.key }]"
        @click="$emit('update:modelValue', m.key)"
      >
        <span class="model-name">{{ m.label }}</span>
        <span class="model-cost">${{ m.cost.toFixed(3) }}/img</span>
        <span class="model-desc">{{ m.desc }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { MODELS } from '../config/models.js'

defineProps({
  modelValue: { type: String, required: true }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.model-selector {
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

.model-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.model-btn {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  color: var(--text-primary);
  font-family: inherit;
}

.model-btn:hover {
  border-color: var(--accent);
  background: #1e1e30;
}

.model-btn.active {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.model-name {
  font-size: 13px;
  font-weight: 600;
}

.model-cost {
  font-size: 11px;
  color: var(--green);
  font-weight: 500;
}

.model-desc {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
