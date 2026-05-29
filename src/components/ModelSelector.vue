<template>
  <div class="model-selector">
    <label>Modelo activo</label>
    <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
      <option v-for="m in MODELS" :key="m.key" :value="m.key">
        {{ m.label }} – ${{ m.cost.toFixed(3) }}/img
      </option>
    </select>
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
.model-selector { margin-bottom: 24px; }

.model-selector label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin-bottom: 6px;
  padding-left: 4px;
}

.model-selector select {
  width: 100%;
  padding: 8px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238a8a96' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.model-selector select:focus {
  outline: none;
  border-color: var(--accent);
}
</style>
