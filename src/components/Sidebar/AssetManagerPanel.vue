<script setup lang="ts">
import { computed } from 'vue'
import { useManifestStore } from '../../stores/manifest'
import { useForgeStore } from '../../stores/forgeStore'

const manifestStore = useManifestStore()
const forgeStore = useForgeStore()

// Extract unique assets from current layout template (BOM - Bill of Materials)
const assetBOM = computed(() => {
  const elements = manifestStore.manifest.layout_elements
  const uniqueAssets = new Map<string, { id: string, specWidth: number, specHeight: number }>()
  
  elements.forEach(el => {
    if (el.asset_src) {
      // Extract asset ID from path (e.g., '/assets/images/btn_spin.png' -> 'btn_spin')
      const match = el.asset_src.match(/\/([^\/]+)\.(png|jpg|jpeg|webp|svg)$/i)
      if (match && match[1]) {
        const assetId = match[1]
        if (!uniqueAssets.has(assetId)) {
          uniqueAssets.set(assetId, {
            id: assetId,
            specWidth: el.rect_landscape.w,
            specHeight: el.rect_landscape.h
          })
        }
      }
    }
  })
  
  return Array.from(uniqueAssets.values())
})

// Single file upload handler
const handleSingleUpload = async (assetId: string, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  try {
    await forgeStore.uploadAsset(assetId, file)
  } catch (error) {
    alert(`Failed to upload: ${error}`)
  } finally {
    input.value = '' // Reset input
  }
}

// Batch upload handler
const handleBatchUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return
  
  let uploadCount = 0
  for (const file of Array.from(files)) {
    // Extract filename without extension
    const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
    
    // Check if this filename matches any asset ID
    const matchingAsset = assetBOM.value.find(asset => asset.id === filenameWithoutExt)
    if (matchingAsset) {
      try {
        await forgeStore.uploadAsset(matchingAsset.id, file)
        uploadCount++
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
      }
    }
  }
  
  alert(`Batch upload complete: ${uploadCount}/${files.length} files matched`)
  input.value = '' // Reset input
}

// Reset all custom assets
const handleResetAll = () => {
  if (confirm('Are you sure you want to reset all custom assets?')) {
    forgeStore.resetAssets()
  }
}

// Screenshot export
const downloadScreenshot = () => {
  const stage = (window as any).Konva?.stages[0]
  if (!stage) {
    alert('Unable to access stage')
    return
  }
  
  const dataURL = stage.toDataURL({ 
    pixelRatio: 2, 
    mimeType: 'image/jpeg', 
    quality: 0.9 
  })
  
  const link = document.createElement('a')
  link.download = `slotforge_snapshot_${Date.now()}.jpg`
  link.href = dataURL
  link.click()
}

// Get status and warning for each asset
const getAssetStatus = (assetId: string) => {
  const customAsset = forgeStore.getAsset(assetId)
  return customAsset ? 'Custom' : 'Default'
}

const getSizeWarning = (assetId: string, specWidth: number, specHeight: number) => {
  const customAsset = forgeStore.getAsset(assetId)
  if (!customAsset) return null
  
  if (customAsset.width !== specWidth || customAsset.height !== specHeight) {
    return `Size mismatch: ${customAsset.width}x${customAsset.height}`
  }
  return null
}
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <h2 class="font-bold text-gray-700">Asset Manager</h2>
      <p class="text-xs text-gray-500 mt-1">Manage template assets ({{ assetBOM.length }} unique)</p>
    </div>

    <!-- Toolbar -->
    <div class="p-3 border-b border-gray-100 bg-gray-50 flex gap-2">
      <label class="flex-1 cursor-pointer">
        <input 
          type="file" 
          multiple 
          accept="image/*"
          @change="handleBatchUpload"
          class="hidden"
        />
        <div class="px-3 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-semibold rounded hover:bg-gray-50 transition-colors text-center shadow-sm">
          Batch Upload
        </div>
      </label>
      <button 
        @click="handleResetAll"
        class="px-3 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-semibold rounded hover:bg-gray-50 transition-colors shadow-sm"
      >
        Reset All
      </button>
    </div>

    <!-- Asset List (BOM) -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <div 
        v-for="asset in assetBOM" 
        :key="asset.id"
        class="border border-gray-200 rounded-lg p-3 hover:border-gray-400 transition-colors"
      >
        <!-- Asset ID -->
        <div class="flex items-center justify-between mb-2">
          <span class="font-mono text-sm font-semibold text-gray-900">{{ asset.id }}</span>
          <span 
            :class="[
              'text-xs px-2 py-0.5 rounded font-semibold border',
              getAssetStatus(asset.id) === 'Custom' 
                ? 'bg-gray-100 text-gray-900 border-gray-300' 
                : 'bg-gray-50 text-gray-400 border-gray-200'
            ]"
          >
            {{ getAssetStatus(asset.id) }}
          </span>
        </div>

        <!-- Spec & Warning -->
        <div class="text-xs text-gray-500 mb-2">
          <span class="font-semibold">Spec:</span> {{ asset.specWidth }}×{{ asset.specHeight }}
          <div 
            v-if="getSizeWarning(asset.id, asset.specWidth, asset.specHeight)"
            class="text-orange-600 font-semibold mt-1"
          >
            ⚠️ {{ getSizeWarning(asset.id, asset.specWidth, asset.specHeight) }}
          </div>
        </div>

        <!-- Upload Action -->
        <label class="block cursor-pointer">
          <input 
            type="file" 
            accept="image/*"
            @change="(e) => handleSingleUpload(asset.id, e)"
            class="hidden"
          />
          <div class="px-3 py-1.5 bg-white text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 transition-colors text-center border border-gray-300">
            Upload Replacement
          </div>
        </label>
      </div>

      <div v-if="assetBOM.length === 0" class="text-center text-gray-400 py-8">
        No assets found in current template
      </div>
    </div>

    <!-- Screenshot Export -->
    <div class="border-t border-gray-200">
      <button 
        @click="downloadScreenshot"
        class="w-full py-4 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-all border-t border-white"
      >
        Export Screenshot
      </button>
    </div>
  </div>
</template>
