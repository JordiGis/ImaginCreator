<template>
  <Teleport to="body">
    <div v-if="show" class="lightbox-overlay open" @click.self="$emit('close')">
      <button class="close-lb" @click="$emit('close')">✕</button>
      <img :src="src" alt="Vista ampliada" />
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  src: { type: String, default: '' },
  show: { type: Boolean, default: false }
})

defineEmits(['close'])
</script>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.92);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.lightbox-overlay img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 0 80px rgba(0,0,0,0.6);
}

.close-lb {
  position: fixed;
  top: 24px;
  right: 24px;
  background: none;
  border: none;
  color: #fff;
  font-size: 32px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.1s;
  z-index: 1;
  font-family: inherit;
  line-height: 1;
}

.close-lb:hover { opacity: 1; }
</style>
