<script setup lang="ts">
import { ref } from 'vue'
import { NConfigProvider, type GlobalThemeOverrides, NMessageProvider } from 'naive-ui'
import DeviceContainer from './components/DeviceContainer.vue'
import GameRenderer from './components/GameRenderer.vue'
import Sidebar from './components/Sidebar/Sidebar.vue'
import TopNavBar from './components/TopNavBar.vue'
import DraggableWindow from './components/UI/DraggableWindow.vue'
import SequencerPanel from './components/Sequencer/SequencerPanel.vue'
import ZoomSlider from './components/UI/ZoomSlider.vue' // Import ZoomSlider
import WinPresentationLayer from './components/Overlays/WinPresentationLayer.vue'

const lightTheme: GlobalThemeOverrides = {
  common: {
    baseColor: '#FFFFFF',
    primaryColor: '#18a058',
  },
}

// Global Zoom State
const previewScale = ref(1.0)

// Initial Positions (Calculated once on setup)
const inspectorInitialX = window.innerWidth - 340
const templateInitialX = 20
const sequencerInitialX = window.innerWidth / 2 - 550
const sequencerInitialY = window.innerHeight - 300

// Z-Index Management
const zIndices = ref({
    templates: 50,
    inspector: 50,
    sequencer: 50
})

const bringToFront = (key: 'templates' | 'inspector' | 'sequencer') => {
    const maxZ = Math.max(zIndices.value.templates, zIndices.value.inspector, zIndices.value.sequencer)
    zIndices.value[key] = maxZ + 1
}

// Canvas Panning State
const isPanning = ref(false)
const panOffset = ref({ x: 0, y: 0 })
const dragStart = ref({ x: 0, y: 0 })

const handleMouseDown = (e: MouseEvent) => {
    // Check if target is interactive (window or slider)
    const target = e.target as HTMLElement
    if (target.closest('.draggable-window') || target.closest('.zoom-slider')) {
        return
    }

    isPanning.value = true
    dragStart.value = { 
        x: e.clientX - panOffset.value.x, 
        y: e.clientY - panOffset.value.y 
    }
}

const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning.value) return
    
    panOffset.value = {
        x: e.clientX - dragStart.value.x,
        y: e.clientY - dragStart.value.y
    }
}

const stopPanning = () => {
    isPanning.value = false
}

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
            :style="{ 
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${previewScale})`, 
                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                pointerEvents: isPanning ? 'none' : 'auto'
            }"
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
