<template>
  <div class="app">
    <!-- ===== Mobile header bar (< 640px) ===== -->
    <header class="mobile-header">
      <button class="hamburger" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Menú">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 5h14M3 10h14M3 15h14"/></svg>
      </button>
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 22px; height: 22px; flex-shrink: 0;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      <span class="mobile-title">ImaginCreator</span>
      <button class="mobile-avatar" @click="mobileMenuOpen = true" aria-label="Abrir menú">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="width: 20px; height: 20px;"><circle cx="10" cy="7" r="3"/><path d="M3 17c0-4 3.13-6 7-6s7 2 7 6"/></svg>
      </button>
    </header>

    <!-- ===== Overlay backdrop (mobile sidebar) ===== -->
    <div v-if="mobileMenuOpen" class="sidebar-backdrop" @click="mobileMenuOpen = false" />

    <!-- ===== Sidebar ===== -->
    <aside :class="['sidebar', { open: mobileMenuOpen }]">
      <div class="sidebar-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 28px; height: 28px; margin-right: 4px;">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h1>ImaginCreator</h1>
      </div>

      <nav class="nav-tabs" role="tablist">
        <div class="nav-tab-wrapper">
          <router-link
            to="/chat"
            :class="['nav-tab', { active: $route.path.startsWith('/chat') }]"
            @click="toggleChats"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 3h14a2 2 0 012 2v10a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2z"/></svg>
            <span style="flex: 1">Chats</span>
            <button class="new-chat-icon-btn" @click.stop.prevent="handleNewChat" title="Nuevo chat">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M10 4v12M4 10h12"/></svg>
            </button>
            <svg :class="['chevron', { open: chatsOpen && $route.path.startsWith('/chat') }]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M6 8l4 4 4-4"/></svg>
          </router-link>
        </div>

        <div v-show="$route.path.startsWith('/chat') && chatsOpen" class="session-list">
           <router-link
             v-for="s in sessions.slice(0, 5)"
             :key="s.id"
             :to="`/chat/${s.id}`"
             class="session-item"
             active-class="active"
             exact-active-class="active"
           >
             <span class="session-title">{{ s.title }}</span>
             <button class="delete-session" @click.prevent="deleteSession(s.id)" title="Eliminar">×</button>
           </router-link>
        </div>

        <router-link
          to="/character"
          class="nav-tab"
          active-class="active"
          @click="mobileMenuOpen = false"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="7" r="3"/><path d="M3 17c0-4 3.13-6 7-6s7 2 7 6"/></svg>
          <span>Creador</span>
        </router-link>

        <router-link
          to="/characters"
          class="nav-tab"
          active-class="active"
          @click="mobileMenuOpen = false"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M10 2l4 4h-3v4h-2V6H6l4-4z"/><path d="M2 18h16"/><path d="M5 14h10a1 1 0 011 1v3H4v-3a1 1 0 011-1z"/></svg>
          <span>Roleplay</span>
        </router-link>

        <router-link
          to="/pony"
          class="nav-tab"
          active-class="active"
          @click="mobileMenuOpen = false"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3.5 8.5C3.5 5 6 2.5 10 2.5s6.5 2.5 6.5 6c0 4.5-6.5 9-6.5 9S3.5 13 3.5 8.5z"/><circle cx="10" cy="8" r="1.5"/></svg>
          <span>Pony NSFW</span>
        </router-link>

        <router-link
          to="/gallery"
          class="nav-tab"
          active-class="active"
          @click="mobileMenuOpen = false"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="6" height="6"/><rect x="12" y="2" width="6" height="6"/><rect x="2" y="12" width="6" height="6"/><rect x="12" y="12" width="6" height="6"/></svg>
          <span>Galería</span>
        </router-link>
      </nav>

      <ModelSelector v-if="$route.path.startsWith('/chat')" :model-value="currentModel" @update:model-value="setModel" />

      <CostDashboard
        :total-cost="credit.totalCost.value"
        :total-tokens="credit.totalTokens.value"
        :total-images="credit.totalImages.value"
        :daily-remaining="credit.dailyRemaining.value"
        :weekly-remaining="credit.weeklyRemaining.value"
        :daily-limit="credit.dailyLimit.value"
        :weekly-limit="credit.weeklyLimit.value"
      />

      <div class="sidebar-footer">
        Prompts idénticos cargan desde caché y son gratuitos.
      </div>
    </aside>

    <!-- ===== Main content ===== -->
    <main class="main">
      <router-view />
    </main>

    <!-- ===== Bottom nav (mobile < 640px) ===== -->
    <nav class="bottom-nav">
      <router-link to="/chat" class="bottom-nav-item" :class="{ active: $route.path.startsWith('/chat') }">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 3h14a2 2 0 012 2v10a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2z"/></svg>
        <span>Chats</span>
      </router-link>
      <router-link to="/characters" class="bottom-nav-item" :class="{ active: $route.path.startsWith('/characters') }">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M10 2l4 4h-3v4h-2V6H6l4-4z"/><path d="M2 18h16"/><path d="M5 14h10a1 1 0 011 1v3H4v-3a1 1 0 011-1z"/></svg>
        <span>Roleplay</span>
      </router-link>
      <router-link to="/character" class="bottom-nav-item" :class="{ active: $route.path === '/character' }">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="7" r="3"/><path d="M3 17c0-4 3.13-6 7-6s7 2 7 6"/></svg>
        <span>Creador</span>
      </router-link>
      <router-link to="/pony" class="bottom-nav-item" :class="{ active: $route.path.startsWith('/pony') }">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3.5 8.5C3.5 5 6 2.5 10 2.5s6.5 2.5 6.5 6c0 4.5-6.5 9-6.5 9S3.5 13 3.5 8.5z"/><circle cx="10" cy="8" r="1.5"/></svg>
        <span>Pony</span>
      </router-link>
      <router-link to="/gallery" class="bottom-nav-item" :class="{ active: $route.path === '/gallery' }">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="6" height="6"/><rect x="12" y="2" width="6" height="6"/><rect x="2" y="12" width="6" height="6"/><rect x="12" y="12" width="6" height="6"/></svg>
        <span>Galería</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModelSelector from './components/ModelSelector.vue'
