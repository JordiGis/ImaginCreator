<template>
  <div class="view-container active">
    <div class="view-header">
      <h2>Personajes</h2>
      <button class="new-chat-btn" @click="openEditor(null)">+ Nuevo personaje</button>
    </div>

    <div class="characters-content">
      <!-- Loading skeleton -->
      <div v-if="loading" class="loading-grid">
        <div v-for="n in 6" :key="n" class="char-card skeleton">
          <div class="skeleton-ring">
            <div class="skeleton-avatar"></div>
          </div>
          <div class="skeleton-name"></div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="characters.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.2">
            <circle cx="30" cy="20" r="8"/>
            <path d="M10 52c0-12 8.94-18 20-18s20 6 20 18"/>
            <path d="M42 14l6-6M48 14l-6-6"/>
          </svg>
        </div>
        <h2>No hay personajes</h2>
        <p>Crea tu primer personaje para chatear con él</p>
        <button class="primary-btn" @click="openEditor(null)">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 16px; height: 16px;"><path d="M10 4v12M4 10h12"/></svg>
          Crear personaje
        </button>
      </div>

      <!-- Character grid -->
      <div v-else class="char-grid">
        <div
          v-for="c in characters"
          :key="c.id"
          class="char-card"
          @click="openChat(c.id)"
        >
          <div class="char-avatar-ring">
            <span class="char-avatar">
              <img v-if="c.avatarUrl" :src="c.avatarUrl" :alt="c.name" class="char-avatar-img" />
              <span v-else class="char-avatar-emoji">{{ c.avatar }}</span>
            </span>
          </div>
          <div class="char-name">{{ c.name }}</div>
          <div class="char-prompt-preview">{{ c.systemPrompt?.slice(0, 50) }}{{ (c.systemPrompt?.length || 0) > 50 ? '...' : '' }}</div>
          <button class="del-char-btn" @click.stop="confirmDelete(c)" title="Eliminar personaje">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== New/Edit Character Modal ===== -->
    <div v-if="showEditor" class="modal-overlay" @click="showEditor = false">
      <div class="editor-modal" @click.stop>
        <div class="editor-header">
          <h3>{{ editing ? 'Editar personaje' : 'Nuevo personaje' }}</h3>
          <button class="close-btn" @click="showEditor = false">×</button>
        </div>
        <div class="editor-body">
          <label>
            <span>Nombre</span>
            <input v-model="form.name" type="text" placeholder="Ej: Lila la hechicera" maxlength="40" />
          </label>
          <label>
            <span>Avatar</span>
            <div class="avatar-row">
              <span class="avatar-preview">{{ form.avatar }}</span>
              <div class="avatar-pick">
                <span v-for="e in emojis" :key="e" :class="['emoji-opt', { active: form.avatar === e }]" @click="form.avatar = e">{{ e }}</span>
              </div>
            </div>
          </label>
          <label>
            <span>Personalidad / Rol</span>
            <textarea v-model="form.systemPrompt" rows="6" placeholder="Describe su personalidad, forma de hablar e historia..." />
          </label>
          <label>
            <span>Saludo inicial</span>
            <textarea v-model="form.greeting" rows="3" placeholder="Primer mensaje que dirá al entrar al chat" />
          </label>
          <label>
            <span>Apariencia física</span>
            <textarea v-model="form.appearance" rows="3" placeholder="Describe su aspecto: pelo, ojos, complexión, ropa... Se usará para generar imágenes de la escena con Pony" />
          </label>
        </div>
        <div class="editor-footer">
          <button class="btn-secondary" @click="showEditor = false">Cancelar</button>
          <button class="primary-btn" :disabled="!form.name.trim() || saving" @click="saveCharacter">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Delete confirmation ===== -->
    <div v-if="deleting" class="modal-overlay" @click="deleting = null">
      <div class="confirm-modal" @click.stop>
        <div class="confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ff5252" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16v1"/></svg>
        </div>
        <h3>¿Eliminar "{{ deleting.name }}"?</h3>
        <p>Se borrarán también sus conversaciones guardadas.</p>
        <div class="editor-footer" style="padding: 0; border: none;">
          <button class="btn-secondary" @click="deleting = null">Cancelar</button>
          <button class="danger-btn" @click="doDelete">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const characters = ref([])
const loading = ref(true)
const showEditor = ref(false)
const editing = ref(null)
const saving = ref(false)
const deleting = ref(null)

const form = ref({ name: '', avatar: '🧙', systemPrompt: '', greeting: '', appearance: '' })

const emojis = ['🧙', '🧝', '🧛', '🧜', '🧚', '🦊', '🐺', '🐉', '🦄', '🤖', '👾', '🎭', '👑', '🗡️', '🏹', '🔮']

async function loadCharacters() {
  loading.value = true
  try {
    const res = await fetch('/api/characters')
    const data = await res.json()
    characters.value = data.characters || []
  } catch (e) {
    console.error('Failed to load characters', e)
  } finally {
    loading.value = false
  }
}

function openChat(id) {
  router.push(`/characters/${id}`)
}

function openEditor(c) {
  if (c) {
    editing.value = c.id
    form.value = { name: c.name, avatar: c.avatar, systemPrompt: c.systemPrompt, greeting: c.greeting, appearance: c.appearance || '' }
  } else {
    editing.value = null
    form.value = { name: '', avatar: '🧙', systemPrompt: '', greeting: '', appearance: '' }
  }
  showEditor.value = true
}

