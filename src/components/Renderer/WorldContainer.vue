<script setup lang="ts">
import { ref } from 'vue'



// State
const scale = ref(1)
const position = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })

// Config
const MIN_SCALE = 0.1
const MAX_SCALE = 5.0
const ZOOM_SENSITIVITY = 0.001

function handleWheel(e: WheelEvent) {
  e.preventDefault()
  
  const zoomFactor = -e.deltaY * ZOOM_SENSITIVITY
  let newScale = scale.value * (1 + zoomFactor)
  newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE)
  
  // Calculate mouse position relative to container
  // To zoom towards mouse, we'd need more complex math adjusting position
  // For now, center zoom or simple zoom is acceptable for Phase 6 MVP
  scale.value = newScale
}

function handleMouseDown(e: MouseEvent) {
  if (e.button === 2) { // Right click
    e.preventDefault()
    isPanning.value = true
    lastMousePos.value = { x: e.clientX, y: e.clientY }
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!isPanning.value) return
  
  const dx = e.clientX - lastMousePos.value.x
  const dy = e.clientY - lastMousePos.value.y
  
  position.value.x += dx
  position.value.y += dy
  
  lastMousePos.value = { x: e.clientX, y: e.clientY }
}

function handleMouseUp() {
  isPanning.value = false
}

function handleContextMenu(e: MouseEvent) {
  e.preventDefault()
}

// Reset view helper if needed
function resetView() {
  scale.value = 1
  position.value = { x: 0, y: 0 }
}

defineExpose({ resetView })
</script>

<template>
  <div 
    class="world-container relative overflow-hidden bg-gray-100 w-full h-full cursor-grab active:cursor-grabbing"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @contextmenu="handleContextMenu"
  >
    <!-- Background Dot Grid -->
    <div 
      class="dot-grid absolute inset-0 pointer-events-none"
      :style="{
        backgroundPosition: `${position.x}px ${position.y}px`,
        backgroundSize: `${20 * scale}px ${20 * scale}px`
      }"
    ></div>

    <!-- World Layer -->
    <div 
      class="world-layer absolute left-1/2 top-1/2 origin-center will-change-transform"
      :style="{
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`
      }"
    >
      <slot />
    </div>
    
    <!-- Info Debug (Optional, can be removed) -->
    <div class="absolute bottom-4 right-4 bg-white/80 p-2 rounded text-xs pointer-events-none">
       Scale: {{ scale.toFixed(2) }} | Pos: {{ position.x.toFixed(0) }}, {{ position.y.toFixed(0) }}
    </div>
  </div>
</template>

<style scoped>
.world-container {
  /* Tailwind Zinc-100 equivalent */
  background-color: #F3F4F6; 
}

.dot-grid {
  /* Dynamic dot grid that scales logically or stays fixed? 
     User requested 'dot grid pattern'. 
     Usually dot grids stay fixed size but pan, OR scale with world. 
     Let's make it fixed size dots that pan, so it feels like a floor. */
  background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
  /* The size in style binding handles panning */
  opacity: 0.5;
}
</style>
