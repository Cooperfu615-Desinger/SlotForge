<script setup lang="ts">
import { NConfigProvider, type GlobalThemeOverrides, NMessageProvider } from 'naive-ui'
import DeviceContainer from './components/DeviceContainer.vue'
import GameRenderer from './components/GameRenderer.vue'
import TopNavBar from './components/TopNavBar.vue'
import DraggableWindow from './components/UI/DraggableWindow.vue'
import ZoomSlider from './components/UI/ZoomSlider.vue' // Import ZoomSlider
import WinPresentationLayer from './components/Overlays/WinPresentationLayer.vue'
import Sidebar from './features/inspector/components/Sidebar.vue'
import SequencerPanel from './features/sequencer/components/SequencerPanel.vue'
import { useCanvasPanZoom } from './features/workbench/composables/useCanvasPanZoom'
import { useWindowLayerManager } from './features/workbench/composables/useWindowLayerManager'

const lightTheme: GlobalThemeOverrides = {
  common: {
    baseColor: '#FFFFFF',
    primaryColor: '#18a058',
  },
}

const { previewScale, isPanning, handleMouseDown, handleMouseMove, stopPanning, deviceTransformStyle } =
  useCanvasPanZoom()
const { zIndices, bringToFront } = useWindowLayerManager()

// Initial Positions (Calculated once on setup)
const inspectorInitialX = window.innerWidth - 340
const templateInitialX = 20
const sequencerInitialX = window.innerWidth / 2 - 550
const sequencerInitialY = window.innerHeight - 300
</script>

<template>
  <n-config-provider :theme-overrides="lightTheme">
    <n-message-provider>
      <!-- Main Canvas Container (Full Screen, Relative) -->
      <main 
        class="w-screen h-screen relative overflow-hidden bg-gray-100 flex items-center justify-center transition-colors"
        :class="{ 'cursor-grab': !isPanning, 'cursor-grabbing': isPanning }"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="stopPanning"
        @mouseleave="stopPanning"
      >
        
        <!-- Zoom Slider (Fixed Left) -->
        <ZoomSlider v-model="previewScale" />

        <DeviceContainer
            :style="deviceTransformStyle"
        >
            <GameRenderer />
            <WinPresentationLayer />
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
            :initiallyCollapsed="true"
            @focus="bringToFront('inspector')"
        >
            <Sidebar />
        </DraggableWindow>

        <!-- 3. Director Console (Bottom Center) -->
        <DraggableWindow 
            title="Director Console" 
            :initialX="sequencerInitialX" 
            :initialY="sequencerInitialY" 
            width="1100px"
            :zIndex="zIndices.sequencer"
            :resizable="true"
            :initiallyCollapsed="true"
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
