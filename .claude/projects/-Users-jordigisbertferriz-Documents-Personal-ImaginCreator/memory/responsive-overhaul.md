---
name: responsive-overhaul
description: Full responsive redesign of all views with 3 breakpoints
metadata:
  type: project
---

Complete responsive overhaul of all views. 3 breakpoints: desktop (>1024px), tablet (640-1024px), mobile (<640px).

**Sidebar (App.vue):**
- Desktop: full 280px sidebar with all content
- Tablet: 64px mini sidebar (icons only), nav labels + model/cost/dashboard hidden
- Mobile: sidebar hidden → slide-over drawer via hamburger. Bottom nav bar (60px) with 5 icons. Fixed mobile header (48px).

**Responsive patterns per component:**
- `CharConfigurator` / `PonyConfigurator`: 2-panel layout stacks at 900px, tighter padding + smaller buttons at 640px
- `CharacterChat`: full-width mode selector, 16px input, 92% max msg width on mobile
- `ChatView`: history modal full-width on mobile
- `CharactersView`: grid minmax 120px on mobile, tighter spacing
- `ImageGallery`: grid minmax 140px on mobile, 2-column skeleton
- `PonyChat`: horizontal scroll project tabs, compact messages
- `PromptInput`: 16px font on mobile (prevents iOS zoom), smaller padding

**Key CSS techniques used:**
- `clamp()` for fluid padding/fonts between breakpoints
- `env(safe-area-inset-bottom)` for mobile notch
- `-webkit-overflow-scrolling: touch` for smooth mobile scroll
- `-webkit-tap-highlight-color: transparent` for touch feedback
- `font-size: 16px` on inputs to prevent iOS auto-zoom

[[roleplay-character-chat]]
