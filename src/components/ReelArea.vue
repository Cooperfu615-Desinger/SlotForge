<script setup lang="ts">
import ReelColumn from './ReelColumn.vue'

// Reel 區域配置（從 manifest.ts 複製）
const REEL_AREA = { x: 330, y: 150, w: 620, h: 370 }
const SYMBOL_WIDTH = 120
const SYMBOL_HEIGHT = 125  // 120px + 5px gap
const GAP = 5

// 生成 5 個 Reel 的配置
const reels = Array.from({ length: 5 }, (_, i) => ({
  reelId: i,
  baseX: i * (SYMBOL_WIDTH + GAP),  // 相對於 Group 的 X
  baseY: 0  // 相對於 Group 的 Y
}))
</script>

<template>
  <!-- 整體遮罩容器：620x370 區域 -->
  <v-group :config="{
    x: REEL_AREA.x,
    y: REEL_AREA.y,
    clipFunc: (ctx: CanvasRenderingContext2D) => {
      ctx.rect(0, 0, REEL_AREA.w, REEL_AREA.h)
    }
  }">
    <!-- 5 個 ReelColumn -->
    <ReelColumn
      v-for="reel in reels"
      :key="reel.reelId"
      :reel-id="reel.reelId"
      :base-x="reel.baseX"
      :base-y="reel.baseY"
      :symbol-width="SYMBOL_WIDTH"
      :symbol-height="SYMBOL_HEIGHT"
    />
  </v-group>
  
  <!-- Spin Button (保留原有的按鈕) -->

</template>
