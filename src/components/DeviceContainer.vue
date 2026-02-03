<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref<HTMLElement | null>(null)
const scale = ref(1)

// New Logical Resolution:
// We base the scale on the "Frame Height" to ensure it fits.
// User requested Frame Height ~ 750px to house the 720px content.
// A typical phone aspect ratio is ~19.5:9 or 20:9.
// If Height is 750, Width might be around 1600.
// Let's define a "Design Space" large enough to hold the phone.
const DESIGN_WIDTH = 1600
const DESIGN_HEIGHT = 750

const updateScale = () => {
  if (!containerRef.value) return
  
  const wrapper = containerRef.value
  const { clientWidth, clientHeight } = wrapper
  
  const scaleX = clientWidth / DESIGN_WIDTH
  const scaleY = clientHeight / DESIGN_HEIGHT
  const minScale = Math.min(scaleX, scaleY)
  
  // 95% fit
  scale.value = minScale * 0.95
}

onMounted(() => {
  window.addEventListener('resize', updateScale)
  setTimeout(updateScale, 0)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})
</script>

<template>
  <!-- Main Resize Wrapper -->
  <div ref="containerRef" class="w-full h-full flex items-center justify-center bg-gray-900">
    
    <!-- Scaled Container (The "World") -->
    <div 
      class="design-layer relative"
      :style="{
        width: `${DESIGN_WIDTH}px`,
        height: `${DESIGN_HEIGHT}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'center center'
      }"
    >
      
      <!-- Layer 1: The Game Canvas (1280x720) -->
      <!-- Absolute Center -->
      <div class="game-layer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1280px] h-[720px] bg-black overflow-hidden shadow-2xl">
         <slot />
      </div>

      <!-- Layer 2: The Phone Frame Overlay -->
      <!-- Absolute Center, Click-Through -->
      <img 
        src="/assets/ui/overlay_frame.png" 
        class="frame-layer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-50"
        style="height: 760px; max-width: none;"
        alt="Device Frame"
      />
      
      <!-- Layer 3: Dynamic Island / Notch (Optional) -->
      <!-- Usually part of frame, but if separate -->
       <!-- <img src="/assets/ui/overlay_notch.png" ... /> -->

    </div>
  
  </div>
</template>

<style scoped>
.design-layer {
  /* Debug Outline */
  /* border: 1px dashed rgba(255,255,255,0.2); */
}
</style>
