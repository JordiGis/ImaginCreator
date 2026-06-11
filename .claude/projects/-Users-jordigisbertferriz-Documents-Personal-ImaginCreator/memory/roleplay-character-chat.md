---
name: roleplay-character-chat
description: Roleplay chatbot section with character gallery and 3-mode chat
metadata:
  type: project
---

Added roleplay chatbot section to ImaginCreator. `CharactersView.vue` (gallery + create/edit) and `CharacterChat.vue` (chat with 3 message modes). Backend in `server/services/characters.js` with JSON file storage. Uses OpenRouter text models with fallback chain.

**3 message modes:**
- 💬 Speech — quoted text, what character/user says aloud
- 💭 Thoughts — parenthesized text, inner thoughts
- 🌍 Narration — asterisk text, environment/actions

**Key implementation details:**
- Messages stored per-character in localStorage (`ichar-msg-{id}`)
- Character definitions persisted server-side in `data/characters.json`
- 3 default characters seeded on first launch (Lila, Kael, Nyx)
- Chat endpoint wraps character persona as system prompt with format instructions
- Frontend detects AI response format by checking first/last characters (`"`, `(`, `*`)
- LAN binding on `0.0.0.0` for both backend and Vite dev server

**Why:** User wanted a dedicated roleplay chat section with structured narrative formats, separate from the image-gen character configurator.

**How to apply:** New route `/characters` shows gallery. Route `/characters/:id` opens chat. Nav link "Roleplay" in sidebar. Old "Personajes" renamed to "Creador".

[[lilac-configurator]]
