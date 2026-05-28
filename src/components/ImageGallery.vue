<template>
  <Teleport to="body">
    <Transition name="gallery">
      <div v-if="show" class="gallery-overlay">
        <div class="gallery-sidebar">
          <div class="gs-header">
            <h2>Galería</h2>
            <span class="gs-count">{{ images.length }}</span>
          </div>

          <div class="gs-info">
            <p class="gs-subtitle">Todas las imágenes generadas</p>
            <p v-if="stats.promptCount" class="gs-stat">
              <span>{{ stats.promptCount }} prompts</span>
              <span class="gs-dot">·</span>
              <span>{{ stats.modelCount }} modelos</span>
            </p>
          </div>

          <div class="gs-actions">
            <button class="gs-btn" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              Cerrar
            </button>
          </div>
        </div>

        <div class="gallery-main">
          <!-- Loading -->
          <div v-if="loading" class="gallery-loading">
            <div class="sk-grid">
              <div v-for="n in 12" :key="n" class="sk-card">
                <div class="sk-img"></div>
                <div class="sk-lines">
                  <div class="sk-line w-75"></div>
                  <div class="sk-line w-50"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="images.length === 0" class="gallery-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.3">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
            <p>Todavía no hay imágenes</p>
          </div>

          <!-- Grid -->
          <div v-else class="gallery-grid">
            <div
              v-for="(img, i) in images"
              :key="img.file || i"
              class="gallery-card"
              @click="$emit('preview', img.dataUrl || `/img/${img.file}`)"
            >
              <div class="gc-img-wrap">
                <img
                  :src="img.dataUrl || `/img/${img.file}`"
                  :alt="img.prompt || 'imagen'"
                  loading="lazy"
                />
                <div class="gc-overlay">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </div>
              </div>
              <div class="gc-body">
                <p class="gc-prompt" :title="img.prompt">{{ img.prompt || '(sin prompt)' }}</p>
                <div class="gc-meta">
                  <span class="gc-model">{{ img.model || '—' }}</span>
                  <span class="gc-sep">·</span>
                  <span class="gc-cost">${{ img.cost ? img.cost.toFixed(4) : '0' }}</span>
                  <span class="gc-sep">·</span>
                  <span class="gc-date">{{ formatDate(img.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'preview'])

const images = ref([])
const loading = ref(false)

const stats = computed(() => {
  const imgs = images.value
  if (!imgs.length) return {}
  const models = new Set(imgs.map((i) => i.model).filter(Boolean))
  return {
    promptCount: imgs.length,
    modelCount: models.size,
  }
})

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const today = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  if (today) return time
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'ayer ' + time
  return (
    d.toLocaleDateString('es', { day: 'numeric', month: 'short' }) +
    ' ' +
    time
  )
}

watch(
  () => props.show,
  async (val) => {
    if (!val) return
    loading.value = true
    try {
      const res = await fetch('/api/images')
      const data = await res.json()
      images.value = (data.images || []).reverse()
    } catch {
      images.value = []
    } finally {
      loading.value = false
    }
  }
)
</script>

<style scoped>
/* ── Overlay ── */
.gallery-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-deep, #08080e);
  z-index: 999;
  display: flex;
}

/* ── Sidebar ── */
.gallery-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-secondary, #12121e);
  border-right: 1px solid var(--border, #282840);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.gallery-sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient, linear-gradient(135deg, #7c5cfc, #9470ff));
}

