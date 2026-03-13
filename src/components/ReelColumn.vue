<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'
import { useManifestStore } from '../stores/manifest'
import { useReelEngine } from '../features/reels/composables/useReelEngine'

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
const reelEngine = useReelEngine({
  reelId: props.reelId,
  symbolWidth: props.symbolWidth,
  symbolHeight: props.symbolHeight,
  assetHeight: props.assetHeight,
  visibleRows: props.visibleRows,
})

const handleSymbolClick = (index: number) => {
  // Only allow selection in Inspector Mode
  if (gameStore.isSequencerEnabled) return

  const symbolId = reelEngine.getSelectedSymbolIdForIndex(index)
  if (symbolId) {
    manifestStore.setSelected(symbolId)
    console.log(`[ReelColumn] Selected Symbol: ${symbolId}`)
  }
}
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
    <template v-for="(symbol, index) in reelEngine.visibleSymbols" :key="symbol.key">
      <!-- 圖片層 (總是存在，透過 visible 控制顯示) -->
      <v-image
        :config="{
          x: symbol.offsetX,
          y: symbol.y + symbol.offsetY,
          width: symbol.displayW,
          height: symbol.displayH,
          image: reelEngine.getImage(symbol.assetPath),
          visible: !!reelEngine.getImage(symbol.assetPath)
        }"
        @click="handleSymbolClick(index)"
        @tap="handleSymbolClick(index)"
      />
      
      <!-- Fallback 層 (圖片未載入時顯示) -->
      <v-group 
        :config="{ visible: !reelEngine.getImage(symbol.assetPath) }"
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
        v-if="manifestStore.selectedElementId === reelEngine.getSelectedSymbolIdForIndex(index)" 
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
