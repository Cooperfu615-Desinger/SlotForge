<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useManifestStore } from '../stores/manifest'

const gameStore = useGameStore()
const manifestStore = useManifestStore()

const currentLines = computed(() => gameStore.currentLines)

const templateOptions = [
  { label: "1 Line", grid: "3x3", lines: 1 },
  { label: "3 Lines", grid: "3x3", lines: 3 },
  { label: "5 Lines", grid: "3x3", lines: 5 },
  { label: "9 Lines", grid: "3x5", lines: 9 },
  { label: "15 Lines", grid: "3x5", lines: 15 },
  { label: "20 Lines", grid: "3x5", lines: 20 },
  { label: "25 Lines", grid: "3x5", lines: 25 }, // Default
  { label: "50 Lines", grid: "4x5", lines: 50 }
]

const handleSelect = (option: { label: string, grid: string, lines: number }) => {
  // 1. Update Game Store (Lines)
  gameStore.setLines(option.lines)
  
  // 2. Load Template (Manifest Store)
  manifestStore.loadTemplate(option.grid)
  
  // 3. Re-render is handled by reactivity in stores
}
</script>

<template>
  <header class="w-full bg-white border-b border-gray-200 shadow-sm z-20">
    <!-- Horizontal Scroll Container -->
    <div class="flex flex-row overflow-x-auto gap-3 p-2 no-scrollbar items-center">
      
      <button 
        v-for="opt in templateOptions" 
        :key="opt.lines"
        @click="handleSelect(opt)"
        class="transition-all duration-200 rounded-full px-4 py-1 text-sm font-medium shadow-sm cursor-pointer whitespace-nowrap border"
        :class="[
          currentLines === opt.lines 
            ? 'bg-violet-600 text-white border-violet-600 shadow-md' 
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
        ]"
      >
        {{ opt.label }}
      </button>

    </div>
  </header>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
