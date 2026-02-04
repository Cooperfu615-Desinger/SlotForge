<script setup lang="ts">
import { useManifestStore } from '../stores/manifest'

const store = useManifestStore()

const handleExport = () => {
  const manifest = store.manifest
  const jsonStr = JSON.stringify(manifest, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `manifest_export_${timestamp}.json`
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  
  URL.revokeObjectURL(url)
  console.log('Exported manifest:', filename)
}
</script>

<template>
  <div class="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <h1 class="text-white font-bold text-lg">SlotForge Editor</h1>
      
      <div class="flex items-center gap-2">
        <n-button
          :type="store.isEditMode ? 'primary' : 'default'"
          size="small"
          @click="store.toggleEditMode"
        >
          {{ store.isEditMode ? '✓ Edit Mode' : 'Edit Mode' }}
        </n-button>

        <n-checkbox
          v-model:checked="store.snapToGrid"
          @update:checked="store.toggleSnapToGrid"
          size="small"
        >
          <span class="text-white text-sm">Snap to Grid (10px)</span>
        </n-checkbox>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <n-button
        type="success"
        size="small"
        @click="handleExport"
      >
        📥 Export JSON
      </n-button>
    </div>
  </div>
</template>
