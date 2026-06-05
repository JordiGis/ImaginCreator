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
            🎛️ Configurador
          </button>
          <button
            :class="['pony-subtab', { active: ponySubView === 'chat' }]"
            @click="ponySubView = 'chat'"
          >
            🤖 Chat IA (DeepSeek)
          </button>
        </div>
      </div>
    </div>
    <div class="pony-content" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
      <PonyConfigurator v-show="ponySubView === 'config'" />
      <PonyChat
        v-show="ponySubView === 'chat'"
        @apply-tags="handlePonyApplyTags"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PonyConfigurator from './PonyConfigurator.vue'
import PonyChat from './PonyChat.vue'

const ponySubView = ref('config')

function handlePonyApplyTags(tags) {
  ponySubView.value = 'config'
}
</script>