import CostDashboard from './components/CostDashboard.vue'
import { useApi } from './composables/useApi.js'
import { useCreditTracker } from './composables/useCreditTracker.js'
import { useChatStore } from './composables/useChatStore.js'

const route = useRoute()
const router = useRouter()
const api = useApi()
const credit = useCreditTracker()

const chatsOpen = ref(true)
const mobileMenuOpen = ref(false)

const {
  currentModel,
  setModel,
  sessions,
  deleteSession,
  newChat
} = useChatStore()

function toggleChats(e) {
  if (route.path.startsWith('/chat')) {
    e.preventDefault()
    chatsOpen.value = !chatsOpen.value
  } else {
    chatsOpen.value = true
  }
}

function handleNewChat() {
  const id = newChat()
  router.push('/chat/' + id)
  chatsOpen.value = true
  mobileMenuOpen.value = false
}

onMounted(() => {
  credit.loadStats()
  api.fetchImages().catch(() => {})
})
</script>

<style>
/* ── Design tokens ── */
:root {
  --bg-deep: #0b0b0f;
  --surface: #14141a;
  --surface-2: #1a1a22;
  --border: #2a2a35;
  --fg: #e8e8ed;
  --muted: #8a8a96;
  --accent: #ff5282;
  --accent-hover: #ff7aa0;
  --accent-subtle: rgba(255, 82, 130, 0.12);
  --success: #ff5282;
  --success-bg: rgba(255,82,130,0.1);
  --radius: 8px;
  --radius-sm: 6px;
  --font: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', 'Cascadia Code', monospace;
  --sidebar-width: 280px;
  --bottom-nav-h: 60px;
  --mobile-header-h: 48px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: var(--bg-deep);
  color: var(--fg);
  font: 14px/1.5 var(--font);
  -webkit-font-smoothing: antialiased;
}

#app { height: 100%; }

/* ── Layout ── */
.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ── Mobile header (< 640px) ── */
.mobile-header {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--mobile-header-h);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  z-index: 50;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
}

.hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--fg);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
}
.hamburger svg { width: 22px; height: 22px; }
.hamburger:active { background: var(--surface-2); }

.mobile-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
}

.mobile-avatar {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}
.mobile-avatar:active { background: var(--surface-2); }

/* ── Sidebar backdrop (mobile) ── */
.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 40;
  backdrop-filter: blur(3px);
}

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  overflow-y: auto;
  z-index: 10;
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  padding-left: 4px;
}

