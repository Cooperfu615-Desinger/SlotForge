<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref<HTMLElement | null>(null)
// Scale the entire "Phone Wrapper" to fit the window, preserving aspect ratio.
const wrapperScale = ref(1)

// Design Reference:
// Frame Inner Height for 720px content should be around 740px-750px to cover edges.
// Let's assume the "Phone" is roughly 1500x750 in design space (just an example container size).
// The key is: Layer 1 is 1280x720 fixed.
// Layer 2 is the frame centered.

const updateScale = () => {
  if (!containerRef.value) return
  
  const parent = containerRef.value
  const { clientWidth, clientHeight } = parent
  
  // We want to fit a "Virtual Phone Area" into the screen.
  // Let's define a safe area that includes the frame.
  // Frame fits 720px height, so maybe 760px total height tolerance.
  // Width: arbitrary, say 1600px to include side bezels.
  const VIRTUAL_WIDTH = 1400 
  const VIRTUAL_HEIGHT = 760

  const scaleX = clientWidth / VIRTUAL_WIDTH
  const scaleY = clientHeight / VIRTUAL_HEIGHT
  
  // Fit containment
  wrapperScale.value = Math.min(scaleX, scaleY, 1) // Cap at 1.0 to avoid upscaling blur if screen is huge? Or let it grow. User said "Full screen", usually implies fit.
  // Let's remove Cap at 1 for "Fit to screen" experience, but keep aspect ratio.
  wrapperScale.value = Math.min(scaleX, scaleY) * 0.95 // 95% margin
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
  <!-- Main Container (Dark Background) -->
  <div ref="containerRef" class="w-full h-full flex items-center justify-center bg-gray-900 overflow-hidden">
    
    <!-- Scaled Wrapper (The "Phone" Unit) -->
    <!-- This scales uniformly, preserving aspect ratio of everything inside -->
    <div 
      class="relative"
      :style="{
        transform: `scale(${wrapperScale})`,
        transformOrigin: 'center center',
        width: '0px', /* Collapsed to center, children are absolute or rigid */
        height: '0px'
      }"
    >
      
      <!-- Layer 1: Game Canvas (Strict 1280x720) -->
      <!-- Absolute Center -->
      <!-- Background white/black allows 'Pillarbox' effect if frame is wider -->
      <div 
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1280px] h-[720px] bg-white shadow-2xl z-10"
      >
         <slot />
      </div>

      <!-- Layer 2: Phone Hub / Overlay Frame -->
      <!-- Sized to create the 'hole' for the 720px canvas -->
      <!-- If image intrinsic height is huge, we constrain height to ~750px so the hole matches the 720px canvas -->
      <img 
        src="/assets/ui/overlay_frame.png" 
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-50"
        style="height: 750px; max-width: none; width: auto;"
        alt="Device Frame"
      />
      
    </div>
  
  </div>
</template>
