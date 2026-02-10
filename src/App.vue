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

// Initial Positions (Calculated once on setup)
const inspectorInitialX = window.innerWidth - 340
const templateInitialX = 20
const sequencerInitialX = window.innerWidth / 2 - 400
const sequencerInitialY = window.innerHeight - 300

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
            :initialX="templateInitialX" 
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
            :initialX="inspectorInitialX" 
            :initialY="20" 
            width="320px"
            :zIndex="zIndices.inspector"
            @focus="bringToFront('inspector')"
        >
            <Sidebar />
        </DraggableWindow>

        <!-- 3. Director Console (Bottom Center) -->
        <DraggableWindow 
            title="Director Console" 
            :initialX="sequencerInitialX" 
            :initialY="sequencerInitialY" 
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