async function saveCharacter() {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    const body = { name: form.value.name.trim(), avatar: form.value.avatar, systemPrompt: form.value.systemPrompt.trim(), greeting: form.value.greeting.trim(), appearance: form.value.appearance.trim() }
    if (editing.value) {
      await fetch(`/api/characters/${editing.value}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/characters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    showEditor.value = false
    await loadCharacters()
  } catch (e) {
    console.error('Failed to save', e)
  } finally {
    saving.value = false
  }
}

function confirmDelete(c) {
  deleting.value = c
}

async function doDelete() {
  if (!deleting.value) return
  try {
    await fetch(`/api/characters/${deleting.value.id}`, { method: 'DELETE' })
    localStorage.removeItem('ichar-msg-' + deleting.value.id)
  } catch (e) {
    console.error('Failed to delete', e)
  }
  deleting.value = null
  await loadCharacters()
}

onMounted(loadCharacters)
</script>

<style scoped>
.characters-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

.char-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.char-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.char-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.char-card:hover::before {
  opacity: 1;
}

.char-card:hover {
  border-color: var(--accent);
  background: var(--accent-subtle);
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
}

.char-card:active {
  transform: translateY(-1px);
}

.char-card.skeleton {
  pointer-events: none;
}

.skeleton-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--surface-2);
}

.skeleton-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--surface-2);
}

.skeleton-name {
  width: 90px;
  height: 14px;
  border-radius: 4px;
  background: var(--surface-2);
}

.char-avatar-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}

.char-card:hover .char-avatar-ring {
  border-color: var(--accent);
}

.char-avatar {
  font-size: 36px;
  line-height: 1;
  display: flex;
}

.char-avatar-img {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
}

.char-avatar-emoji {
  font-size: 36px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
}

.char-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--fg);
  text-align: center;
  line-height: 1.3;
}

.char-prompt-preview {
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  line-height: 1.4;
  opacity: 0.7;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.del-char-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 82, 82, 0.08);
  border: 1px solid transparent;
  color: var(--muted);
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  opacity: 0;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.char-card:hover .del-char-btn {
  opacity: 1;
}

.del-char-btn:hover {
  background: rgba(255, 82, 82, 0.15);
  border-color: rgba(255, 82, 82, 0.2);
  color: #ff5252;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.loading-grid .skeleton {
  padding: 28px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border-radius: 14px;
  border: 1px solid var(--border);
}

/* ── Buttons ── */
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.primary-btn:hover { background: var(--accent-hover); }
.primary-btn:disabled { opacity: 0.4; cursor: default; }

.btn-secondary {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--fg);
  padding: 8px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.btn-secondary:hover { background: var(--border); }

.danger-btn {
  background: #ff5252;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.danger-btn:hover { background: #ff1744; }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  animation: fadeIn 0.15s ease-out;
}

.editor-modal, .confirm-modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 90%;
  max-width: 520px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  animation: modalSlideUp 0.2s ease-out;
}

.confirm-modal {
  max-width: 380px;
  padding: 32px 28px 24px;
  gap: 12px;
  text-align: center;
  align-items: center;
}

.confirm-icon svg {
  width: 40px;
  height: 40px;
}

.confirm-modal h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--fg);
  margin: 0;
}

.confirm-modal p {
  color: var(--muted);
  font-size: 14px;
  margin: 0;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
}

.editor-header h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--fg);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: color 0.15s;
}

.close-btn:hover { color: var(--fg); }

.editor-body {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.editor-body label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg);
}

.editor-body input,
.editor-body textarea {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--fg);
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.editor-body input:focus,
.editor-body textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(255, 82, 130, 0.08);
}

.editor-body textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.avatar-preview {
  font-size: 36px;
  line-height: 1;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-deep);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.avatar-pick {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.emoji-opt {
  font-size: 22px;
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  transition: all 0.1s;
  line-height: 1;
  border: 1px solid transparent;
}

.emoji-opt:hover { background: var(--surface-2); }
.emoji-opt.active { background: var(--accent-subtle); border-color: var(--accent); }

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 40px;
  color: var(--muted);
  text-align: center;
}

.empty-icon svg {
  width: 72px;
  height: 72px;
  opacity: 0.2;
}

.empty-state h2 {
  font-size: 20px;
  font-weight: 500;
  color: var(--muted);
  margin: 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--muted);
  margin: 0 0 8px;
}

/* ── Animations ── */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ── Scrollbar ── */
.characters-content::-webkit-scrollbar {
  width: 5px;
}
.characters-content::-webkit-scrollbar-track {
  background: transparent;
}
.characters-content::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}

/* ── Mobile Responsive ── */
@media (max-width: 639px) {
  .characters-content {
    padding: 16px;
  }
  .char-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  .char-card {
    padding: 20px 14px 16px;
    gap: 8px;
    border-radius: 12px;
  }
  .char-avatar-ring {
    width: 60px;
    height: 60px;
  }
  .char-avatar {
    font-size: 28px;
  }
  .char-avatar-img {
    width: 50px;
    height: 50px;
  }
  .char-avatar-emoji {
    width: 50px;
    height: 50px;
    font-size: 28px;
  }
  .char-name {
    font-size: 13px;
  }
  .char-prompt-preview {
    display: none;
  }
  .editor-modal {
    width: 95%;
    max-height: 90vh;
  }
  .editor-body {
    padding: 16px;
  }
  .editor-header, .editor-footer {
    padding: 12px 16px;
  }
  .emoji-opt {
    font-size: 18px;
    padding: 4px;
  }
  .empty-state {
    padding: 60px 24px;
  }
}
</style>
