<template>
  <div class="view-container active">
    <div class="view-header">
      <h2>Pony NSFW</h2>
      <div class="view-header-actions">
        <div class="pony-subnav">
          <button
            :class="['pony-subtab', { active: ponySubView === 'config' }]"
            @click="ponySubView = 'config'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; margin-bottom: -2px;"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
            Configurador
          </button>
          <button
            :class="['pony-subtab', { active: ponySubView === 'chat' }]"
            @click="ponySubView = 'chat'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; margin-bottom: -2px;"><rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
            Chat IA (DeepSeek)
          </button>
          <button
            :class="['pony-subtab', { active: ponySubView === 'video' }]"
            @click="ponySubView = 'video'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; margin-bottom: -2px;"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            Video (Wan 2.1)
          </button>
        </div>
      </div>
    </div>
    <div class="pony-content" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
      <PonyConfigurator v-show="ponySubView === 'config'" />
      <PonyChat v-show="ponySubView === 'chat'" />
      <PonyVideo v-show="ponySubView === 'video'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PonyConfigurator from './PonyConfigurator.vue'
import PonyChat from './PonyChat.vue'
import PonyVideo from './PonyVideo.vue'

const ponySubView = ref('config')
</script>
