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
  
  // Force include required symbols
  const requiredSymbols = [
    'sym_scatter', 'sym_wild',
    'sym_h1', 'sym_h2', 'sym_h3', 'sym_h4',
    'sym_l1', 'sym_l2', 'sym_l3', 'sym_l4'
  ]

  // Helper to find a reference size for missing symbols
  // Try to find any symbol's size, or default to 120x120
  const getReferenceSize = () => {
    for (const [_, asset] of uniqueAssets) {
      if (asset.id.startsWith('sym_')) {
        return { w: asset.specWidth, h: asset.specHeight }
      }
    }
    return { w: 120, h: 120 }
  }

  const refSize = getReferenceSize()

  requiredSymbols.forEach(symId => {
    if (!uniqueAssets.has(symId)) {
      uniqueAssets.set(symId, {
        id: symId,
        specWidth: refSize.w,
        specHeight: refSize.h
      })
    }
  })

  // Force include Win Assets
  const winAssets = ['win_small', 'win_big', 'win_mega', 'win_super', 'win_epic']
  winAssets.forEach(winId => {
    if (!uniqueAssets.has(winId)) {
      uniqueAssets.set(winId, {
        id: winId,
        specWidth: 600, // Default spec size for win images
        specHeight: 300
      })
    }
  })
  
  const bom = Array.from(uniqueAssets.values())

  // Weighted Sort
  // High Symbols: sym_h1 -> sym_h4
  // Low Symbols: sym_l1 -> sym_l4
  // Special: sym_scatter -> sym_wild
  // Others: Alphabetical

  const getSymbolRank = (id: string) => {
    if (id.startsWith('sym_h')) return 1
    if (id.startsWith('sym_l')) return 2
    if (id === 'sym_scatter') return 3
    if (id === 'sym_wild') return 4
    if (id.startsWith('win_')) return 0 // Win assets at top
    return 5
  }

  return bom.sort((a, b) => {
    const rankA = getSymbolRank(a.id)
    const rankB = getSymbolRank(b.id)
    
    // Primary Sort: Rank
    if (rankA !== rankB) {
      return rankA - rankB
    }

    // Secondary Sort: ID (Alphabetical)
    return a.id.localeCompare(b.id)
  })
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
  
  alert(`批次上傳完成：已匹配 ${uploadCount}/${files.length} 個檔案`)
  input.value = '' // Reset input
}

// Reset all custom assets
const handleResetAll = () => {
  if (confirm('確定要重置所有自訂素材嗎？')) {
    forgeStore.resetAssets()
  }
}

