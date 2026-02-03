<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref<HTMLElement | null>(null)
const scale = ref(1)

// Fixed Logical Resolution
const LOGICAL_WIDTH = 1280
const LOGICAL_HEIGHT = 720

const updateScale = () => {
  if (!containerRef.value) return
  
  const wrapper = containerRef.value
  const { clientWidth, clientHeight } = wrapper
  
  // Calculate scale to fit, adding some padding (e.g. 0.9 factor for breathing room)
  const scaleX = clientWidth / LOGICAL_WIDTH
  const scaleY = clientHeight / LOGICAL_HEIGHT
  const minScale = Math.min(scaleX, scaleY)
  
  // Use 90% of the available space to avoid edges touching
  scale.value = minScale * 0.95
}

onMounted(() => {
  window.addEventListener('resize', updateScale)
  // Initial calculation needs a small tick to ensure DOM is ready
  setTimeout(updateScale, 0)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})
</script>

<template>
  <!-- Wrapper that takes full available space of Center Stage -->
  <div ref="containerRef" class="w-full h-full flex items-center justify-center">
    
    <!-- The physical device screen representation -->
    <div 
      class="device-screen bg-white shadow-2xl relative"
      :style="{
        width: `${LOGICAL_WIDTH}px`,
        height: `${LOGICAL_HEIGHT}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'center center'
      }"
    >
      <!-- Slot Content goes here -->
      <slot />
      
      <!-- Safe Area Guide (Visual Debug) -->
      <div class="absolute inset-0 border-2 border-dashed border-gray-300 pointer-events-none opacity-50"></div>
    </div>
  
  </div>
</template>

<style scoped>
.device-screen {
  /* Ensure clean edges during scaling */
  backface-visibility: hidden;
  will-change: transform;
}
</style>
