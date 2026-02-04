<script setup lang="ts">
import { NConfigProvider, type GlobalThemeOverrides, NMessageProvider } from 'naive-ui'
import DeviceContainer from './components/DeviceContainer.vue'
import GameRenderer from './components/GameRenderer.vue'
import InspectorPanel from './components/InspectorPanel.vue'

const lightTheme: GlobalThemeOverrides = {
  common: {
    baseColor: '#FFFFFF',
    primaryColor: '#18a058',
  },
}
</script>

<template>
  <n-config-provider :theme-overrides="lightTheme">
    <n-message-provider>
      <div class="h-screen w-screen grid grid-cols-[1fr_320px] grid-rows-[64px_1fr] bg-gray-50 overflow-hidden">
        
        <!-- Top Bar: Global Nav -->
        <header class="col-span-2 row-span-1 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 z-10">
          <h1 class="text-xl font-bold text-gray-800">SlotForge <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">V2.0</span></h1>
        </header>

        <!-- Center Stage: Viewport -->
        <main class="col-span-1 row-span-1 relative flex items-center justify-center overflow-hidden">
          <DeviceContainer>
            <GameRenderer />
          </DeviceContainer>
        </main>

        <!-- Right Panel: Inspector -->
        <aside class="col-span-1 row-span-2 bg-white border-l border-gray-200 shadow-sm flex flex-col z-10 overflow-hidden">
          <InspectorPanel />
        </aside>

        <!-- Bottom Panel: Sequencer -->
        <section class="col-span-1 row-span-1 bg-white border-t border-gray-200 shadow-sm z-10">
          <div class="p-2 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase tracking-wider">Sequencer Timeline</div>
          <div class="p-4 text-center text-gray-400">
            GSAP Timeline Control
          </div>
        </section>

      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
/* Reset handles by global style.css */
</style>
