<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref<HTMLElement | null>(null)
// Scale the entire "Phone Wrapper" to fit the window, preserving aspect ratio.
const wrapperScale = ref(1)

// Responsive Scaling Logic:
// - Phone frame: 1400px (width) × 750px (height)
// - Fixed padding: 40px (horizontal) + 20px (vertical)
// - Scale dynamically to fit available space while maintaining aspect ratio
// - Never clips or crops the phone frame

const updateScale = () => {
  if (!containerRef.value) return
  
  const parent = containerRef.value
  const { clientWidth, clientHeight } = parent
  
  // Phone frame dimensions (actual size including bezels)
  const PHONE_WIDTH = 1400
  const PHONE_HEIGHT = 750
  
  // Fixed padding (in pixels)
  const PADDING_HORIZONTAL = 40  // Left + Right
  const PADDING_VERTICAL = 20    // Top + Bottom
  
  // Calculate available space after padding
  const availableWidth = clientWidth - (PADDING_HORIZONTAL * 2)
  const availableHeight = clientHeight - (PADDING_VERTICAL * 2)
  
  // Calculate scale ratios
  const scaleX = availableWidth / PHONE_WIDTH
  const scaleY = availableHeight / PHONE_HEIGHT
  
  // Use the smaller scale to ensure the phone fits completely
  // Cap at 1.0 to prevent upscaling beyond original size
  wrapperScale.value = Math.min(scaleX, scaleY, 1.0)
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
  <!-- Added padding to ensure visual spacing around phone frame -->
  <div 
    ref="containerRef" 
    class="w-full h-full flex items-center justify-center bg-gray-100 overflow-hidden"
    style="padding: 20px 40px;"
  >
    
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
