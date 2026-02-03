<script setup lang="ts">
import { computed } from 'vue'
import { useManifestStore } from '../stores/manifest'

const store = useManifestStore()

const selectedElement = computed(() => {
  if (!store.selectedElementId) return null
  return store.manifest.layout_elements.find(el => el.id === store.selectedElementId)
})

</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
      <span class="font-bold text-gray-700">Inspector</span>
      <span v-if="selectedElement" class="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded">Selected</span>
    </div>

    <!-- Content -->
    <div v-if="selectedElement" class="p-4 space-y-4 overflow-y-auto flex-1">
      
      <!-- ID Section -->
      <div class="group">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Element ID</label>
        <div class="text-lg font-mono text-gray-900 break-all">{{ selectedElement.id }}</div>
      </div>

      <!-- Asset Section -->
      <div class="group">
         <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset Source</label>
         <div class="mt-1 p-2 bg-gray-100 rounded text-sm text-gray-600 break-all font-mono">
           {{ selectedElement.asset_src || 'No Asset Configured' }}
         </div>
         <!-- Preview Thumb -->
         <div v-if="selectedElement.asset_src" class="mt-2 border border-gray-200 rounded p-1 bg-checkered h-20 flex items-center justify-center">
             <!-- Note: Real image might not load if file missing, but we show path -->
             <img :src="selectedElement.asset_src" class="max-h-full max-w-full object-contain" alt="Preview"/>
         </div>
      </div>

      <!-- Specs Section -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
          <div class="text-gray-900 text-sm">{{ selectedElement.type }}</div>
        </div>
        <div>
           <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Z-Index</label>
           <div class="text-gray-900 text-sm">{{ selectedElement.z_index }}</div>
        </div>
      </div>

      <!-- Coords Section -->
      <div class="bg-gray-50 rounded p-3 border border-gray-200">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Coordinates (Logical)</label>
        <div class="grid grid-cols-2 gap-2 text-sm font-mono">
            <div class="flex justify-between">
                <span class="text-gray-400">X:</span>
                <span>{{ selectedElement.rect_landscape.x }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-400">Y:</span>
                <span>{{ selectedElement.rect_landscape.y }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-400">W:</span>
                <span>{{ selectedElement.rect_landscape.w }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-400">H:</span>
                <span>{{ selectedElement.rect_landscape.h }}</span>
            </div>
        </div>
      </div>

    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
      <svg class="w-12 h-12 mb-2 opacity-20" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
      </svg>
      <p class="text-sm">Select an element to inspect</p>
    </div>

  </div>
</template>

<style scoped>
.bg-checkered {
  background-image: 
    linear-gradient(45deg, #e5e7eb 25%, transparent 25%), 
    linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #e5e7eb 75%), 
    linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
}
</style>
