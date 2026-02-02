<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Stage, Layer } from 'vue-konva'
import BlueprintLayer from './Layers/BlueprintLayer.vue'
import { useForgeStore } from '@/stores/forge'

const forgeStore = useForgeStore()

// Stage dimensions
const stageWidth = ref(window.innerWidth * 0.6)
const stageHeight = ref(window.innerHeight)

// Transform state
const stageScale = ref(1)
const stageX = ref(0)
const stageY = ref(0)

// Pan state
const isPanning = ref(false)
const lastPointerPosition = ref({ x: 0, y: 0 })

// Get base resolution from manifest
const baseResolution = computed(() => forgeStore.baseResolution)

// Handle window resize
function handleResize() {
  stageWidth.value = window.innerWidth * 0.6
  stageHeight.value = window.innerHeight
}

// Handle mouse wheel for zoom
function handleWheel(e: WheelEvent) {
  e.preventDefault()
  
  const scaleBy = 1.05
  const stage = e.currentTarget as HTMLDivElement
  const oldScale = stageScale.value
  
  const pointer = {
    x: e.clientX - stage.offsetLeft,
    y: e.clientY - stage.offsetTop
  }
  
  const mousePointTo = {
    x: (pointer.x - stageX.value) / oldScale,
    y: (pointer.y - stageY.value) / oldScale
  }
  
  const newScale = e.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
  
  // Limit scale between 0.1 and 5
  stageScale.value = Math.max(0.1, Math.min(5, newScale))
  
  stageX.value = pointer.x - mousePointTo.x * stageScale.value
  stageY.value = pointer.y - mousePointTo.y * stageScale.value
}

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
  
  stageX.value += dx
  stageY.value += dy
  
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

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div 
    class="stage-container"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @contextmenu="handleContextMenu"
  >
    <div class="stage-header">
      <h3>Blueprint Renderer</h3>
      <div class="stage-info">
        <span>Resolution: {{ baseResolution.w }} x {{ baseResolution.h }}</span>
        <span>Zoom: {{ (stageScale * 100).toFixed(0) }}%</span>
      </div>
    </div>
    
    <div class="canvas-wrapper">
      <Stage
        :config="{
          width: stageWidth,
          height: stageHeight - 60,
          scaleX: stageScale,
          scaleY: stageScale,
          x: stageX,
          y: stageY
        }"
      >
        <!-- Background Grid Layer -->
        <Layer>
          <v-rect
            :config="{
              x: -10000,
              y: -10000,
              width: 20000,
              height: 20000,
              fill: '#18181c',
              listening: false
            }"
          />
        </Layer>
        
        <!-- Blueprint Layer -->
        <BlueprintLayer />
      </Stage>
    </div>
    
    <div class="stage-controls">
      <button @click="stageScale = 1; stageX = 0; stageY = 0">Reset View</button>
      <span class="hint">💡 Scroll to zoom | Right-click drag to pan</span>
    </div>
  </div>
</template>

<style scoped>
.stage-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #18181c;
  cursor: grab;
}

.stage-container:active {
  cursor: grabbing;
}

.stage-header {
  padding: 1rem;
  background: #252526;
  border-bottom: 1px solid #3f3f46;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage-header h3 {
  margin: 0;
  color: #e4e4e7;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stage-info {
  display: flex;
  gap: 1.5rem;
  font-size: 0.75rem;
  color: #a1a1aa;
  font-family: 'Monaco', 'Menlo', monospace;
}

.canvas-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.stage-controls {
  padding: 0.75rem 1rem;
  background: #252526;
  border-top: 1px solid #3f3f46;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage-controls button {
  padding: 0.5rem 1rem;
  background: #3f3f46;
  color: #e4e4e7;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.stage-controls button:hover {
  background: #52525b;
}

.hint {
  font-size: 0.75rem;
  color: #71717a;
}
</style>
