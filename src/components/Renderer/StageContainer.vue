<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Stage, Layer, Rect as VRect } from 'vue-konva'
import BlueprintLayer from './Layers/BlueprintLayer.vue'
import PrototypeLayer from './Layers/PrototypeLayer.vue'
import { useForgeStore } from '@/stores/forge'
import { getFrameState, type FrameState } from '@/logic/sequencer'

const forgeStore = useForgeStore()

// Stage dimensions - Fixed for phone shell
const stageWidth = ref(450)
const stageHeight = ref(800)

// Transform state (zoom only, no pan)
const stageScale = ref(1)
const stageX = ref(0)
const stageY = ref(0)

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
        const newTime = forgeStore.currentTime + deltaTime
        
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
    animationFrameId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cleanupBlobUrls()
  if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
  }
})

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
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <Stage
      :config="{
        width: stageWidth,
        height: stageHeight,
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
            fill: '#000',
            listening: false
          }"
        />
      </Layer>
      
      <!-- Blueprint Layer (wireframe) -->
      <BlueprintLayer :frame-state="frameState" />
      
      <!-- Prototype Layer (images) -->
      <PrototypeLayer :frame-state="frameState" />
    </Stage>
    
    <!-- Info Overlay -->
    <div class="stage-info-overlay">
      <span>{{ baseResolution.w }} × {{ baseResolution.h }}</span>
      <span>{{ forgeStore.currentTime.toFixed(0) }}ms</span>
      <span>{{ (stageScale * 100).toFixed(0) }}%</span>
    </div>
  </div>
</template>

<style scoped>
.stage-container {
  position: relative;
  width: 450px;
  height: 800px;
  
  /* Phone shell styling */
  border: 8px solid #333;
  border-radius: 3rem;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  
  overflow: hidden;
  background: #000;
  cursor: default;
}

.stage-container:active {
  cursor: default;
}

/* Info Overlay */
.stage-info-overlay {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1rem;
  
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  
  font-size: 0.75rem;
  color: #a1a1aa;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  
  z-index: 100;
  pointer-events: none;
}

.stage-info-overlay span {
  white-space: nowrap;
}
</style>
