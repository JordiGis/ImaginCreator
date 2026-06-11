<template>
  <div class="view-container active">
    <div class="view-header">
      <h2>Personajes</h2>
      <button class="new-chat-btn" @click="showEditor = true">+ Nuevo personaje</button>
    </div>

    <div class="characters-content">
      <!-- Loading -->
      <div v-if="loading" class="loading-grid">
        <div v-for="n in 6" :key="n" class="char-card skeleton">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-name"></div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="characters.length === 0" class="empty-state">
        <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="30" cy="20" r="8"/>
          <path d="M10 52c0-12 8.94-18 20-18s20 6 20 18"/>
          <path d="M42 14l6-6M48 14l-6-6"/>
        </svg>
        <h2>No hay personajes</h2>
        <p>Crea tu primer personaje para chatear con él</p>
        <button class="primary-btn" @click="showEditor = true">+ Crear personaje</button>
      </div>

      <!-- Character grid -->
      <div v-else class="char-grid">
        <div
          v-for="c in characters"
          :key="c.id"
          class="char-card"
          @click="openChat(c.id)"
        >
          <div class="char-avatar">{{ c.avatar }}</div>
          <div class="char-name">{{ c.name }}</div>
          <button class="del-char-btn" @click.stop="confirmDelete(c)" title="Eliminar">
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
            <span>Avatar (emoji)</span>
            <div class="avatar-row">
              <span class="avatar-preview">{{ form.avatar }}</span>
              <input v-model="form.avatar" type="text" placeholder="🧙" maxlength="2" style="width: 80px; text-align: center;" />
              <div class="avatar-pick">
                <span v-for="e in emojis" :key="e" :class="['emoji-opt', { active: form.avatar === e }]" @click="form.avatar = e">{{ e }}</span>
              </div>
            </div>
          </label>
          <label>
            <span>Personalidad / Rol
              <small style="font-weight: 400; color: var(--muted);"> (describe quién es, cómo habla, su historia)</small>
            </span>
            <textarea v-model="form.systemPrompt" rows="6" placeholder="Ej: Eres una hechicera misteriosa que vive en un bosque encantado. Hablas con tono poético y enigmático. Te gusta hacer acertijos a los viajeros..." />
          </label>
          <label>
            <span>Saludo inicial
              <small style="font-weight: 400; color: var(--muted);"> (primer mensaje que dirá el personaje al entrar al chat)</small>
            </span>
            <textarea v-model="form.greeting" rows="3" placeholder="Ej: *Una voz etérea susurra entre los árboles* Bienvenido, viajero. ¿Buscas respuestas o problemas?" />
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
        <h3>¿Eliminar "{{ deleting.name }}"?</h3>
        <p>Se borrarán también sus chats.</p>
        <div class="editor-footer">
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

const form = ref({ name: '', avatar: '🧙', systemPrompt: '', greeting: '' })

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
    form.value = { name: c.name, avatar: c.avatar, systemPrompt: c.systemPrompt, greeting: c.greeting }
  } else {
    editing.value = null
    form.value = { name: '', avatar: '🧙', systemPrompt: '', greeting: '' }
  }
  showEditor.value = true
}

async function saveCharacter() {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    const body = { name: form.value.name.trim(), avatar: form.value.avatar, systemPrompt: form.value.systemPrompt.trim(), greeting: form.value.greeting.trim() }
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
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.char-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.char-card:hover {
  border-color: var(--accent);
  background: var(--accent-subtle);
  transform: translateY(-2px);
}

.char-card.skeleton {
  pointer-events: none;
}

.skeleton-avatar {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--surface-2);
}

.skeleton-name {
  width: 80px; height: 14px;
  border-radius: 4px;
  background: var(--surface-2);
}

.char-avatar {
  font-size: 40px;
  line-height: 1;
}

.char-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--fg);
  text-align: center;
}

.del-char-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.15s;
  display: flex;
}

.char-card:hover .del-char-btn {
  opacity: 1;
}

.del-char-btn:hover {
  background: rgba(255, 82, 82, 0.1);
  color: #ff5252;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.primary-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
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
  transition: background 0.15s;
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
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.editor-modal, .confirm-modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 90%;
  max-width: 520px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
}

.confirm-modal {
  max-width: 380px;
  padding: 24px;
  gap: 16px;
}

.confirm-modal h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
}

.confirm-modal p {
  color: var(--muted);
  font-size: 14px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
}

.editor-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
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
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 14px;
  color: var(--fg);
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.editor-body input:focus,
.editor-body textarea:focus {
  border-color: var(--accent);
}

.editor-body textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.avatar-preview {
  font-size: 32px;
  line-height: 1;
}

.avatar-pick {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.emoji-opt {
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.1s;
  line-height: 1;
}

.emoji-opt:hover { background: var(--surface-2); }
.emoji-opt.active { background: var(--accent-subtle); outline: 1px solid var(--accent); }

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

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

.empty-state svg {
  width: 72px; height: 72px;
  opacity: 0.25;
}

.empty-state h2 {
  font-size: 20px;
  font-weight: 500;
  color: var(--muted);
}

.empty-state p {
  font-size: 14px;
  color: var(--muted);
}

/* -- Mobile responsive -- */
@media (max-width: 639px) {
  .characters-content {
    padding: 16px;
  }
  .char-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  .char-card {
    padding: 16px 10px;
    gap: 8px;
  }
  .char-avatar {
    font-size: 32px;
  }
  .char-name {
    font-size: 12px;
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
    padding: 3px;
  }
}
</style>