// Screenshot export
const downloadScreenshot = () => {
  const stage = (window as any).Konva?.stages[0]
  if (!stage) {
    alert('無法存取畫布')
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
  return customAsset ? '自訂' : '系統預設'
}

const getSizeWarning = (assetId: string, specWidth: number, specHeight: number) => {
  const customAsset = forgeStore.getAsset(assetId)
  if (!customAsset) return null
  
  if (customAsset.width !== specWidth || customAsset.height !== specHeight) {
    return `⚠️ 原圖 ${customAsset.width}x${customAsset.height} (將自動縮放)`
  }
  if (customAsset.width !== specWidth || customAsset.height !== specHeight) {
    return `⚠️ 原圖 ${customAsset.width}x${customAsset.height} (將自動縮放)`
  }
  return null
}

const updateSize = (assetId: string, type: 'w' | 'h', value: string) => {
  const numVal = parseInt(value)
  if (isNaN(numVal)) return

  const customAsset = forgeStore.getAsset(assetId)
  if (!customAsset) return

  // Current display values or fallback to spec
  const currentW = customAsset.displayW ?? assetBOM.value.find(a => a.id === assetId)?.specWidth ?? 0
  const currentH = customAsset.displayH ?? assetBOM.value.find(a => a.id === assetId)?.specHeight ?? 0

  if (type === 'w') {
    forgeStore.updateAssetSize(assetId, numVal, currentH)
  } else {
    forgeStore.updateAssetSize(assetId, currentW, numVal)
  }
}

const updateOffset = (assetId: string, type: 'x' | 'y', value: string) => {
  const numVal = parseInt(value)
  if (isNaN(numVal)) return

  const customAsset = forgeStore.getAsset(assetId)
  if (!customAsset) return

  const currentX = customAsset.offsetX ?? 0
  const currentY = customAsset.offsetY ?? 0

  if (type === 'x') {
    forgeStore.updateAssetOffset(assetId, numVal, currentY)
  } else {
    forgeStore.updateAssetOffset(assetId, currentX, numVal)
  }
}

const getDisplaySize = (assetId: string) => {
  const customAsset = forgeStore.getAsset(assetId)
  const spec = assetBOM.value.find(a => a.id === assetId)
  
  return {
    w: customAsset?.displayW ?? spec?.specWidth ?? 0,
    h: customAsset?.displayH ?? spec?.specHeight ?? 0
  }
}

const getDisplayOffset = (assetId: string) => {
  const customAsset = forgeStore.getAsset(assetId)
  return {
    x: customAsset?.offsetX ?? 0,
    y: customAsset?.offsetY ?? 0
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <h2 class="font-bold text-gray-700">素材管理器</h2>
      <p class="text-xs text-gray-500 mt-1">管理當前模版素材 (共 {{ assetBOM.length }} 項)</p>
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
          批次上傳
        </div>
      </label>
      <button 
        @click="handleResetAll"
        class="px-3 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-semibold rounded hover:bg-gray-50 transition-colors shadow-sm"
      >
        全部重置
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
              getAssetStatus(asset.id) === '自訂' 
                ? 'bg-gray-100 text-gray-900 border-gray-300' 
                : 'bg-gray-50 text-gray-400 border-gray-200'
            ]"
          >
            {{ getAssetStatus(asset.id) }}
          </span>
        </div>

        <!-- Spec & Warning -->
        <div class="text-xs text-gray-500 mb-2">
          <span class="font-semibold">建議尺寸:</span> {{ asset.specWidth }}×{{ asset.specHeight }}
          <div 
            v-if="getSizeWarning(asset.id, asset.specWidth, asset.specHeight)"
            class="text-yellow-600 font-semibold mt-1"
          >
            ⚠️ {{ getSizeWarning(asset.id, asset.specWidth, asset.specHeight) }}
          </div>
        </div>

        <!-- Size Override Controls (Custom Assets Only) -->
        <div v-if="getAssetStatus(asset.id) === '自訂'" class="mb-3 p-2 bg-gray-50 rounded border border-gray-100">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-bold text-gray-500">尺寸調整:</span>
            <button 
              @click="forgeStore.resetAssetSize(asset.id)"
              class="text-[10px] px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
            >
              ↺ 重置
            </button>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex-1 flex items-center gap-1">
              <label class="text-xs text-gray-400 font-mono">寬</label>
              <input 
                type="number" 
                :value="getDisplaySize(asset.id).w"
                @input="(e) => updateSize(asset.id, 'w', (e.target as HTMLInputElement).value)"
                class="w-full px-1 py-1 text-xs border border-gray-200 rounded text-center font-mono focus:border-cyan-500 outline-none"
              />
            </div>
            <div class="flex-1 flex items-center gap-1">
              <label class="text-xs text-gray-400 font-mono">高</label>
              <input 
                type="number" 
                :value="getDisplaySize(asset.id).h"
                @input="(e) => updateSize(asset.id, 'h', (e.target as HTMLInputElement).value)"
                class="w-full px-1 py-1 text-xs border border-gray-200 rounded text-center font-mono focus:border-cyan-500 outline-none"
              />
            </div>
          </div>
          
          <!-- Offset Controls -->
          <div class="flex items-center gap-2 mb-2 mt-2 pt-2 border-t border-gray-100">
            <span class="text-xs font-bold text-gray-500">偏移調整:</span>
            <button 
              @click="forgeStore.resetAssetOffset(asset.id)"
              class="text-[10px] px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
            >
              ↺ 重置
            </button>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex-1 flex items-center gap-1">
              <label class="text-xs text-gray-400 font-mono">X</label>
              <input 
                type="number" 
                :value="getDisplayOffset(asset.id).x"
                @input="(e) => updateOffset(asset.id, 'x', (e.target as HTMLInputElement).value)"
                class="w-full px-1 py-1 text-xs border border-gray-200 rounded text-center font-mono focus:border-cyan-500 outline-none"
              />
            </div>
            <div class="flex-1 flex items-center gap-1">
              <label class="text-xs text-gray-400 font-mono">Y</label>
              <input 
                type="number" 
                :value="getDisplayOffset(asset.id).y"
                @input="(e) => updateOffset(asset.id, 'y', (e.target as HTMLInputElement).value)"
                class="w-full px-1 py-1 text-xs border border-gray-200 rounded text-center font-mono focus:border-cyan-500 outline-none"
              />
            </div>
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
            更換圖片
          </div>
        </label>
      </div>

      <div v-if="assetBOM.length === 0" class="text-center text-gray-400 py-8">
        當前模版中未找到素材
      </div>
    </div>

    <!-- Screenshot Export -->
    <div class="border-t border-gray-200">
      <button 
        @click="downloadScreenshot"
        class="w-full py-4 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-all border-t border-white"
      >
        匯出畫面截圖
      </button>
    </div>
  </div>
</template>
