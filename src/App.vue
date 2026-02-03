<script setup lang="ts">
import WorldLayer from './components/World/WorldLayer.vue'
import TopNavBar from './components/HUD/TopNavBar.vue'
import InspectorPanel from './components/HUD/InspectorPanel.vue'
import TimelinePlayer from './components/HUD/TimelinePlayer.vue'
import { useForgeStore } from '@/stores/forge'

// Ensure store is initialized if needed
useForgeStore()
// forgeStore.loadManifest() is called in main.ts, so we are good.
</script>

<template>
  <div class="app-container w-screen h-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
    
    <!-- 1. Bottom Layer: World (Infinite Canvas) -->
    <!-- Handles its own z-index relative to content, but here it's the base -->
    <WorldLayer class="absolute inset-0 z-0" />

    <!-- 2. Middle Layer: HUD (Static, Floating) -->
    <!-- pointer-events-none ensures clicks pass through to WorldLayer where there is no HUD UI -->
    <div class="hud-layer absolute inset-0 z-10 pointer-events-none flex flex-col justify-between">
      
      <!-- Top Bar -->
      <header class="w-full">
        <TopNavBar />
      </header>
      
      <!-- Middle Area (Inspector on Right) -->
      <main class="flex-1 relative">
        <InspectorPanel class="absolute right-0 top-4 bottom-4 m-4 rounded-xl" />
      </main>
      
      <!-- Bottom Bar (Timeline) -->
      <footer class="w-full flex justify-center pb-6">
        <TimelinePlayer />
      </footer>

    </div>

    <!-- 3. Top Layer: Modals / Interaction (if any) -->
    <!-- Reserved for future drag-ghosts or global modals -->

  </div>
</template>

<style>
/* Global resets if not covered by Tailwind/style.css */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
