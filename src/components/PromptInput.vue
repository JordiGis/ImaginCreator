<template>
  <div class="input-area">
    <div class="cost-preview">
      <span class="cost-label">Coste estimado:</span>
      <span class="cost-value">${{ estimatedCost.toFixed(4) }}</span>
      <span v-if="hasCache" class="cache-badge">🆓 En caché</span>
    </div>
    <div class="input-row">
      <textarea
        ref="textareaRef"
        v-model="text"
        placeholder="Describe la imagen que quieres generar..."
        rows="1"
        :disabled="disabled"
        @keydown.enter.exact.prevent="send"
        @input="autoResize"
      ></textarea>
      <button
        :disabled="disabled || !text.trim()"
        @click="send"
      >
        <span v-if="disabled" class="spinner"></span>
        <span v-else>Generar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  estimatedCost: { type: Number, default: 0 },
  modelKey: { type: String, default: 'flux-2-klein' }
})

const emit = defineEmits(['send'])

const text = ref('')
const textareaRef = ref(null)
const hasCache = ref(false)

function autoResize() {
  const el = textareaRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }
}

async function send() {
  const trimmed = text.value.trim()
  if (!trimmed || props.disabled) return
  emit('send', trimmed)
  text.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

// Check cache as user types (debounced)
let debounceTimer = null
watch(text, (val) => {
  clearTimeout(debounceTimer)
  if (val.trim().length < 5) {
    hasCache.value = false
    return
  }
  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/check-cache?prompt=${encodeURIComponent(val.trim())}&model=${encodeURIComponent(props.modelKey)}`)
      const data = await res.json()
      hasCache.value = data.cached
    } catch {
      hasCache.value = false
    }
  }, 600)
})

// Reset cache check on model change
watch(() => props.modelKey, () => {
  hasCache.value = false
})

// Focus on mount
import { onMounted } from 'vue'
onMounted(() => textareaRef.value?.focus())
</script>

<style scoped>
.input-area {
  border-top: 1px solid var(--border);
  padding: 12px 20px 16px;
  background: var(--bg-secondary);
}

.cost-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}

.cost-label {
  color: var(--text-secondary);
}

.cost-value {
  color: var(--green);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.cache-badge {
  background: #1a3a1a;
  color: var(--green);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.input-row {
  display: flex;
  gap: 8px;
}

textarea {
  flex: 1;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  min-height: 44px;
  max-height: 160px;
  transition: border-color 0.15s;
}

textarea:focus {
  outline: none;
  border-color: var(--accent);
}

textarea:disabled {
  opacity: 0.6;
}

button {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
}

button:hover:not(:disabled) {
  background: var(--accent-hover);
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
