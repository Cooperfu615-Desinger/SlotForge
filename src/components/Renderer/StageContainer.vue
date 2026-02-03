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
  <div class="stage-container relative select-none w-full h-full overflow-hidden">
     <!-- MIDDLE LAYER: HTML UI (Z-10) -->
     <div class="ui-layer absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
        <!-- Dyn Island -->
        <div class="flex justify-center -mt-2">
           <div v-if="forgeStore.showDynamicIsland" class="bg-black rounded-full w-32 h-8 shadow-lg flex items-center justify-center pointer-events-auto">
              <!-- Simulated Island Content -->
              <div class="w-2 h-2 rounded-full bg-green-500/50 mr-1 animate-pulse"></div>
           </div>
        </div>
 
        <!-- Game UI Overlay (Mock) -->
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <!-- Top Bar -->
            <div class="h-20 flex justify-between items-center px-12 pt-16">
               <div class="bg-white text-black font-black px-4 py-2 rounded shadow-lg border-2 border-slate-900 pointer-events-auto">
                  Buy<br>Feature
               </div>
               <div class="bg-white w-[400px] h-14 rounded border-2 border-slate-900 flex items-center justify-center shadow-lg pointer-events-auto">
                  <span class="font-black text-xl tracking-widest">JACKPOT</span>
               </div>
               <div class="text-slate-900 font-black text-2xl drop-shadow-md pointer-events-auto">GAME<br>LOGO</div>
            </div>
            
            <!-- Bottom Bar -->
            <div class="h-24 bg-white/0 flex justify-between items-center px-6 pb-4">
                <button class="w-12 h-12 rounded-full bg-white border-2 border-slate-900 shadow flex items-center justify-center pointer-events-auto">
                   <span class="text-2xl">≡</span>
                </button>
                
                <!-- Balance / Win -->
                <div class="flex gap-4 pointer-events-auto">
                   <div class="bg-black/90 text-white rounded-full px-6 py-1 border-2 border-amber-500 flex flex-col items-center min-w-[160px]">
                       <span class="text-[10px] text-gray-400">BALANCE</span>
                       <span class="font-bold text-sm">$ 999,999,999.00</span>
                   </div>
                   <div class="bg-black/90 text-white rounded-full px-6 py-1 border border-gray-700 flex flex-col items-center min-w-[160px]">
                       <span class="text-[10px] text-gray-400">BET</span>
                       <div class="flex items-center gap-2">
                          <span>-</span>
                          <span class="font-bold text-sm">999,999.00</span>
                          <span>+</span>
                       </div>
                   </div>
                </div>
 
                <!-- Spin -->
                <div class="flex items-center gap-4 pointer-events-auto">
                   <button class="w-10 h-10 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center">⚡️</button>
                   <button class="w-10 h-10 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center">⟳</button>
                   <button class="w-20 h-20 rounded-full bg-white border-4 border-slate-900 flex items-center justify-center shadow-xl active:scale-95 transition-transform">
                       <span class="text-4xl">↻</span>
                   </button>
                </div>
            </div>
        </div>
     </div>
 
     <!-- BOTTOM LAYER: Konva Stage (Z-0) -->
     <div class="konva-container absolute inset-0 z-0 bg-white">
       <Stage :config="{ width: 1280, height: 720 }">
         <Layer>
           <VRect :config="{ x: 0, y: 0, width: 1280, height: 720, fill: '#1F2937' }" /> 
           <VRect :config="{ x: 0, y: 0, width: 1280, height: 720, fillPatternImage: null, stroke: '#374151', strokeWidth: 20, strokeScaleEnabled: false }" />
         </Layer>
         <BlueprintLayer :frame-state="frameState" />
       </Stage>
     </div>
  </div>
</template>

<style scoped>
/* Scoped styles removed */
</style>
