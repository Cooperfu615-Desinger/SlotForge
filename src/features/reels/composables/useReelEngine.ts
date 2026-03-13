import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useReelStrip } from '../../../composables/useReelStrip'
import { useReelController } from '../../../composables/useReelController'
import { useForgeStore } from '../../../stores/forgeStore'
import { useGameStore } from '../../../stores/gameStore'
import { useManifestStore } from '../../../stores/manifest'

interface UseReelEngineOptions {
  reelId: number
  symbolWidth: number
  symbolHeight: number
  assetHeight?: number
  visibleRows?: number
}

interface VisibleSymbol {
  key: string
  symbolId: string
  assetPath: string
  y: number
  displayW: number
  displayH: number
  offsetX: number
  offsetY: number
}

const BUFFER_ROWS = 2
const MAX_SPEED = 2500
const ALIGN_SPEED = 200
const BOUNCE_DIST = 40

export const useReelEngine = (options: UseReelEngineOptions) => {
  const gameStore = useGameStore()
  const manifestStore = useManifestStore()
  const forgeStore = useForgeStore()

  const stopTimer = ref<number | null>(null)
  const imageCache = ref<Record<string, HTMLImageElement>>({})

  const displayHeight = computed(() => options.assetHeight ?? options.symbolHeight)
  const gapOffset = computed(() => (options.symbolHeight - displayHeight.value) / 2)
  const resolvedVisibleRows = computed(() => options.visibleRows ?? 3)

  const { generateStrip, getSymbolAt, getSymbolAsset } = useReelStrip({
    reelId: options.reelId,
    stripLength: 30,
  })

  const reelController = useReelController(
    {
      reelId: options.reelId,
      symbolHeight: options.symbolHeight,
    },
    () => {
      if (options.reelId === manifestStore.reelCount - 1) {
        gameStore.stopSpin()
      }
    }
  )

  const clearStopTimer = () => {
    if (stopTimer.value !== null) {
      window.clearTimeout(stopTimer.value)
      stopTimer.value = null
    }
  }

  const primeImage = (src: string) => {
    if (imageCache.value[src]) return imageCache.value[src]

    const img = new Image()
    img.src = src
    imageCache.value[src] = img
    return img
  }

  const preloadImages = () => {
    ;['H1', 'H2', 'H3', 'H4', 'A', 'K', 'Q', 'J'].forEach((symbolId) => {
      primeImage(getSymbolAsset(symbolId))
    })
  }

  const calculatePositionAtTime = (time: number) => {
    const preset = gameStore.currentPreset
    if (!preset) return 0

    const tSpin = preset.spinDuration
    const tDec = preset.decelerateDuration
    const tAlign = preset.alignDuration
    const tSettle = preset.settleDuration

    if (time <= tSpin) {
      return MAX_SPEED * (time / 1000)
    }

    if (time <= tSpin + tDec) {
      const p1Dist = MAX_SPEED * (tSpin / 1000)
      const timeInPhase = time - tSpin
      const durationInSec = tDec / 1000

      if (durationInSec <= 0) return p1Dist

      const accel = (ALIGN_SPEED - MAX_SPEED) / durationInSec
      const distInPhase =
        MAX_SPEED * (timeInPhase / 1000) + 0.5 * accel * Math.pow(timeInPhase / 1000, 2)

      return p1Dist + distInPhase
    }

    if (time <= tSpin + tDec + tAlign) {
      const p1Dist = MAX_SPEED * (tSpin / 1000)
      const durationP2 = tDec / 1000
      const accelP2 = (ALIGN_SPEED - MAX_SPEED) / (durationP2 || 1)
      const p2Dist = MAX_SPEED * durationP2 + 0.5 * accelP2 * Math.pow(durationP2, 2)
      const timeInPhase = time - (tSpin + tDec)
      return p1Dist + p2Dist + ALIGN_SPEED * (timeInPhase / 1000)
    }

    const p1Dist = MAX_SPEED * (tSpin / 1000)
    const durationP2 = tDec / 1000
    const accelP2 = (ALIGN_SPEED - MAX_SPEED) / (durationP2 || 1)
    const p2Dist = MAX_SPEED * durationP2 + 0.5 * accelP2 * Math.pow(durationP2, 2)
    const p3Dist = ALIGN_SPEED * (tAlign / 1000)
    const baseDist = p1Dist + p2Dist + p3Dist
    const timeInPhase = time - (tSpin + tDec + tAlign)
    const progress = Math.min(timeInPhase / tSettle, 1)

    return baseDist + BOUNCE_DIST * Math.sin(progress * Math.PI)
  }

  watch(
    () => gameStore.gameState,
    (newState) => {
      if (newState === 'SPINNING') {
        reelController.spin(gameStore.currentPreset)
        return
      }

      if (newState === 'STOPPING') {
        reelController.stop()
        return
      }

      if (newState === 'IDLE') {
        clearStopTimer()
        reelController.reset()
      }
    }
  )

  watch(
    () => reelController.status.value,
    (status) => {
      if (status !== 'SPINNING') return

      clearStopTimer()
      stopTimer.value = window.setTimeout(() => {
        reelController.stop()
      }, gameStore.currentPreset.spinDuration)
    }
  )

  watch(
    () => gameStore.seekTime,
    (time) => {
      if (!gameStore.isSeeking) return
      reelController.seekToPosition(calculatePositionAtTime(time))
    }
  )

  watch(
    () => gameStore.currentPreset,
    () => {
      if (gameStore.gameState !== 'IDLE' && !gameStore.isSeeking) return
      reelController.seekToPosition(calculatePositionAtTime(gameStore.seekTime))
    },
    { deep: true }
  )

  const visibleSymbols = computed<VisibleSymbol[]>(() => {
    const offset = reelController.position.value
    const scrollIndex = Math.floor(offset / options.symbolHeight)
    const totalSymbols = resolvedVisibleRows.value + BUFFER_ROWS * 2

    return Array.from({ length: totalSymbols }, (_, i) => {
      const stripIndex = -scrollIndex + i - BUFFER_ROWS
      const symbolId = getSymbolAt(stripIndex)
      let assetPath = getSymbolAsset(symbolId)
      let displayW = options.symbolWidth
      let displayH = displayHeight.value
      let customOffsetX = 0
      let customOffsetY = 0

      const match = assetPath.match(/\/([^\/]+)\.(png|jpg|jpeg|webp|svg)$/i)
      if (match?.[1]) {
        const customAsset = forgeStore.getAsset(match[1])
        if (customAsset) {
          assetPath = customAsset.url
          displayW = customAsset.displayW ?? displayW
          displayH = customAsset.displayH ?? displayH
          customOffsetX = customAsset.offsetX ?? 0
          customOffsetY = customAsset.offsetY ?? 0
        }
      }

      const y = (i - BUFFER_ROWS) * options.symbolHeight + (offset % options.symbolHeight) + gapOffset.value
      const finalX = (options.symbolWidth - displayW) / 2 + customOffsetX
      const finalY = (displayHeight.value - displayH) / 2 + customOffsetY

      return {
        key: `${stripIndex}-${symbolId}`,
        symbolId,
        assetPath,
        y,
        displayW,
        displayH,
        offsetX: finalX,
        offsetY: finalY,
      }
    })
  })

  const getImage = (src: string) => {
    if (src.startsWith('blob:')) {
      return primeImage(src)
    }

    return imageCache.value[src] ?? primeImage(src)
  }

  const getSelectedSymbolIdForIndex = (index: number) => {
    const rowIndex = index - BUFFER_ROWS
    if (rowIndex < 0 || rowIndex >= resolvedVisibleRows.value) return null
    return `sym_c${options.reelId + 1}_r${rowIndex + 1}`
  }

  onMounted(() => {
    generateStrip()
    preloadImages()
  })

  onUnmounted(() => {
    clearStopTimer()
  })

  return {
    visibleSymbols,
    getImage,
    getSelectedSymbolIdForIndex,
    resolvedVisibleRows,
  }
}
