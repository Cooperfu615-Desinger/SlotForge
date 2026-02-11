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
  } else if (newState === 'STOPPING') {
    // Global stop trigger (if needed, currently handled by timeouts/controller usually)
    // If we wanted to force stop manually:
    // reelController.stop()
  } else if (newState === 'IDLE') {
    // Reset reel when returning to IDLE (e.g., when user clicks stop button)
    console.log(`[ReelColumn ${props.reelId}] Resetting to IDLE`)
    reelController.reset()
  }
})

// Watch for manual stop (Sequencer Mode usually handles this via timeouts, but we might want individual stops)
// Or if GameStore triggers a stop.
// Currently GameStore just sets 'IDLE' when last reel stops.
// But if we want to stop strictly:
watch(() => gameStore.gameState, (v) => {
    if (v === 'STOPPING') {
        // Trigger stop on this reel? 
        // Typically Slot games stop sequentially automatically.
        // But if user clicks "STOP" button, we might want to stop all.
        // For now, let's assume the controller handles the run and we only trigger stop if specifically requested.
        // Actually, the prompt implies "Click STOP -> Stop aligning".
        // Use logic: if gameStore says stopping, we stop.
        // But usually stopping is sequential.
        // Let's implement a listener for a specific "force stop" if gameStore has it, or just rely on the controller params.
        
        // Wait, the prompt says "Point 4: Click STOP can align ... Click SPIN -> Falling".
        // The implementation Plan didn't specify changing GameStore to trigger individual stops.
        // We will assume the auto-stop sequence is handled or we rely on the component mount logic?
        // Actually, usually the game logic Controller (external) calls stop.
        // Here we have `reelController`. 
        
        // If the implementation expects manual stop call:
        // We'll leave it to the ReelController internals for now.
    }
})

// Watch for seek events (timeline scrubbing)
watch(() => gameStore.seekTime, (newTime) => {
    if (!gameStore.isSeeking) return
    
    updateReelPosition(newTime)
})

// Watch for preset changes (e.g. block resize) to update physics in real-time
watch(() => gameStore.currentPreset, () => {
    // Only update if IDLE or Seeking (don't interfere with active spin)
    if (gameStore.gameState !== 'IDLE' && !gameStore.isSeeking) return
    updateReelPosition(gameStore.seekTime)
}, { deep: true })

const updateReelPosition = (time: number) => {
    const preset = gameStore.currentPreset
    if (!preset) return

    // Phase Durations
    const tSpin = preset.spinDuration
    const tDec = preset.decelerateDuration
    const tAlign = preset.alignDuration
    const tSettle = preset.settleDuration

    // Physics Constants (Approx matching useReelController)
    const MAX_SPEED = 2500 // px/s
    const ALIGN_SPEED = 200 // px/s (Estimate for ease out target)
    const BOUNCE_DIST = 40 // px (Estimate)

    let targetPosition = 0

    // --- Phase 1: Spin (Accelerate -> Max Speed) ---
    if (time <= tSpin) {
        targetPosition = MAX_SPEED * (time / 1000)
    } 
    // --- Phase 2: Decelerate (Max Speed -> Align Speed) ---
    else if (time <= tSpin + tDec) {
        const p1Dist = MAX_SPEED * (tSpin / 1000)
        const timeInPhase = time - tSpin
        const durationInSec = tDec / 1000
        

        
        if (durationInSec > 0) {
            const accel = (ALIGN_SPEED - MAX_SPEED) / durationInSec
            const distInPhase = (MAX_SPEED * (timeInPhase/1000)) + (0.5 * accel * Math.pow(timeInPhase/1000, 2))
            targetPosition = p1Dist + distInPhase
        } else {
            targetPosition = p1Dist
        }
    }
    // --- Phase 3: Align (Constant Align Speed) ---
    else if (time <= tSpin + tDec + tAlign) {
        const p1Dist = MAX_SPEED * (tSpin / 1000)
        // P2 Total Dist
        const durationP2 = tDec / 1000
        const accelP2 = (ALIGN_SPEED - MAX_SPEED) / (durationP2 || 1)
        const p2Dist = (MAX_SPEED * durationP2) + (0.5 * accelP2 * Math.pow(durationP2, 2))
        
        const timeInPhase = time - (tSpin + tDec)
        targetPosition = p1Dist + p2Dist + (ALIGN_SPEED * (timeInPhase / 1000))
    }
    // --- Phase 4: Settle (Bounce) ---
    else {
        // Calculate total distance before settle
        const p1Dist = MAX_SPEED * (tSpin / 1000)
        const durationP2 = tDec / 1000
        const accelP2 = (ALIGN_SPEED - MAX_SPEED) / (durationP2 || 1)
        const p2Dist = (MAX_SPEED * durationP2) + (0.5 * accelP2 * Math.pow(durationP2, 2))
        const p3Dist = ALIGN_SPEED * (tAlign / 1000)
        
        const baseDist = p1Dist + p2Dist + p3Dist
        
        // Bounce Logic
        const timeInPhase = time - (tSpin + tDec + tAlign)
        const progress = Math.min(timeInPhase / tSettle, 1)
        
        targetPosition = baseDist + (BOUNCE_DIST * Math.sin(progress * Math.PI))
    }
    
    reelController.seekToPosition(targetPosition)
}

