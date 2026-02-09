<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useManifestStore } from '../stores/manifest'

const gameStore = useGameStore()
const manifestStore = useManifestStore()

const currentTemplate = computed(() => manifestStore.currentGrid || 'standard_3x5')

// Rich Button Definitions (7 Templates)
const templateGroups = [
  {
    id: 'classic',
    label: 'Classic 3x3',
    subLabel: '1-5 Lines',
    template: 'classic_3x3',
    defaultLines: 5
  },
  {
    id: 'standard',
    label: 'Standard 3x5',
    subLabel: '9-25 Lines',
    template: 'standard_3x5',
    defaultLines: 25
  },
  {
    id: 'ways',
    label: 'Way Game 3x5',
    subLabel: '243 Ways',
    template: 'way_3x5',
    defaultLines: 243
  },
  {
    id: 'extended',
    label: 'Extended 4x5',
    subLabel: '50 Lines / 1024 Ways',
    template: 'extended_4x5',
    defaultLines: 50
  },
  {
    id: 'payanywhere',
    label: 'Pay Anywhere',
    subLabel: 'Tumble Feature',
    template: 'pay_anywhere_6x5',
    defaultLines: 0
  },
  {
    id: 'cluster',
    label: 'Cluster Grid',
    subLabel: 'Cascading',
    template: 'cluster_7x7',
    defaultLines: 0
  },
  {
    id: 'megaways',
    label: 'MegaWays™',
    subLabel: 'Dynamic 6-Reels',
    template: 'megaways_6',
    defaultLines: 117649
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
    <!-- Rich Navigation Ribbon (7 Buttons) -->
    <div class="flex flex-row overflow-x-auto gap-3 p-2 no-scrollbar">
      
      <button 
        v-for="group in templateGroups" 
        :key="group.id"
        @click="handleTemplateSelect(group)"
        class="flex flex-col items-center justify-center px-4 py-2 min-w-[140px] rounded-lg border transition-all cursor-pointer select-none"
        :class="[
          currentTemplate === group.template
            ? 'bg-violet-600 border-violet-600 text-white shadow-md' 
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        ]"
      >
        <!-- Main Label -->
        <span class="font-bold text-sm leading-tight whitespace-nowrap">
          {{ group.label }}
        </span>
        
        <!-- Subtitle -->
        <span class="text-[10px] opacity-80 mt-0.5 uppercase tracking-wide whitespace-nowrap">
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
