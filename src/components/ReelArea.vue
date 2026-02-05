<script setup lang="ts">
import { computed } from 'vue'
import { useManifestStore } from '../stores/manifest'
import ReelColumn from './ReelColumn.vue'

const store = useManifestStore()

// Reactive Configuration from Store
const reelAreaRect = computed(() => store.reelAreaRect)  // Symbol positions
const clippingRect = computed(() => store.clippingRect)  // Visual clipping mask
const gridConfig = computed(() => store.gridConfig)

// Generate Reel Column Configurations
const reels = computed(() => {
  const { cols, cell_w, gap, gap_x } = gridConfig.value
  const gapX = gap_x ?? gap ?? 0
  return Array.from({ length: cols }, (_, i) => ({
    reelId: i,
    baseX: i * (cell_w + gapX),  // Relative to Group X
    baseY: 0
  }))
})

// Passed to children
const symbolWidth = computed(() => gridConfig.value.cell_w)
const assetHeight = computed(() => gridConfig.value.cell_h) // Raw image height
const symbolHeight = computed(() => { // Pitch (Row Height)
    const { cell_h, gap, gap_y } = gridConfig.value
    const gapY = gap_y ?? gap ?? 0
    return cell_h + gapY
}) 

// Calculate clipping offset relative to reel area
const clipX = computed(() => clippingRect.value.x - reelAreaRect.value.x)
const clipY = computed(() => clippingRect.value.y - reelAreaRect.value.y)
</script>

<template>
  <!-- Main Mask Container -->
  <v-group :config="{
    x: reelAreaRect.x,
    y: reelAreaRect.y,
    clipFunc: (ctx: CanvasRenderingContext2D) => {
      ctx.rect(clipX, clipY, clippingRect.w, clippingRect.h)
    }
  }">
    <!-- Reel Columns -->
    <ReelColumn
      v-for="reel in reels"
      :key="`${reel.reelId}_${symbolWidth}`"
      :reel-id="reel.reelId"
      :base-x="reel.baseX"
      :base-y="reel.baseY"
      :symbol-width="symbolWidth"
      :symbol-height="symbolHeight"
      :asset-height="assetHeight"
      :visible-rows="gridConfig.rows"
    />
  </v-group>
</template>
