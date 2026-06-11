import { createRouter, createWebHistory } from 'vue-router'
import ChatView from './components/ChatView.vue'
import CharacterConfigurator from './components/CharacterConfigurator.vue'
import PonyView from './components/PonyView.vue'
import ImageGallery from './components/ImageGallery.vue'

const routes = [
  { path: '/', redirect: '/chat' },
  { path: '/chat', component: ChatView, name: 'Chat' },
  { path: '/chat/:id', component: ChatView, name: 'ChatSession' },
  { path: '/character', component: CharacterConfigurator, name: 'Character' },
  {
    path: '/pony',
    component: PonyView,
    children: [
      { path: '', redirect: { name: 'PonyConfig' } },
      { path: 'config', component: () => import('./components/PonyConfigurator.vue'), name: 'PonyConfig' },
      { path: 'chat', component: () => import('./components/PonyChat.vue'), name: 'PonyChat' },
      { path: 'chat/:projectId', component: () => import('./components/PonyChat.vue'), name: 'PonyChatProject' },
    ]
  },
  { path: '/gallery', component: ImageGallery, name: 'Gallery' }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
