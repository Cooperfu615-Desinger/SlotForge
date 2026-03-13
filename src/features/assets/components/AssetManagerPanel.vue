<script setup lang="ts">
import { useForgeStore } from '../../../stores/forgeStore'
import { useAssetBom } from '../composables/useAssetBom'
import { matchesAssetSlotUpload } from '../utils/assetNaming'

const forgeStore = useForgeStore()
const { assetBOM } = useAssetBom()

const handleSingleUpload = async (slotKey: string, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    await forgeStore.uploadAsset(slotKey, file)
  } catch (error) {
    alert(`Failed to upload: ${error}`)
  } finally {
    input.value = ''
  }
}

const handleBatchUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  let uploadCount = 0
  for (const file of Array.from(files)) {
    const matchingAsset = assetBOM.value.find((asset) =>
      matchesAssetSlotUpload(file.name, {
        legacyId: asset.legacyId,
        slotKey: asset.slotKey,
      })
    )
    if (!matchingAsset) continue

    try {
      await forgeStore.uploadAsset(matchingAsset.slotKey, file)
      uploadCount++
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
    }
  }

  alert(`批次上傳完成：已自動對應 ${uploadCount}/${files.length} 個檔案到標準資源槽位`)
  input.value = ''
}

const handleResetAll = () => {
  if (confirm('確定要重置所有自訂素材嗎？')) {
    forgeStore.resetAssets()
  }
}

const downloadScreenshot = () => {
  const stage = (window as any).Konva?.stages[0]
  if (!stage) {
    alert('無法存取畫布')
    return
  }

  const dataURL = stage.toDataURL({
    pixelRatio: 2,
    mimeType: 'image/jpeg',
    quality: 0.9,
  })

  const link = document.createElement('a')
  link.download = `slotforge_snapshot_${Date.now()}.jpg`
  link.href = dataURL
  link.click()
}

const getAssetStatus = (slotKey: string) => {
  const customAsset = forgeStore.getAsset(slotKey)
  return customAsset ? '自訂' : '系統預設'
}

const getSizeWarning = (slotKey: string, specWidth: number, specHeight: number) => {
  const customAsset = forgeStore.getAsset(slotKey)
  if (!customAsset) return null

  if (customAsset.width !== specWidth || customAsset.height !== specHeight) {
    return `⚠️ 原圖 ${customAsset.width}x${customAsset.height} (將自動縮放)`
  }

  return null
}

const updateSize = (slotKey: string, type: 'w' | 'h', value: string) => {
  const numVal = parseInt(value)
  if (isNaN(numVal)) return

  const customAsset = forgeStore.getAsset(slotKey)
  if (!customAsset) return

  const currentW = customAsset.displayW ?? assetBOM.value.find((a) => a.slotKey === slotKey)?.specWidth ?? 0
  const currentH = customAsset.displayH ?? assetBOM.value.find((a) => a.slotKey === slotKey)?.specHeight ?? 0

  if (type === 'w') {
    forgeStore.updateAssetSize(slotKey, numVal, currentH)
  } else {
    forgeStore.updateAssetSize(slotKey, currentW, numVal)
  }
}

const updateOffset = (slotKey: string, type: 'x' | 'y', value: string) => {
  const numVal = parseInt(value)
  if (isNaN(numVal)) return

  const customAsset = forgeStore.getAsset(slotKey)
  if (!customAsset) return

  const currentX = customAsset.offsetX ?? 0
  const currentY = customAsset.offsetY ?? 0

  if (type === 'x') {
    forgeStore.updateAssetOffset(slotKey, numVal, currentY)
  } else {
    forgeStore.updateAssetOffset(slotKey, currentX, numVal)
  }
}

const getDisplaySize = (slotKey: string) => {
  const customAsset = forgeStore.getAsset(slotKey)
  const spec = assetBOM.value.find((a) => a.slotKey === slotKey)

  return {
    w: customAsset?.displayW ?? spec?.specWidth ?? 0,
    h: customAsset?.displayH ?? spec?.specHeight ?? 0,
  }
}

