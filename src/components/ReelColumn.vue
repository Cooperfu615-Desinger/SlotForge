<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useReelStrip } from '../composables/useReelStrip'
import { useReelController } from '../composables/useReelController'
import { useGameStore } from '../stores/gameStore'
import { useForgeStore } from '../stores/forgeStore'

import { useManifestStore } from '../stores/manifest'

const props = defineProps<{
  reelId: number
  baseX: number
  baseY: number
  symbolWidth: number
  symbolHeight: number
  assetHeight?: number // New: Actual image height (excluding gap)
  visibleRows?: number // New: Number of visible rows (default 3)
}>()

const gameStore = useGameStore()
const manifestStore = useManifestStore()
const forgeStore = useForgeStore()


const handleSymbolClick = (index: number) => {
  // Only allow selection in Inspector Mode
  if (gameStore.isSequencerEnabled) return

  // Calculate logical row index (visibleSymbols has 2 buffer rows on top)
  // Index 2 -> Row 0, Index 3 -> Row 1, etc.
  const rowIndex = index - 2
  const visibleRowCount = props.visibleRows ?? 3

  // Only allow valid grid positions
  if (rowIndex >= 0 && rowIndex < visibleRowCount) {
    const symbolId = `sym_c${props.reelId + 1}_r${rowIndex + 1}`
    manifestStore.setSelected(symbolId)
    console.log(`[ReelColumn] Selected Symbol: ${symbolId}`)
  }
}

// Display Height & Gap Offset (Center the symbol in the slot)
const displayHeight = computed(() => props.assetHeight ?? props.symbolHeight)
const gapOffset = computed(() => (props.symbolHeight - displayHeight.value) / 2)

// 建立輪帶資料
const { generateStrip, getSymbolAt, getSymbolAsset } = useReelStrip({
  reelId: props.reelId,
  stripLength: 30
})

// 初始化輪帶
onMounted(() => {
  generateStrip()
})

// 動畫控制器 (簡化配置，SpeedPreset 由 spin() 傳入)
const reelController = useReelController(
  {
    reelId: props.reelId,
    symbolHeight: props.symbolHeight // Controller needs Pitch
  },
  () => {
    // Check if this is the last reel in the current setup
    // 3x3 = 3 reels (indices 0,1,2), last is 2
    // 3x5 = 5 reels (indices 0,1,2,3,4), last is 4
    if (props.reelId === manifestStore.reelCount - 1) {
      gameStore.stopSpin()
    }
  }
)

// 監聽遊戲狀態
watch(() => gameStore.gameState, (newState) => {
  if (newState === 'SPINNING') {
    console.log(`[ReelColumn ${props.reelId}] Starting spin (${gameStore.currentSpeedMode})`)
    reelController.spin(gameStore.currentPreset)
  }
})

// 計算可見符號（動態：visibleRows + 上下各 2 緩衝）
const visibleSymbols = computed(() => {
  const offset = reelController.offsetY.value
  const currentIndex = Math.floor(offset / props.symbolHeight)
  const bufferRows = 2
  const totalSymbols = (props.visibleRows ?? 3) + (bufferRows * 2)
  
  return Array.from({ length: totalSymbols }, (_, i) => {
    const stripIndex = currentIndex + i - 2  // 從上方 2 個開始
    const symbolId = getSymbolAt(stripIndex)
    let assetPath = getSymbolAsset(symbolId)
    
    // Check for custom asset from ForgeStore
    // Extract ID (filename without extension) from assetPath
    const match = assetPath.match(/\/([^\/]+)\.(png|jpg|jpeg|webp|svg)$/i)
    let displayW = props.symbolWidth
    let displayH = displayHeight.value
    let customOffsetX = 0
    let customOffsetY = 0

    if (match && match[1]) {
      const assetId = match[1]
      const customAsset = forgeStore.getAsset(assetId)
      if (customAsset) {
        assetPath = customAsset.url
        // Use custom display dimensions if available
        if (customAsset.displayW) displayW = customAsset.displayW
        if (customAsset.displayH) displayH = customAsset.displayH
        // Use custom offsets if available
        if (customAsset.offsetX) customOffsetX = customAsset.offsetX
        if (customAsset.offsetY) customOffsetY = customAsset.offsetY
      }
    }
    
    // 計算 Y 位置（相對於 Group）
    // 基準位置 + 索引偏移 - 動畫位移的餘數 + 垂直置中偏移
    const y = ((i - 2) * props.symbolHeight - (offset % props.symbolHeight)) + gapOffset.value
    
    // Center the image if dimensions are different from cell size
    // AND apply custom offsets
    const finalX = ((props.symbolWidth - displayW) / 2) + customOffsetX
    const finalY = ((displayHeight.value - displayH) / 2) + customOffsetY

    return {
      key: `${stripIndex}-${symbolId}`,
      symbolId,
      assetPath,
      y,
      displayW,
      displayH,
      offsetX: finalX,
      offsetY: finalY
    }
  })
})

