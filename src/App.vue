<script setup lang="ts">
import { NConfigProvider, type GlobalThemeOverrides, NMessageProvider, NSwitch } from 'naive-ui'
import DeviceContainer from './components/DeviceContainer.vue'
import GameRenderer from './components/GameRenderer.vue'
import RightSidebar from './components/RightSidebar.vue'
import TopNavBar from './components/TopNavBar.vue'
import { useGameStore } from './stores/gameStore'

const gameStore = useGameStore()

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

        <!-- Right Panel: Tabbed Sidebar -->
        <aside class="col-span-1 row-span-2 bg-white border-l border-gray-200 shadow-sm flex flex-col z-10 overflow-hidden">
          <RightSidebar />
        </aside>

        <!-- Bottom Panel: Sequencer -->
        <section class="col-span-1 row-span-1 bg-white border-t border-gray-200 shadow-sm z-10">
          <div class="p-2 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>Sequencer Timeline</span>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-gray-400 font-normal">
                {{ gameStore.isSequencerEnabled ? 'PLAY MODE' : 'INSPECTOR MODE' }}
              </span>
              <n-switch v-model:value="gameStore.isSequencerEnabled" size="small">
                <template #checked>ON</template>
                <template #unchecked>OFF</template>
              </n-switch>
            </div>
          </div>
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