const getDisplayOffset = (slotKey: string) => {
  const customAsset = forgeStore.getAsset(slotKey)
  return {
    x: customAsset?.offsetX ?? 0,
    y: customAsset?.offsetY ?? 0,
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <h2 class="font-bold text-gray-700">素材管理器</h2>
      <p class="text-xs text-gray-500 mt-1">管理當前模版素材 (共 {{ assetBOM.length }} 項)</p>
      <p class="text-[11px] text-gray-400 mt-1">單張上傳不需檔名相同，系統會直接綁定到你操作的標準資源槽位。</p>
    </div>

    <div class="p-3 border-b border-gray-100 bg-gray-50 flex gap-2">
      <label class="flex-1 cursor-pointer">
        <input type="file" multiple accept="image/*" @change="handleBatchUpload" class="hidden" />
        <div class="px-3 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-semibold rounded hover:bg-gray-50 transition-colors text-center shadow-sm">
          批次上傳（可自動對應）
        </div>
      </label>
      <button
        @click="handleResetAll"
        class="px-3 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-semibold rounded hover:bg-gray-50 transition-colors shadow-sm"
      >
        全部重置
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <div
        v-for="asset in assetBOM"
        :key="asset.id"
        class="border border-gray-200 rounded-lg p-3 hover:border-gray-400 transition-colors"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="font-mono text-sm font-semibold text-gray-900">{{ asset.id }}</span>
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded font-semibold border',
              getAssetStatus(asset.slotKey) === '自訂'
                ? 'bg-gray-100 text-gray-900 border-gray-300'
                : 'bg-gray-50 text-gray-400 border-gray-200',
            ]"
          >
            {{ getAssetStatus(asset.slotKey) }}
          </span>
        </div>

        <div class="text-xs text-gray-500 mb-2">
          <div><span class="font-semibold">標準槽位:</span> <span class="font-mono">{{ asset.slotKey }}</span></div>
          <div><span class="font-semibold">舊命名參考:</span> <span class="font-mono">{{ asset.legacyId }}</span></div>
          <span class="font-semibold">建議尺寸:</span> {{ asset.specWidth }}×{{ asset.specHeight }}
          <div v-if="getSizeWarning(asset.slotKey, asset.specWidth, asset.specHeight)" class="text-yellow-600 font-semibold mt-1">
            {{ getSizeWarning(asset.slotKey, asset.specWidth, asset.specHeight) }}
          </div>
        </div>

        <div v-if="getAssetStatus(asset.slotKey) === '自訂'" class="mb-3 p-2 bg-gray-50 rounded border border-gray-100">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-bold text-gray-500">尺寸調整:</span>
            <button
              @click="forgeStore.resetAssetSize(asset.slotKey)"
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
                :value="getDisplaySize(asset.slotKey).w"
                @input="(e) => updateSize(asset.slotKey, 'w', (e.target as HTMLInputElement).value)"
                class="w-full px-1 py-1 text-xs border border-gray-200 rounded text-center font-mono focus:border-cyan-500 outline-none"
              />
            </div>
            <div class="flex-1 flex items-center gap-1">
              <label class="text-xs text-gray-400 font-mono">高</label>
              <input
                type="number"
                :value="getDisplaySize(asset.slotKey).h"
                @input="(e) => updateSize(asset.slotKey, 'h', (e.target as HTMLInputElement).value)"
                class="w-full px-1 py-1 text-xs border border-gray-200 rounded text-center font-mono focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 mb-2 mt-2 pt-2 border-t border-gray-100">
            <span class="text-xs font-bold text-gray-500">偏移調整:</span>
            <button
              @click="forgeStore.resetAssetOffset(asset.slotKey)"
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
                :value="getDisplayOffset(asset.slotKey).x"
                @input="(e) => updateOffset(asset.slotKey, 'x', (e.target as HTMLInputElement).value)"
                class="w-full px-1 py-1 text-xs border border-gray-200 rounded text-center font-mono focus:border-cyan-500 outline-none"
              />
            </div>
            <div class="flex-1 flex items-center gap-1">
              <label class="text-xs text-gray-400 font-mono">Y</label>
              <input
                type="number"
                :value="getDisplayOffset(asset.slotKey).y"
                @input="(e) => updateOffset(asset.slotKey, 'y', (e.target as HTMLInputElement).value)"
                class="w-full px-1 py-1 text-xs border border-gray-200 rounded text-center font-mono focus:border-cyan-500 outline-none"
              />
            </div>
          </div>
        </div>

        <label class="block cursor-pointer">
          <input type="file" accept="image/*" @change="(e) => handleSingleUpload(asset.slotKey, e)" class="hidden" />
          <div class="px-3 py-1.5 bg-white text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 transition-colors text-center border border-gray-300">
            上傳到槽位
          </div>
        </label>
      </div>

      <div v-if="assetBOM.length === 0" class="text-center text-gray-400 py-8">
        當前模版中未找到素材
      </div>
    </div>

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