.sidebar-logo svg {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.sidebar-logo h1 {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--fg);
}

/* ── Nav Tabs ── */
.nav-tabs {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 24px;
}

.nav-tab-wrapper {
  display: flex;
  flex-direction: column;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius);
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  background: none;
  border: none;
  font: inherit;
  font-size: 14px;
  text-align: left;
  width: 100%;
  text-decoration: none;
}

.nav-tab:hover { background: var(--surface-2); color: var(--fg); }
.nav-tab.active {
  background: var(--accent-subtle);
  color: var(--accent);
  font-weight: 500;
}

.nav-tab svg {
  width: 20px; height: 20px;
  flex-shrink: 0;
  opacity: 0.7;
}
.nav-tab.active svg { opacity: 1; }

.new-chat-icon-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: all 0.15s;
}
.new-chat-icon-btn:hover {
  opacity: 1;
  background: var(--surface-2);
}
.new-chat-icon-btn svg { width: 16px; height: 16px; }

.chevron {
  transition: transform 0.2s;
  opacity: 0.7;
}
.chevron.open { transform: rotate(180deg); }

/* ── Session List ── */
.session-list {
  display: flex;
  flex-direction: column;
  margin: 4px 0 12px 20px;
  padding-left: 10px;
  border-left: 1px solid var(--border);
  gap: 2px;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  color: var(--muted);
  text-decoration: none;
  font-size: 13px;
  transition: all 0.15s;
}
.session-item:hover { background: var(--surface-2); color: var(--fg); }
.session-item.active { color: var(--accent); background: var(--surface-2); font-weight: 500; }

.session-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.delete-session {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  padding: 0 4px;
}
.session-item:hover .delete-session { opacity: 1; }
.delete-session:hover { color: #ff5252; }

/* ── Sidebar Footer ── */
.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  line-height: 1.4;
}

/* ── Main content ── */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-deep);
}

.view-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ── View Header ── */
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 max(16px, calc((100% - 1200px) / 2 + 32px));
  height: 64px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
  z-index: 2;
  gap: 12px;
}

.view-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
}

.new-chat-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
  white-space: nowrap;
}
.new-chat-btn:hover { background: var(--surface-2); color: var(--fg); }

/* ── Chat Messages ── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: clamp(16px, 3vw, 32px) clamp(12px, 3vw, 32px);
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 2vw, 20px);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: clamp(24px, 5vw, 40px);
  color: var(--muted);
  text-align: center;
}

.empty-state svg {
  width: clamp(56px, 8vw, 72px);
  height: clamp(56px, 8vw, 72px);
  opacity: 0.25;
}

.empty-state h2 {
  font-size: clamp(16px, 2.5vw, 20px);
  font-weight: 500;
  color: var(--muted);
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 460px;
}

.suggestion-chip {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: clamp(6px, 1.2vw, 8px) clamp(12px, 2vw, 16px);
  font-size: clamp(12px, 1.4vw, 13px);
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}
.suggestion-chip:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-subtle); }
.suggestion-chip:active { background: var(--accent-subtle); }

/* ── Message bubbles ── */
.message {
  display: flex;
  flex-direction: column;
  max-width: clamp(85%, 75%, 75%);
}

.message.user { align-self: flex-end; align-items: flex-end; }
.message.ai { align-self: flex-start; align-items: flex-start; }

.message-bubble {
  background: var(--surface-2);
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 100%;
  word-break: break-word;
}

.message.user .message-bubble {
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message.ai .message-bubble {
  border-bottom-left-radius: 4px;
}

.message .text { line-height: 1.5; white-space: pre-wrap; }

.image-previews {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.image-preview-wrapper {
  position: relative;
  width: clamp(60px, 10vw, 80px);
  height: clamp(60px, 10vw, 80px);
}

.image-preview-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.1s;
}

.image-preview-wrapper img:hover { transform: scale(1.05); }

.ref-btn {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: var(--accent);
  border: 2px solid var(--bg-deep);
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  display: none;
  place-content: center;
  padding: 0;
  line-height: 1;
  transition: background 0.1s;
  z-index: 2;
}
.image-preview-wrapper:hover .ref-btn { display: grid; }
.ref-btn:hover { background: var(--accent-hover); }

.message-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  font-size: clamp(11px, 1.3vw, 12px);
  color: var(--muted);
}