.gs-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gs-header h2 {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.3px;
  background: var(--gradient, linear-gradient(135deg, #7c5cfc, #9470ff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gs-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #9494b8);
  background: var(--bg-tertiary, #1a1a2e);
  padding: 1px 10px;
  border-radius: 8px;
  line-height: 20px;
}

.gs-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gs-subtitle {
  font-size: 12px;
  color: var(--text-muted, #55557a);
  line-height: 1.4;
}

.gs-stat {
  font-size: 11px;
  color: var(--text-secondary, #9494b8);
  display: flex;
  gap: 4px;
  align-items: center;
}

.gs-dot {
  color: var(--border-light, #383858);
}

.gs-actions {
  margin-top: auto;
}

.gs-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-tertiary, #1a1a2e);
  border: 1px solid var(--border, #282840);
  border-radius: 10px;
  color: var(--text-primary, #eeeef8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.gs-btn:hover {
  border-color: var(--accent, #7c5cfc);
  background: var(--accent-bg, #1e1660);
  box-shadow: 0 0 20px var(--accent-glow, rgba(124, 92, 252, 0.15));
}

.gs-btn svg {
  opacity: 0.6;
}

/* ── Main area ── */
.gallery-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  position: relative;
}

.gallery-main::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle at 1px 1px,
    var(--border, #282840) 1px,
    transparent 0
  );
  background-size: 32px 32px;
  opacity: 0.2;
  pointer-events: none;
}

/* ── Loading skeleton ── */
.sk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.sk-card {
  background: var(--bg-secondary, #12121e);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border, #282840);
}

.sk-img {
  aspect-ratio: 1;
  background: var(--bg-tertiary, #1a1a2e);
  animation: skPulse 1.5s ease-in-out infinite;
}

.sk-lines {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-line {
  height: 10px;
  border-radius: 4px;
  background: var(--bg-tertiary, #1a1a2e);
  animation: skPulse 1.5s ease-in-out infinite;
}

.sk-line.w-75 { width: 75%; }
.sk-line.w-50 { width: 50%; }

@keyframes skPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* ── Empty state ── */
.gallery-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: var(--text-muted, #55557a);
}

.gallery-empty p {
  font-size: 14px;
}

/* ── Image grid ── */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 16px;
  position: relative;
  z-index: 1;
}

/* ── Card ── */
.gallery-card {
  background: var(--bg-secondary, #12121e);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border, #282840);
  cursor: pointer;
  transition: all 0.2s ease;
  animation: cardIn 0.25s ease-out both;
}

.gallery-card:hover {
  border-color: var(--accent, #7c5cfc);
  transform: translateY(-3px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 0 24px var(--accent-glow, rgba(124, 92, 252, 0.1));
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gc-img-wrap {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.gc-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-card:hover .gc-img-wrap img {
  transform: scale(1.05);
}

.gc-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.gc-overlay svg {
  color: #fff;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.gallery-card:hover .gc-overlay {
  background: rgba(0, 0, 0, 0.35);
}

.gallery-card:hover .gc-overlay svg {
  opacity: 1;
  transform: scale(1);
}

.gc-body {
  padding: 14px 16px;
}

.gc-prompt {
  font-size: 13px;
  color: var(--text-primary, #eeeef8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
  font-weight: 500;
}

.gc-meta {
  font-size: 11px;
  color: var(--text-muted, #55557a);
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.gc-model {
  background: var(--bg-tertiary, #1a1a2e);
  padding: 1px 7px;
  border-radius: 4px;
  color: var(--text-secondary, #9494b8);
  font-weight: 500;
}

.gc-sep {
  color: var(--border-light, #383858);
}

.gc-cost {
  color: var(--green, #00d4aa);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.gc-date {
  color: var(--text-muted, #55557a);
}

/* ── Transition ── */
.gallery-enter-active {
  transition: all 0.2s ease-out;
}

.gallery-leave-active {
  transition: all 0.15s ease-in;
}

.gallery-enter-from,
.gallery-leave-to {
  opacity: 0;
}

/* ── Scrollbar ── */
.gallery-main::-webkit-scrollbar {
  width: 6px;
}

.gallery-main::-webkit-scrollbar-track {
  background: transparent;
}

.gallery-main::-webkit-scrollbar-thumb {
  background: var(--bg-elevated, #22223a);
  border-radius: 3px;
}

.gallery-main::-webkit-scrollbar-thumb:hover {
  background: var(--border-light, #383858);
}
</style>
