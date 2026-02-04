<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useReelStrip } from '../composables/useReelStrip'
import { useReelController } from '../composables/useReelController'
import { useGameStore } from '../stores/gameStore'

const props = defineProps<{
  reelId: number
  baseX: number
  baseY: number
  symbolWidth: number
  symbolHeight: number
}>()

const gameStore = useGameStore()

// 建立輪帶資料
const { generateStrip, getSymbolAt, getSymbolAsset } = useReelStrip({
  reelId: props.reelId,
  stripLength: 30
})

// 初始化輪帶
onMounted(() => {
  generateStrip()
})

// 動畫控制器
const reelController = useReelController(
  {
    reelId: props.reelId,
    symbolHeight: props.symbolHeight,
    spinDuration: gameStore.rhythmSpec.spinDuration,
    stopDelay: props.reelId * gameStore.rhythmSpec.intervalBetweenReels
  },
  () => {
    if (props.reelId === 4) {
      gameStore.stopSpin()
    }
  }
)

// 監聽遊戲狀態
watch(() => gameStore.gameState, (newState) => {
  if (newState === 'SPINNING') {
    console.log(`[ReelColumn ${props.reelId}] Starting spin`)
    reelController.spin()
  }
})

// 計算可見符號（7 個：3 可見 + 上下各 2 緩衝）
const visibleSymbols = computed(() => {
  const offset = reelController.offsetY.value
  const currentIndex = Math.floor(offset / props.symbolHeight)
  
  return Array.from({ length: 7 }, (_, i) => {
    const stripIndex = currentIndex + i - 2  // 從上方 2 個開始
    const symbolId = getSymbolAt(stripIndex)
    const assetPath = getSymbolAsset(symbolId)
    
    // 計算 Y 位置（相對於 Group）
    // 基準位置 + 索引偏移 - 動畫位移的餘數
    const y = (i - 2) * props.symbolHeight - (offset % props.symbolHeight)
    
    return {
      key: `${stripIndex}-${symbolId}`,
      symbolId,
      assetPath,
      y
    }
  })
})

// 圖片快取
const imageCache = ref<Map<string, HTMLImageElement>>(new Map())

const loadImage = (src: string): HTMLImageElement | null => {
  if (imageCache.value.has(src)) {
    return imageCache.value.get(src)!
  }
  
  const img = new Image()
  img.src = src
  img.onload = () => {
    imageCache.value.set(src, img)
  }
  
  return null
}
</script>

<template>
  <!-- Clipping Group: 單一 Reel 的遮罩 -->
  <v-group :config="{
    x: baseX,
    y: baseY,
    clipFunc: (ctx) => {
      ctx.rect(0, 0, symbolWidth, symbolHeight * 3)
    }
  }">
    <!-- 渲染 7 個符號 -->
    <v-image
      v-for="symbol in visibleSymbols"
      :key="symbol.key"
      :config="{
        x: 0,
        y: symbol.y,
        width: symbolWidth,
        height: symbolHeight,
        image: loadImage(symbol.assetPath)
      }"
    />
    
    <!-- Fallback: 如果圖片未載入，顯示文字 -->
    <v-group v-for="symbol in visibleSymbols" :key="`text-${symbol.key}`">
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
  </v-group>
</template>
