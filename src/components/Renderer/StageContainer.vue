<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Stage, Layer, Rect as VRect } from 'vue-konva'
import BlueprintLayer from './Layers/BlueprintLayer.vue'
import PrototypeLayer from './Layers/PrototypeLayer.vue'
import { useForgeStore } from '@/stores/forge'
import { getFrameState, type FrameState } from '@/logic/sequencer'
import { useAutoFit } from '@/composables/useAutoFit'

const forgeStore = useForgeStore()

// Container ref
const containerRef = ref<HTMLElement | null>(null)

// Get orientation and base resolution from manifest
const orientation = computed(() => forgeStore.orientation)
const baseResolution = computed(() => forgeStore.baseResolution)

// Auto-fit logic
const {
  scaleFactor,
  stageWidth,
  stageHeight,
  stageOffsetX,
  stageOffsetY,
  screenToStage
} = useAutoFit({
  baseResolution,
  containerRef,
  orientation,
  manualZoom: computed(() => forgeStore.manualZoom)
})

// Mouse position tracking
const mousePosition = ref({ x: 0, y: 0 })

function handleMouseMove(e: MouseEvent) {
  const stagePos = screenToStage(e.clientX, e.clientY)
  mousePosition.value = stagePos
}

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

// Drag & Drop state
const isDraggingFile = ref(false)
const blobUrls = ref<Set<string>>(new Set())

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
  isDraggingFile.value = true
}

function handleDragLeave() {
  isDraggingFile.value = false
}

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
  
  const blobUrl = URL.createObjectURL(file)
  blobUrls.value.add(blobUrl)
  
  const stagePos = screenToStage(e.clientX, e.clientY)
  
  const targetElement = forgeStore.layoutElements.find(el => {
    const elementRect = forgeStore.orientation === 'landscape' 
      ? el.rect_landscape 
      : el.rect_portrait
    return (
      stagePos.x >= elementRect.x &&
      stagePos.x <= elementRect.x + elementRect.w &&
      stagePos.y >= elementRect.y &&
      stagePos.y <= elementRect.y + elementRect.h
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

function cleanupBlobUrls() {
  blobUrls.value.forEach(url => URL.revokeObjectURL(url))
  blobUrls.value.clear()
}

</script>

<template>
  <div 
    ref="containerRef"
    class="stage-container"
    :class="[
      { 'dragging-file': isDraggingFile },
      orientation === 'landscape' ? 'landscape' : 'portrait'
    ]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @mousemove="handleMouseMove"
  >
    <div class="stage-wrapper" :style="{
      transform: `translate(${stageOffsetX}px, ${stageOffsetY}px)`
    }">
      <Stage
        :config="{
          width: stageWidth,
          height: stageHeight,
          scaleX: scaleFactor,
          scaleY: scaleFactor,
          x: 0,
          y: 0
        }"
      >
        <!-- Background Layer -->
        <Layer>
          <VRect
            :config="{
              x: 0,
              y: 0,
              width: stageWidth,
              height: stageHeight,
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
    </div>
    
    <!-- Dynamic Island (toggleable) -->
    <div 
      v-if="forgeStore.showDynamicIsland" 
      class="dynamic-island"
      :class="{ 'portrait': orientation === 'portrait' }"
    >
    </div>
    
    <!-- Safe Area Guide (toggleable) -->
    <div 
      v-if="forgeStore.showSafeAreaGuide" 
      class="safe-area-guide"
      :style="{
        top: `${forgeStore.artSpec?.safe_area_margin || 40}px`,
        left: `${forgeStore.artSpec?.safe_area_margin || 40}px`,
        right: `${forgeStore.artSpec?.safe_area_margin || 40}px`,
        bottom: `${forgeStore.artSpec?.safe_area_margin || 40}px`
      }"
    >
    </div>
    
    <!-- Toggle Buttons -->
    <div class="ui-toggles">
      <button 
        class="toggle-btn" 
        @click="forgeStore.toggleDynamicIsland"
        :title="forgeStore.showDynamicIsland ? 'Hide Dynamic Island' : 'Show Dynamic Island'"
      >
        {{ forgeStore.showDynamicIsland ? '👁️' : '👁️‍🗨️' }}
      </button>
      <button 
        class="toggle-btn" 
        @click="forgeStore.toggleSafeAreaGuide"
        :title="forgeStore.showSafeAreaGuide ? 'Hide Safe Area' : 'Show Safe Area'"
      >
        {{ forgeStore.showSafeAreaGuide ? '🔲' : '⬜' }}
      </button>
    </div>
    
    <!-- Info Overlay -->
    <div class="stage-info-overlay">
      <span>{{ baseResolution.w }} × {{ baseResolution.h }}</span>
      <span>{{ orientation }}</span>
      <span>{{ forgeStore.currentTime.toFixed(0) }}ms</span>
      <span>{{ (scaleFactor * 100).toFixed(0) }}%</span>
    </div>
    
    <!-- Mouse Position Debug -->
    <div class="mouse-position-overlay">
      <span>X: {{ Math.round(mousePosition.x) }}</span>
      <span>Y: {{ Math.round(mousePosition.y) }}</span>
    </div>
  </div>
</template>

<style scoped>
.stage-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  
  /* Phone shell styling */
  border: 8px solid #333;
  border-radius: 3rem;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  
  overflow: hidden;
  background: #000;
  cursor: crosshair;
}

/* Dynamic aspect ratio based on orientation */
.stage-container.landscape {
  aspect-ratio: 16 / 9;
}

.stage-container.portrait {
  aspect-ratio: 9 / 16;
}

.stage-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Info Overlay */
.stage-info-overlay {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  
  font-size: 0.7rem;
  color: #a1a1aa;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  
  z-index: 100;
  pointer-events: none;
}

.stage-info-overlay span {
  white-space: nowrap;
}

/* Mouse Position Overlay */
.mouse-position-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
  
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  
  background: rgba(167, 139, 250, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 0.5rem;
  
  font-size: 0.7rem;
  color: #a78bfa;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  
  z-index: 100;
  pointer-events: none;
}

.mouse-position-overlay span {
  white-space: nowrap;
}

/* Dynamic Island */
.dynamic-island {
  position: absolute;
  width: 120px;
  height: 35px;
  background: #000;
  border-radius: 20px;
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.5);
  z-index: 200;
  pointer-events: none;
  
  /* Landscape: left side */
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.dynamic-island.portrait {
  /* Portrait: top center */
  left: 50%;
  top: 1rem;
  transform: translateX(-50%);
  width: 100px;
  height: 30px;
}

/* Safe Area Guide */
.safe-area-guide {
  position: absolute;
  border: 2px solid rgba(255, 0, 0, 0.5);
  border-radius: 0.5rem;
  pointer-events: none;
  z-index: 150;
  background: rgba(255, 0, 0, 0.05);
}

/* UI Toggle Buttons */
.ui-toggles {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  z-index: 250;
}

.toggle-btn {
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.toggle-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

</style>