// 圖片快取 (使用 reactive object 確保響應性)
const imageCache = ref<Record<string, HTMLImageElement>>({})
const imagesLoaded = ref(false)

// 預載入所有符號圖片
const preloadImages = () => {
  const symbolIds = ['H1', 'H2', 'H3', 'H4', 'A', 'K', 'Q', 'J']
  
  let loadedCount = 0
  symbolIds.forEach(id => {
    // 關鍵修正：直接使用 getSymbolAsset 確保 key 一致
    const src = getSymbolAsset(id)
    
    const img = new Image()
    img.src = src
    img.onload = () => {
      // 使用 Vue.set 的替代方式（Vue 3 直接賦值即可）
      imageCache.value[src] = img
      loadedCount++
      if (loadedCount === symbolIds.length) {
        imagesLoaded.value = true
        console.log(`[ReelColumn ${props.reelId}] All ${loadedCount} images preloaded`)
      }
    }
    img.onerror = (e) => {
      console.warn(`[ReelColumn ${props.reelId}] Failed to load: ${src}`, e)
      loadedCount++
    }
  })
}

// 初始化時預載入圖片
onMounted(() => {
  preloadImages()
})

const getImage = (src: string): HTMLImageElement | undefined => {
  // If src is a blob URL (custom asset), we might not have it in imageCache key
  // But since it's a blob, we can try to return an image element created on the fly or check cache
  // Simple strategy: If it starts with blob:, create/return a matching image element if not in cache?
  // Actually, v-image handles `image` object.
  // Let's rely on standard caching or just create a new Image if not found for caching simplicity?
  // BETTER: Just let existing logic flow. If it's a blob, the Preloader might not have caught it if it changed dynamicallly.
  
  if (src.startsWith('blob:')) {
    if (imageCache.value[src]) return imageCache.value[src]
    
    // Auto-load custom asset into cache if missing
    const img = new Image()
    img.src = src
    imageCache.value[src] = img
    return img
  }

  // console.log(`Get: ${src}, InCache: ${!!imageCache.value[src]}`)
  return imageCache.value[src]
}

/*
const debugInfo = computed(() => {
  const first = visibleSymbols.value[0]
  if (!first) return 'No sym'
  const key = first.assetPath
  const has = !!imageCache.value[key]
  const keys = Object.keys(imageCache.value)
  return `K:${key.slice(-15)}\nH:${has}\nN:${keys.length}\n1:${keys[0]?.slice(-15)}`
})
*/
</script>

<template>
  <!-- Clipping Group: 單一 Reel 的遮罩 -->
  <v-group :config="{
    x: baseX,
    y: baseY,
    clipFunc: (ctx: CanvasRenderingContext2D) => {
      ctx.rect(0, 0, symbolWidth, symbolHeight * (visibleRows ?? 3))
    }
  }">
    <!-- 渲染符號 -->
    <template v-for="(symbol, index) in visibleSymbols" :key="symbol.key">
      <!-- 圖片層 (總是存在，透過 visible 控制顯示) -->
      <v-image
      <v-image
        :config="{
          x: symbol.offsetX,
          y: symbol.y + symbol.offsetY,
          width: symbol.displayW,
          height: symbol.displayH,
          image: getImage(symbol.assetPath),
          visible: !!getImage(symbol.assetPath)
        }"
        @click="handleSymbolClick(index)"
        @tap="handleSymbolClick(index)"
      />
      
      <!-- Fallback 層 (圖片未載入時顯示) -->
      <v-group 
        :config="{ visible: !getImage(symbol.assetPath) }"
        @click="handleSymbolClick(index)"
        @tap="handleSymbolClick(index)"
      >
        <v-rect :config="{
          x: 0,
          y: symbol.y,
          width: symbolWidth,
          height: symbolHeight,
          fill: '#FFFFFF',
          stroke: '#CCCCCC',
          strokeWidth: 1
        }" />
        <v-text :config="{
          x: 0,
          y: symbol.y,
          width: symbolWidth,
          height: symbolHeight,
          text: symbol.symbolId,
          align: 'center',
          verticalAlign: 'middle',
          fontSize: 16,
          fill: '#333333'
        }" />
      </v-group>

      <!-- Selection Highlight (Cyan Border) -->
      <!-- Only show if this logical position matches the selected ID -->
      <v-rect 
        v-if="manifestStore.selectedElementId === `sym_c${reelId + 1}_r${index - 1}`" 
        :config="{
          x: 0,
          y: symbol.y,
          width: symbolWidth,
          height: symbolHeight,
          stroke: '#06b6d4',
          strokeWidth: 4,
          listening: false
        }"
      />
    </template>
  </v-group>
</template>

