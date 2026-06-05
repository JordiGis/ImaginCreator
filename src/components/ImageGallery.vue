<template>
  <div class="gallery-view">
    <h2>Galería de imágenes</h2>

    <!-- Loading skeleton -->
    <div v-if="loading" class="loading-skeleton">
      <div v-for="n in 8" :key="n" class="sk-card">
        <div class="sk-img"></div>
        <div class="sk-prompt"></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="images.length === 0" class="gallery-empty">
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25">
        <rect x="10" y="10" width="40" height="40" rx="8"></rect>
        <circle cx="30" cy="28" r="8"></circle>
        <path d="M18 44l6-12 8 8 8-16 8 20"></path>
      </svg>
      <p>Todavía no hay imágenes generadas</p>
    </div>

    <!-- Grid -->
    <div v-else class="gallery-grid">
      <div
        v-for="(img, i) in images"
        :key="img.file || i"
        class="gallery-item"
        @click="openPreview(img)"
      >
        <img
          :src="img.dataUrl || `/img/${img.file}`"
          :alt="img.prompt || 'imagen'"
          loading="lazy"
        />
        <div class="gallery-prompt">{{ img.prompt || '(sin prompt)' }}</div>
      </div>
    </div>

    <!-- ===== Lightbox ===== -->
    <ImageModal :src="modalSrc" :show="modalOpen" @close="modalOpen = false" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import ImageModal from './ImageModal.vue'

const images = ref([])
const loading = ref(false)
const modalSrc = ref('')
const modalOpen = ref(false)

function openPreview(img) {
  modalSrc.value = img.dataUrl || `/img/${img.file}`
  modalOpen.value = true
}

async function fetchImages() {
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

onMounted(() => {
  fetchImages()
})
</script>

<style scoped>
.gallery-view {
  padding: 24px 32px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.gallery-view h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--fg);
}

/* Loading skeleton */
.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.sk-card {
  background: var(--surface-2);
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
}

.sk-img {
  aspect-ratio: 1;
  background: var(--surface);
  animation: pulse 1.5s ease-in-out infinite;
}

.sk-prompt {
  height: 32px;
  margin: 10px 12px;
  background: var(--surface);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* Empty */
.gallery-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--muted);
}

.gallery-empty svg {
  width: 72px;
  height: 72px;
}

.gallery-empty p {
  font-size: 15px;
}

/* Grid */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.gallery-item {
  background: var(--surface-2);
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
  position: relative;
  aspect-ratio: 1;
}

.gallery-item:hover {
  transform: scale(1.02);
  border-color: var(--accent);
  box-shadow: 0 0 25px rgba(79,140,255,0.1);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-prompt {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.85));
  color: #fff;
  padding: 32px 12px 10px;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
}

.gallery-item:hover .gallery-prompt {
  opacity: 1;
}
</style>
