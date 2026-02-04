<script setup lang="ts">
import { NConfigProvider, type GlobalThemeOverrides, NMessageProvider } from 'naive-ui'
import DeviceContainer from './components/DeviceContainer.vue'
import GameRenderer from './components/GameRenderer.vue'
import TopBar from './components/TopBar.vue'
import EditorPanel from './components/EditorPanel.vue'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    baseColor: '#1f2937',
    primaryColor: '#06b6d4',
  },
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <div class="w-screen h-screen flex flex-col overflow-hidden bg-gray-900">
        
        <!-- Top Bar -->
        <TopBar />

        <!-- Main Content Area -->
        <div class="flex-1 flex overflow-hidden">
          
          <!-- Center Stage (Game Canvas) -->
          <main class="flex-1 relative flex items-center justify-center overflow-hidden">
            <DeviceContainer>
              <GameRenderer />
            </DeviceContainer>
          </main>

          <!-- Right Panel (Inspector) -->
          <aside class="w-80 border-l border-gray-700">
            <EditorPanel />
          </aside>

        </div>

      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
/* Reset handles by global style.css */
</style>
