<script setup lang="ts">
import { computed } from 'vue'
import { useManifestStore } from '../stores/manifest'

const store = useManifestStore()

const selectedElement = computed(() => {
  if (!store.selectedElementId) return null
  return store.manifest.layout_elements.find(el => el.id === store.selectedElementId)
})

const handleXChange = (value: number | null) => {
  if (selectedElement.value && value !== null) {
    store.updateElementPosition(selectedElement.value.id, value, selectedElement.value.rect_landscape.y)
  }
}

const handleYChange = (value: number | null) => {
  if (selectedElement.value && value !== null) {
    store.updateElementPosition(selectedElement.value.id, selectedElement.value.rect_landscape.x, value)
  }
}
</script>

<template>
  <div class="h-full bg-gray-900 text-white p-4 overflow-y-auto">
    <h2 class="text-lg font-bold mb-4">Inspector</h2>
    
    <div v-if="selectedElement" class="space-y-4">
      <!-- Element Info -->
      <div class="bg-gray-800 p-3 rounded">
        <div class="text-sm text-gray-400">ID</div>
        <div class="font-mono text-cyan-400">{{ selectedElement.id }}</div>
      </div>

      <div class="bg-gray-800 p-3 rounded">
        <div class="text-sm text-gray-400">Type</div>
        <div class="capitalize">{{ selectedElement.type }}</div>
      </div>

      <!-- Position Controls -->
      <div class="bg-gray-800 p-3 rounded space-y-3">
        <div class="text-sm font-semibold text-gray-300 mb-2">Position</div>
        
        <div>
          <label class="text-xs text-gray-400">X</label>
          <n-input-number
            :value="selectedElement.rect_landscape.x"
            @update:value="handleXChange"
            :step="store.snapToGrid ? 10 : 1"
            size="small"
            class="w-full"
          />
        </div>

        <div>
          <label class="text-xs text-gray-400">Y</label>
          <n-input-number
            :value="selectedElement.rect_landscape.y"
            @update:value="handleYChange"
            :step="store.snapToGrid ? 10 : 1"
            size="small"
            class="w-full"
          />
        </div>
      </div>

      <!-- Dimensions -->
      <div class="bg-gray-800 p-3 rounded space-y-2">
        <div class="text-sm font-semibold text-gray-300 mb-2">Dimensions</div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-400">W:</span> 
            <span class="ml-1">{{ selectedElement.rect_landscape.w }}</span>
          </div>
          <div>
            <span class="text-gray-400">H:</span> 
            <span class="ml-1">{{ selectedElement.rect_landscape.h }}</span>
          </div>
        </div>
      </div>

      <!-- Z-Index -->
      <div class="bg-gray-800 p-3 rounded">
        <div class="text-sm text-gray-400">Z-Index</div>
        <div>{{ selectedElement.z_index }}</div>
      </div>
    </div>

    <div v-else class="text-gray-500 text-center mt-8">
      <p>No element selected</p>
      <p class="text-sm mt-2">Click on an element to edit</p>
    </div>
  </div>
</template>

<style scoped>
:deep(.n-input-number) {
  background-color: #1f2937;
}

:deep(.n-input-number input) {
  color: white;
}
</style>
