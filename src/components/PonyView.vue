<template>
  <div class="view-container active">
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
    <PonyConfigurator v-show="ponySubView === 'config'" />
    <PonyChat
      v-show="ponySubView === 'chat'"
      @apply-tags="handlePonyApplyTags"
    />
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