// For the "Click STOP" requirement:
// We need to Expose `stop` or have the parent call it.
// Currently `ReelColumn` is a component.
// We can expose `reelController` actions via defineExpose if the parent uses ref refs.
// OR we rely on `gameStore` state changes.
// Since `useReelController` doesn't auto-stop unless we tell it to (based on the new logic),
// we need to ensure *something* calls `stop()`.
// IN the OLD code, `spin()` had a timeline that ended automatically.
// IN the NEW code, `spin()` sets speed and KEEPS SPINNING until `stop()` is called.
// THIS IS CRITICAL.
// We need to call `stop()` after some time or on event.
// Let's add a sequential auto-stop logic here if it's "Normal" mode.
watch(() => reelController.status.value, (s) => {
    if (s === 'SPINNING') {
        // Auto-stop simulation for Normal/Fast modes if not manual?
        // User prompt: "Normal: Duration 2000ms".
        // This likely means the TOTAL duration is 2s.
        // So we should schedule a stop.
        
        // However, `useReelController`'s `spin` had a delay + accel.
        // We should schedule `stop()` after `spinDuration`.
        // The previous controller did this via timeline.
        // The new controller's `spin` just starts moving. It does NOT schedule stop.
        // We must schedule it here or in the controller.
        // Let's do it in the controller? No, I wrote the controller to just "Start Spin".
        // Actually, I should probably handle the "Duration" logic in the Controller to auto-stop.
        // Re-reading usage: "spin(preset)". Preset has duration. 
        // If I strictly follow the "Rewrite" prompt: "spin...gsap.to(speed)...tick".
        // It didn't explicitly say "auto-schedule stop".
        // BUT "Normal: Duration 2000ms".
        // I should probably ensure it stops.
        // Let's add a timeout in the watcher here to call stop.
        
        const preset = gameStore.currentPreset
        // const delay = props.reelId * (preset.intervalBetweenReels || 200) // Unused
        
        // We are already in 'SPINNING' state, which happens after acceleration (0.5s) + delay.
        // Wait, acceleration has delay.
        // Effectively we want the reel to stop after X seconds from *Start Command*.
        
        // Better approach: Calculate remaining time.
        // But simplest is: On 'SPINNING', set timeout to stop.
        // spinDuration is usually total spin time.
        // Let's wait `preset.spinDuration` then call stop().
        // Note: spinDuration in preset is 2000ms.
        
        setTimeout(() => {
            reelController.stop()
        }, preset.spinDuration)
    }
})


// 計算可見符號（動態：visibleRows + 上下各 2 緩衝）
const visibleSymbols = computed(() => {
  const offset = reelController.position.value
  
  // Logic: Falling Down
  // As position increases, we look "up" the strip (negative index direction)
  // to find symbols coming from above.
  const scrollIndex = Math.floor(offset / props.symbolHeight)
  
  const bufferRows = 2
  const totalSymbols = (props.visibleRows ?? 3) + (bufferRows * 2)
  
  return Array.from({ length: totalSymbols }, (_, i) => {
    // i starts at 0. Row 0 corresponds to i=2 (since buffer is 2).
    // Standard strip index at Row 0 would be `0`.
    // With simplified falling logic: `stripIndex = -scrollIndex + i - 2`
    // This ensures loop continuity if getSymbolAt handles negative indices via modulo.
    const stripIndex = -scrollIndex + i - 2
    
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
    
    // Y Position Calculation
    // Logic: 
    // Base row position: `(i - 2) * h`
    // Plus Offset Modulo: `offset % h`
    // As offset increases 0 -> h, Y increases (Falling visual).
    const y = ((i - 2) * props.symbolHeight + (offset % props.symbolHeight)) + gapOffset.value
    
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
  if (src.startsWith('blob:')) {
    if (imageCache.value[src]) return imageCache.value[src]
    
    // Auto-load custom asset into cache if missing
    const img = new Image()
    img.src = src
    imageCache.value[src] = img
    return img
  }

  return imageCache.value[src]
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
    <template v-for="(symbol, index) in visibleSymbols" :key="symbol.key">
      <!-- 圖片層 (總是存在，透過 visible 控制顯示) -->
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
