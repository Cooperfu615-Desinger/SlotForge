<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useManifestStore } from '../stores/manifest'

const gameStore = useGameStore()
const manifestStore = useManifestStore()

const currentTemplate = computed(() => manifestStore.currentGrid || '3x5')

// Rich Button Definitions (Data Driven)
const templateGroups = [
  {
    id: 'classic',
    label: '1, 3, 5 Lines',
    subLabel: '3x3 Reels',
    template: '3x3',
    defaultLines: 5
  },
  {
    id: 'standard',
    label: '9, 15, 20, 25 Lines',
    subLabel: '3x5 Reels',
    template: '3x5',
    defaultLines: 25
  },
  {
    id: 'highroller',
    label: '50 Lines',
    subLabel: '4x5 Reels',
    template: '4x5',
    defaultLines: 50
  }
]

const handleTemplateSelect = (group: typeof templateGroups[0]) => {
  // 1. Update Game Store (Lines)
  gameStore.setLines(group.defaultLines)
  
  // 2. Load Template (Manifest Store)
  manifestStore.loadTemplate(group.template)
}
</script>

<template>
  <header class="w-full bg-white border-b border-gray-200 shadow-sm z-20">
    <!-- Rich Navigation Ribbon -->
    <div class="flex flex-row overflow-x-auto gap-3 p-2 no-scrollbar">
      
      <button 
        v-for="group in templateGroups" 
        :key="group.id"
        @click="handleTemplateSelect(group)"
        class="flex flex-col items-center justify-center px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer"
        :class="[
          currentTemplate === group.template
            ? 'bg-violet-600 border-violet-600 text-white shadow-md ring-2 ring-violet-200' 
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        ]"
      >
        <!-- Top Line: Line Counts -->
        <span class="font-bold text-sm leading-tight whitespace-nowrap">
          {{ group.label }}
        </span>
        
        <!-- Sub Line: Reel Dimensions -->
        <span class="text-xs opacity-80 mt-0.5 whitespace-nowrap">
          {{ group.subLabel }}
        </span>
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
