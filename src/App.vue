<script setup lang="ts">
import { ref } from 'vue'
import { NConfigProvider, type GlobalThemeOverrides, NMessageProvider } from 'naive-ui'
import DeviceContainer from './components/DeviceContainer.vue'
import GameRenderer from './components/GameRenderer.vue'
import Sidebar from './components/Sidebar/Sidebar.vue'
import TopNavBar from './components/TopNavBar.vue'
import DraggableWindow from './components/UI/DraggableWindow.vue'
import SequencerPanel from './components/Sequencer/SequencerPanel.vue'

const lightTheme: GlobalThemeOverrides = {
  common: {
    baseColor: '#FFFFFF',
    primaryColor: '#18a058',
  },
}

// Z-Index Management
const zIndices = ref({
    templates: 40,
    inspector: 40,
    sequencer: 40
})

const bringToFront = (key: 'templates' | 'inspector' | 'sequencer') => {
    const maxZ = Math.max(zIndices.value.templates, zIndices.value.inspector, zIndices.value.sequencer)
    zIndices.value[key] = maxZ + 1
}

</script>

<template>
  <n-config-provider :theme-overrides="lightTheme">
    <n-message-provider>
      <!-- Main Canvas Container (Full Screen, Relative) -->
      <main class="w-screen h-screen relative overflow-hidden bg-gray-100 flex items-center justify-center">
        
        <!-- Game Preview (Centered) -->
        <DeviceContainer>
            <GameRenderer />
        </DeviceContainer>

        <!-- Floating Windows Layer -->

        <!-- 1. Templates (Top Left) -->
        <DraggableWindow 
            title="Templates" 
            :initialX="20" 
            :initialY="20" 
            width="auto"
            :zIndex="zIndices.templates"
            @focus="bringToFront('templates')"
        >
            <div class="p-0">
                <TopNavBar />
            </div>
        </DraggableWindow>

        <!-- 2. Inspector (Right Side) -->
        <DraggableWindow 
            title="Inspector" 
            :initialX="window.innerWidth - 340" 
            :initialY="20" 
            width="320px"
            :zIndex="zIndices.inspector"
            @focus="bringToFront('inspector')"
        >
            <Sidebar />
        </DraggableWindow>

        <!-- 3. Director Console (Bottom Center) -->
        <!-- Note: SequencerPanel needs refactoring to support being wrapped or we wrap it in a window and it adapts. 
             Since SequencerPanel currently has its own fixed position logic, we should probably modify it to be just the *content* 
             and let DraggableWindow handle the window. 
             However, the request said: "Director Console (Refactor to use component)". 
             So we should wrap the inner content of SequencerPanel or use DraggableWindow *inside* SequencerPanel?
             Actually, let's wrap SequencerPanel here, but we need to strip SequencerPanel's internal drag logic first 
             OR just put the *content* of SequencerPanel here. 
             The cleanest way is to use SequencerPanel as a "content component" and wrap it here.
             BUT SequencerPanel currently has state (isCollapsed etc). 
             DraggableWindow handles collapse.
             So SequencerPanel should just be the *content* (Toolbar + Timeline).
             I will refactor App.vue to wrap it, then I will refactor SequencerPanel to remove its own window logic.
        -->
        <DraggableWindow 
            title="Director Console" 
            :initialX="window.innerWidth / 2 - 400" 
            :initialY="window.innerHeight - 300" 
            width="800px"
            :zIndex="zIndices.sequencer"
            @focus="bringToFront('sequencer')"
        >
            <SequencerPanel :embedded="true" />
        </DraggableWindow>

      </main>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
/* Reset handles by global style.css */
</style>
