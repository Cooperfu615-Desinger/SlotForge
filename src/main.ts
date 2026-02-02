import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'
import App from './App.vue'
import './style.css'

// Import mock data and store
import normal5x3Data from '@/mocks/normal_5x3.json'
import type { SlotManifest } from '@/types/manifest'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(VueKonva)

// Pre-load mock data into store BEFORE mounting
// This ensures all child components have access to data on mount
import { useForgeStore } from '@/stores/forge'
const forgeStore = useForgeStore()
forgeStore.loadManifest(normal5x3Data as SlotManifest)

app.mount('#app')
