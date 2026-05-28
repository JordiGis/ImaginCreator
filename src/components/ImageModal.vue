<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <button class="close-btn" @click="$emit('close')">✕</button>
        <img :src="src" alt="Full size preview" />
      </div>
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
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
  padding: 40px;
  animation: fadeIn 0.15s ease;
}

.modal-content {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  cursor: default;
}

.modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);
}

.close-btn {
  position: absolute;
  top: -36px;
  right: 0;
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.close-btn:hover {
  background: rgba(255,255,255,0.2);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
