<script setup lang="ts">
import { ref } from 'vue'
import StageContainer from '@/components/Renderer/StageContainer.vue'
import TopNavigationBar from '@/components/Layout/TopNavigationBar.vue'
import EditorPanel from '@/components/Layout/EditorPanel.vue'
import PlayerBar from '@/components/Layout/PlayerBar.vue'

// Pan state for infinite board
const boardX = ref(0)
const boardY = ref(0)
const isPanning = ref(false)
const lastPointerPosition = ref({ x: 0, y: 0 })

// Handle right-click pan start
function handleMouseDown(e: MouseEvent) {
  if (e.button === 2) { // Right click
    e.preventDefault()
    isPanning.value = true
    lastPointerPosition.value = { x: e.clientX, y: e.clientY }
  }
}

// Handle pan move
function handleMouseMove(e: MouseEvent) {
  if (!isPanning.value) return
  
  const dx = e.clientX - lastPointerPosition.value.x
  const dy = e.clientY - lastPointerPosition.value.y
  
  boardX.value += dx
  boardY.value += dy
  
  lastPointerPosition.value = { x: e.clientX, y: e.clientY }
}

// Handle pan end
function handleMouseUp() {
  isPanning.value = false
}

// Prevent context menu on right click
function handleContextMenu(e: MouseEvent) {
  e.preventDefault()
}
</script>

<template>
  <div 
    class="infinite-board"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @contextmenu="handleContextMenu"
    :class="{ panning: isPanning }"
  >
    <!-- Dot Grid Background -->
    <div class="dot-grid-background"></div>
    
    <!-- Phone Shell Container -->
    <div 
      class="phone-shell-wrapper"
      :style="{ transform: `translate(${boardX}px, ${boardY}px)` }"
    >
      <StageContainer />
    </div>
    
    <!-- Floating Panels (Fixed to viewport) -->
    <TopNavigationBar />
    <EditorPanel />
    <PlayerBar />
  </div>
</template>

<style>
/* Global Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

.infinite-board {
  position: fixed;
  inset: 0;
  overflow: hidden;
  cursor: grab;
}

.infinite-board.panning {
  cursor: grabbing;
}

/* Dot Grid Background */
.dot-grid-background {
  position: fixed;
  inset: 0;
  background-color: #18181b;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  z-index: 0;
}

/* Phone Shell Wrapper */
.phone-shell-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  transition: transform 0.1s ease-out;
}
</style>
