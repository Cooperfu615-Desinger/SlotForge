<script setup lang="ts">
import { NConfigProvider, type GlobalThemeOverrides, NMessageProvider } from 'naive-ui'
import DeviceContainer from './components/DeviceContainer.vue'
import GameRenderer from './components/GameRenderer.vue'
import InspectorPanel from './components/InspectorPanel.vue'
import TopNavBar from './components/TopNavBar.vue'

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
      <div class="h-screen w-screen grid grid-cols-[1fr_320px] grid-rows-[auto_1fr] bg-gray-50 overflow-hidden">
        
        <!-- Top Bar: Global Nav -->
        <div class="col-span-2 row-span-1 z-20">
          <TopNavBar />
        </div>

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
