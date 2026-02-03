<script setup lang="ts">
import { computed } from 'vue'
import { useForgeStore } from '@/stores/forge'
import GanttChart from '@/components/Timeline/GanttChart.vue'

const forgeStore = useForgeStore()
const isPlaying = computed(() => forgeStore.isPlaying)

function togglePlay() {
  forgeStore.togglePlayback()
}
</script>

<template>
  <div class="w-full h-full bg-white border border-gray-200 rounded-2xl shadow-lg flex items-center p-4 gap-4">
    <!-- Play Control -->
    <div class="flex-none flex flex-col items-center gap-2 border-r pr-4 border-gray-100">
      <div class="flex gap-2 mb-1">
        <span class="text-[10px] text-gray-400 font-bold uppercase">Average Spin</span>
        <button class="bg-red-500 text-white text-[10px] px-2 rounded-full">Fast SPIN</button>
      </div>

      <button 
        class="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
        @click="togglePlay"
      >
        <span class="text-3xl ml-1" v-if="!isPlaying">▶</span>
        <span class="text-3xl" v-else>⏸</span>
      </button>

      <div class="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden relative">
         <div class="absolute left-0 top-0 bottom-0 bg-blue-500 w-1/3"></div> <!-- Placeholder progress -->
      </div>
    </div>
    
    <!-- Timeline Chart -->
    <div class="flex-1 h-full overflow-hidden relative">
      <GanttChart />
      
      <!-- Time Markers Overlay (Visual only, ideally GanttChart handles this) -->
      <div class="absolute top-0 left-0 w-full h-6 border-b border-gray-100 flex text-[10px] text-gray-400 pointer-events-none">
         <div class="flex-1 border-l border-gray-100 pl-1">0.50s</div>
         <div class="flex-1 border-l border-gray-100 pl-1">1.00s</div>
         <div class="flex-1 border-l border-gray-100 pl-1">1.50s</div>
         <div class="flex-1 border-l border-gray-100 pl-1">2.00s</div>
         <div class="flex-1 border-l border-gray-100 pl-1">2.50s</div>
         <div class="flex-1 border-l border-gray-100 pl-1">3.00s</div>
      </div>
    </div>
  </div>
</template>



<style scoped>
/* Scoped styles removed in favor of Tailwind classes */
</style>
