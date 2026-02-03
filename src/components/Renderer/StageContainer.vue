<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { Stage, Layer, Rect as VRect } from 'vue-konva'
import BlueprintLayer from './Layers/BlueprintLayer.vue'
import { useForgeStore } from '@/stores/forge'
import { getFrameState, type FrameState } from '@/logic/sequencer'

const forgeStore = useForgeStore()

// --- Render Loop & Sequencer ---
const frameState = ref<FrameState>({})
let animationFrameId: number | null = null
let lastTime = 0

function animate(time: number) {
  const delta = time - lastTime
  lastTime = time
  
  if (forgeStore.isPlaying) {
    const newTime = forgeStore.currentTime + delta
    forgeStore.setTime(newTime)
    
    // Check if getFrameState signature matches. Assuming it does or we simplify.
    // frameState.value = getFrameState(forgeStore.currentTime, forgeStore.rhythmSpec, forgeStore.layoutElements)
    // Note: getFrameState might expect valid specs. We pass what we have.
    if (forgeStore.layoutElements) {
         frameState.value = getFrameState(forgeStore.currentTime, forgeStore.rhythmSpec, forgeStore.layoutElements)
    }
  }
  animationFrameId = requestAnimationFrame(animate)
}

watch(() => forgeStore.isPlaying, (playing) => {
  if (playing) {
    lastTime = performance.now()
    animationFrameId = requestAnimationFrame(animate)
  } else {
    // Stop animation
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
})

onUnmounted(() => {
  if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div class="phone-group relative select-none">
    
    <!-- TOP LAYER: Phone Frame (Z-20) -->
    <!-- Added fallback styles: dashed border if image fails or is transparent -->
    <div class="pointer-events-none absolute inset-0 z-20 pointer-events-none border-4 border-dashed border-gray-300/50 rounded-[3rem] overflow-hidden">
      <img 
        src="@/assets/iphone_frame.png" 
        class="w-full h-full object-contain drop-shadow-2xl"
        alt="iPhone Frame"
      />
    </div>

    <!-- MIDDLE LAYER: HTML UI (Z-10) -->
    <!-- Positioned absolutely to match the 1280x720 screen area -->
    <div 
      class="phone-ui absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col justify-between p-4"
      :style="{ width: '1280px', height: '720px' }"
    >
       <!-- UI elements extracted from previous version -->
       <!-- Dynamic Island (Visual Mock handled by image, but we can add interactive trigger area) -->
       <div class="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-8 z-30 opacity-0 hover:opacity-20 bg-yellow-500 cursor-pointer" title="Dynamic Island Trigger"></div>

       <!-- Header Area -->
       <div class="flex justify-between items-start pointer-events-auto">
          <div class="jackpot-banner px-6 py-2 bg-white border-2 border-gray-800 rounded-lg shadow-[4px_4px_0_0_rgba(31,41,55,1)] font-bold text-xl">
            JACKPOT
          </div>
          <div class="game-logo text-right font-black text-3xl leading-none px-4 drop-shadow-lg text-white">
            SLOT<br>FORGE
          </div>
       </div>

       <!-- Main Content Area -->
       <div class="flex-1 flex items-center gap-4 my-2">
          <!-- Left: Buy Feature -->
          <div class="flex flex-col gap-2 pointer-events-auto">
             <button class="w-24 h-20 bg-white border-2 border-gray-800 rounded-lg shadow-[4px_4px_0_0_rgba(31,41,55,1)] flex flex-col items-center justify-center font-bold hover:translate-y-1 hover:shadow-none transition-all">
                <span>BUY</span>
                <span class="text-xs">FEATURE</span>
             </button>
          </div>

          <!-- Center: Grid Placeholder -->
          <div class="flex-1 h-full mx-4 border-2 border-dashed border-gray-400/50 rounded-xl flex items-center justify-center bg-black/10">
             <div class="text-white/50 font-mono text-sm">3x5 REEL GRID AREA (KONVA BEHIND)</div>
          </div>
       </div>

       <!-- Bottom Controls -->
       <div class="control-bar flex items-center justify-between gap-4 pointer-events-auto">
          <button class="text-3xl text-white hover:scale-110 transition-transform">≡</button>
          
          <div class="flex-1 flex justify-center gap-4">
             <div class="info-box bg-gray-900/80 text-white border border-gray-700 rounded-full px-6 py-1 min-w-[160px] text-center backdrop-blur-sm">
                <div class="text-[10px] text-gray-400 font-bold tracking-wider">BALANCE</div>
                <div class="font-mono text-lg font-bold">$ 999,999.00</div>
             </div>
             <div class="info-box bg-gray-900/80 text-white border border-gray-700 rounded-full px-6 py-1 min-w-[160px] text-center backdrop-blur-sm">
                <div class="text-[10px] text-gray-400 font-bold tracking-wider">BET</div>
                <div class="font-mono text-lg font-bold">5.00</div>
             </div>
          </div>

          <div class="flex items-center gap-3">
             <button class="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-800 flex items-center justify-center text-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none">⚡</button>
             <button class="w-20 h-20 rounded-full bg-green-500 border-4 border-white shadow-lg flex items-center justify-center text-4xl text-white hover:scale-105 active:scale-95 transition-transform">🔄</button>
          </div>
       </div>
    </div>

    <!-- BOTTOM LAYER: Konva Stage (Z-0) -->
    <!-- Fixed size 1280x720, Centered -->
    <div 
      class="konva-container absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 bg-white overflow-hidden"
      :style="{ width: '1280px', height: '720px' }"
    >
      <Stage :config="{ width: 1280, height: 720 }">
        <Layer>
          <!-- Background -->
          <VRect :config="{ x: 0, y: 0, width: 1280, height: 720, fill: '#1F2937' }" /> 
          <!-- Grid Lines (Subtle) -->
          <VRect :config="{ x: 0, y: 0, width: 1280, height: 720, fillPatternImage: null, stroke: '#374151', strokeWidth: 20, strokeScaleEnabled: false }" />
        </Layer>
        
        <BlueprintLayer :frame-state="frameState" />
      </Stage>
    </div>

  </div>
</template>

<style scoped>
.phone-group {
  /* Define the total size of the Phone + Bezel */
  /* iPhone 15 Pro Max is ~ 160mm x 77mm. Aspect ~ 19.5:9 */
  /* We define a fixed logical size for the container, and WorldContainer scales it */
  width: 1450px;
  height: 850px;
  background: transparent;
}
</style>