.cache-badge {
  background: var(--success-bg);
  color: var(--success);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.generating {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 14px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Scrollbar ── */
.sidebar::-webkit-scrollbar,
.chat-messages::-webkit-scrollbar,
.char-config::-webkit-scrollbar,
.char-preview::-webkit-scrollbar,
.gallery-content::-webkit-scrollbar {
  width: 6px;
}
.sidebar::-webkit-scrollbar-track,
.chat-messages::-webkit-scrollbar-track,
.char-config::-webkit-scrollbar-track,
.char-preview::-webkit-scrollbar-track,
.gallery-content::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar::-webkit-scrollbar-thumb,
.chat-messages::-webkit-scrollbar-thumb,
.char-config::-webkit-scrollbar-thumb,
.char-preview::-webkit-scrollbar-thumb,
.gallery-content::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

/* ── Pony sub-nav ── */
.pony-subnav {
  display: flex;
  gap: 4px;
  background: var(--surface-2);
  padding: 4px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.pony-subtab {
  background: none;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  white-space: nowrap;
}
.pony-subtab:hover { color: var(--fg); }
.pony-subtab.active {
  background: var(--surface);
  color: var(--fg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ── Bottom nav (mobile < 640px) ── */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: var(--bottom-nav-h);
  background: var(--surface);
  border-top: 1px solid var(--border);
  z-index: 50;
  justify-content: space-around;
  align-items: center;
  padding: 4px 0 env(safe-area-inset-bottom, 4px) 0;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 6px;
  color: var(--muted);
  text-decoration: none;
  font-size: 10px;
  font-weight: 500;
  transition: color 0.15s;
  -webkit-tap-highlight-color: transparent;
  min-width: 0;
  flex: 1;
  max-width: 72px;
}
.bottom-nav-item svg {
  width: 22px;
  height: 22px;
}
.bottom-nav-item span {
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.bottom-nav-item.active { color: var(--accent); }
.bottom-nav-item:active { background: var(--surface-2); }

/* ── Tablet: sidebar mini (640px - 1024px) ── */
@media (min-width: 640px) and (max-width: 1024px) {
  .sidebar {
    width: 64px;
    min-width: 64px;
    padding: 16px 8px;
    align-items: center;
  }
  .sidebar-logo {
    justify-content: center;
    padding-left: 0;
  }
  .sidebar-logo h1,
  .nav-tab span,
  .nav-tab .new-chat-icon-btn,
  .nav-tab .chevron,
  .session-list,
  .model-selector,
  .cost-dashboard,
  .sidebar-footer {
    display: none;
  }
  .nav-tab { justify-content: center; padding: 10px; }
}

/* ── Mobile: sidebar drawer + bottom nav (< 640px) ── */
@media (max-width: 639px) {
  .mobile-header { display: flex; }
  .sidebar-backdrop { display: block; }

  .app { padding-top: var(--mobile-header-h); padding-bottom: var(--bottom-nav-h); }

  .sidebar {
    position: fixed;
    top: var(--mobile-header-h);
    left: 0;
    bottom: var(--bottom-nav-h);
    width: min(300px, 80vw);
    min-width: 0;
    z-index: 45;
    transform: translateX(-105%);
    opacity: 0;
    border-right: 1px solid var(--border);
    border-top: 1px solid var(--border);
    box-shadow: 4px 0 24px rgba(0,0,0,0.5);
  }
  .sidebar.open {
    transform: translateX(0);
    opacity: 1;
  }

  .bottom-nav { display: flex; }

  /* View headers with less padding on mobile */
  .view-header {
    padding: 0 12px;
    height: 52px;
  }
  .view-header-actions .new-chat-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
  .chat-messages {
    padding: 12px;
    gap: 12px;
  }

  .message { max-width: 90%; }
  .message-bubble { padding: 10px 14px; }

  /* Hide pony subnav labels, show icons only */
  .pony-subtab svg { margin-right: 0 !important; }
  .pony-subtab { justify-content: center; padding: 6px 10px; }
  .pony-subtab span { display: none; }

  .sidebar-logo { margin-bottom: 20px; }
}

/* ── Very thin screens (< 380px) ── */
@media (max-width: 379px) {
  .message { max-width: 95%; }
  .bottom-nav-item { max-width: 56px; }
  .bottom-nav-item svg { width: 18px; height: 18px; }
}

/* ── Ensure pony sub-view layouts scroll properly ── */
.pony-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
</style>
