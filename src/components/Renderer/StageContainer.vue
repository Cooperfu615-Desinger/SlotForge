<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Stage, Layer, Rect as VRect } from 'vue-konva'
import BlueprintLayer from './Layers/BlueprintLayer.vue'
import PrototypeLayer from './Layers/PrototypeLayer.vue'
import { useForgeStore } from '@/stores/forge'
import { getFrameState, type FrameState } from '@/logic/sequencer'

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

// --- Render Loop & Sequencer ---
const frameState = ref<FrameState>({})
let animationFrameId: number | null = null
let lastTime = 0

// Compute frame state when time changes (Passive)
watch(
  [() => forgeStore.currentTime, () => forgeStore.rhythmSpec, () => forgeStore.layoutElements],
  ([currentTime, rhythmSpec, layoutElements]) => {
    if (layoutElements) {
        frameState.value = getFrameState(currentTime, rhythmSpec, layoutElements)
    }
  },
  { immediate: true }
)

// Active Playback Loop
function animate(timestamp: number) {
    if (!lastTime) lastTime = timestamp
    const deltaTime = timestamp - lastTime
    lastTime = timestamp

    if (forgeStore.isPlaying) {
        // Advance time
        // Note: writing to Pinia on every frame is expensive in a real game,
        // but for this tool it ensures the Gantt chart and Inspector stay in sync.
        const newTime = forgeStore.currentTime + deltaTime
        
        // Loop back if > 5000 (Hardcoded prototype duration)
        // In real app, derived from rhythmSpec total duration
        if (newTime > 5000) {
            forgeStore.setTime(0)
        } else {
            forgeStore.setTime(newTime)
        }
    }

    animationFrameId = requestAnimationFrame(animate)
}

// Start/Stop Loop
onMounted(() => {
    window.addEventListener('resize', handleResize)
    window.addEventListener('mouseup', handleMouseUp)
    
    // Start loop
    animationFrameId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cleanupBlobUrls()
  if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
  }
})

// Handle window resize
function handleResize() {
  stageWidth.value = window.innerWidth * 0.6
  // Approximate height based on layout (top section)
  // Ideally this should be passed as prop or calculated from container
  stageHeight.value = (window.innerHeight * 0.75) // 75% of screen
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

// Drag & Drop state
const isDraggingFile = ref(false)
const dropTargetElement = ref<string | null>(null)
const blobUrls = ref<Set<string>>(new Set())

// Handle drag over
function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
  isDraggingFile.value = true
}

// Handle drag leave
function handleDragLeave() {
  isDraggingFile.value = false
  dropTargetElement.value = null
}

// Handle drop
async function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDraggingFile.value = false
  
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  
  const file = files[0]
  if (!file.type.startsWith('image/')) {
    alert('Please drop an image file')
    return
  }
  
  // Create Blob URL (local only, no upload)
  const blobUrl = URL.createObjectURL(file)
  blobUrls.value.add(blobUrl)
  
  // Determine which element was dropped on
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = (e.clientX - rect.left - stageX.value) / stageScale.value
  const y = (e.clientY - rect.top - stageY.value) / stageScale.value
  
  // Find element at drop position
  const targetElement = forgeStore.layoutElements.find(el => {
    const elementRect = forgeStore.orientation === 'landscape' 
      ? el.rect_landscape 
      : el.rect_portrait
    return (
      x >= elementRect.x &&
      x <= elementRect.x + elementRect.w &&
      y >= elementRect.y &&
      y <= elementRect.y + elementRect.h
    )
  })
  
  if (targetElement) {
    forgeStore.updateElementAsset(targetElement.id, blobUrl)
  } else {
    alert('Please drop the image on an element')
    URL.revokeObjectURL(blobUrl)
    blobUrls.value.delete(blobUrl)
  }
}

// Cleanup blob URLs on unmount
function cleanupBlobUrls() {
  blobUrls.value.forEach(url => URL.revokeObjectURL(url))
  blobUrls.value.clear()
}

</script>

<template>
  <div 
    class="stage-container"
    :class="{ 'dragging-file': isDraggingFile }"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @contextmenu="handleContextMenu"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="stage-header">
      <h3>Blueprint Renderer</h3>
      <div class="stage-info">
        <span>Resolution: {{ baseResolution.w }} x {{ baseResolution.h }} | Time: {{ forgeStore.currentTime.toFixed(0) }}ms</span>
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
          <VRect
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
        
        <!-- Blueprint Layer (wireframe) -->
        <BlueprintLayer :frame-state="frameState" />
        
        <!-- Prototype Layer (images) -->
        <PrototypeLayer :frame-state="frameState" />
      </Stage>
    </div>
    
    <div class="stage-controls">
      <button @click="stageScale = 1; stageX = 0; stageY = 0">Reset View</button>
      <span class="hint">💡 Scroll to zoom | Right-click to pan | Drag images to elements</span>
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
