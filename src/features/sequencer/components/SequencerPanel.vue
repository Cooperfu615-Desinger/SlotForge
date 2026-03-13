<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import gsap from 'gsap'
import { useGameStore, type SpeedMode } from '../../../stores/gameStore'
import { useManifestStore } from '../../../stores/manifest'
import { useTimelineStore } from '../../../stores/timelineStore'
import { generateSpecMarkdown, generateCocosJSON } from '../../../utils/exporter'
import TimelineView from './TimelineView.vue'

const gameStore = useGameStore()
const manifestStore = useManifestStore()
const timelineStore = useTimelineStore()

const setSpeed = (mode: SpeedMode) => {
  if (gameStore.isSpinning && gameStore.currentSpeedMode === mode) {
    gameStore.stopSpin()
    console.log(`Trigger: Stop Spin (via ${mode} toggle)`)
    return
  }

  gameStore.setSpeed(mode)
  timelineStore.generateFromPreset(mode)
  console.log(`Trigger: Set Speed ${mode}`)
  gameStore.startSpin()
}

const triggerWin = (amount: number) => {
  gameStore.triggerWin(amount)
}

const triggerLineFX = () => {
  const { rows, cols } = manifestStore.gridConfig
  const indices: number[] = []

  for (let c = 0; c < cols; c++) {
    const r = c % rows
    indices.push(c * rows + r)
  }

  gameStore.triggerWinEffect('LINE', indices)
}

const triggerWayFX = () => {
  const { rows, cols } = manifestStore.gridConfig
  const indices: number[] = []

  for (let c = 0; c < Math.min(cols, 2); c++) {
    for (let r = 0; r < rows; r++) {
      indices.push(c * rows + r)
    }
  }

  gameStore.triggerWinEffect('WAY', indices)
}

const updateWinDuration = (event: Event) => {
  const value = parseFloat((event.target as HTMLInputElement).value)
  if (!isNaN(value)) {
    gameStore.winDuration = value * 1000
  }
}

const exportMarkdown = () => {
  generateSpecMarkdown(
    {
      speedMode: gameStore.currentSpeedMode,
      preset: gameStore.currentPreset,
      winDuration: gameStore.winDuration,
      currentLines: gameStore.currentLines,
    },
    {
      blocks: timelineStore.blocks,
      totalDuration: timelineStore.totalDuration,
    }
  )
}

const exportCocosJSON = () => {
  generateCocosJSON(
    {
      speedMode: gameStore.currentSpeedMode,
      preset: gameStore.currentPreset,
      winDuration: gameStore.winDuration,
      currentLines: gameStore.currentLines,
    },
    {
      blocks: timelineStore.blocks,
      totalDuration: timelineStore.totalDuration,
    }
  )
}

let startTime = 0

const tick = () => {
  if (!gameStore.isSpinning || gameStore.isSeeking) return

  const now = performance.now()
  const elapsed = now - startTime
  timelineStore.setTime(elapsed)
}

watch(
  () => gameStore.gameState,
  (newState) => {
    if (newState === 'SPINNING') {
      startTime = performance.now()
      gsap.ticker.add(tick)
    } else {
      gsap.ticker.remove(tick)
    }
  }
)

onMounted(() => {
  timelineStore.generateFromPreset(gameStore.currentSpeedMode)
})

onUnmounted(() => {
  gsap.ticker.remove(tick)
})

defineProps<{
  embedded?: boolean
}>()
</script>

<template>
  <div class="sequencer-content h-full flex flex-col bg-white">
    <div class="toolbar flex-shrink-0">
      <div class="tool-group">
        <div class="group-label">CONTROL</div>
        <div class="btn-row">
          <div class="segmented-control">
            <button class="btn" :class="{ active: gameStore.currentSpeedMode === 'normal' }" @click="setSpeed('normal')">1x</button>
            <button class="btn" :class="{ active: gameStore.currentSpeedMode === 'fast' }" @click="setSpeed('fast')">2x</button>
            <button class="btn" :class="{ active: gameStore.currentSpeedMode === 'instant' }" @click="setSpeed('instant')">3x</button>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="tool-group">
        <div class="group-label">WIN DEMO</div>
        <div class="btn-row">
          <button class="btn" @click="triggerWin(150)">Small</button>
          <button class="btn" @click="triggerWin(5000)">Big</button>
          <button class="btn" @click="triggerWin(20000)">Mega</button>
          <button class="btn" @click="triggerWin(50000)">Super</button>
          <button class="btn" @click="triggerWin(100000)">Epic</button>

          <div class="h-4 w-px bg-gray-300 mx-1"></div>

          <div class="flex items-center gap-1">
            <span class="text-[10px] text-gray-400 font-bold">DUR:</span>
            <input
              type="number"
              step="0.1"
              :value="gameStore.winDuration / 1000"
              @input="updateWinDuration"
              class="w-12 h-6 text-xs text-center border border-gray-200 rounded focus:border-blue-400 outline-none"
            />
            <span class="text-[10px] text-gray-400">s</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="tool-group">
        <div class="group-label">FX TEST</div>
        <div class="btn-row">
          <button class="btn" @click="triggerLineFX">Line</button>
          <button class="btn" @click="triggerWayFX">Way</button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="tool-group">
        <div class="group-label">EXPORT</div>
        <div class="btn-row">
          <button class="btn" @click="exportMarkdown" title="匯出 Markdown 規格書 (企劃)">📄 匯出 MD</button>
          <button class="btn btn-cocos" @click="exportCocosJSON" title="匯出 Cocos Creator JSON (工程)">⚙️ 匯出 JSON</button>
        </div>
      </div>

      <div style="flex: 1;"></div>

      <div class="tool-group">
        <div class="group-label">ZOOM</div>
        <div class="btn-row">
          <input type="range" min="0.5" max="2.0" step="0.1" v-model.number="timelineStore.zoomLevel" class="zoom-slider" />
          <span class="zoom-value">{{ timelineStore.zoomLevel.toFixed(1) }}x</span>
        </div>
      </div>
    </div>

    <div class="timeline-container flex-1 min-h-0 relative flex">
      <div class="timeline-main flex-1">
        <TimelineView />
      </div>

      <div class="physics-info-panel">
        <div class="panel-header">Physics Duration</div>
        <div class="duration-list">
          <div class="duration-item">
            <span class="duration-label">Spin:</span>
            <span class="duration-value">{{ gameStore.currentPreset?.spinDuration || 0 }}ms</span>
          </div>
          <div class="duration-item">
            <span class="duration-label">Decelerate:</span>
            <span class="duration-value">{{ gameStore.currentPreset?.decelerateDuration || 0 }}ms</span>
          </div>
          <div class="duration-item">
            <span class="duration-label">Align:</span>
            <span class="duration-value">{{ gameStore.currentPreset?.alignDuration || 0 }}ms</span>
          </div>
          <div class="duration-item">
            <span class="duration-label">Settle:</span>
            <span class="duration-value">{{ gameStore.currentPreset?.settleDuration || 0 }}ms</span>
          </div>
          <div class="duration-item">
            <span class="duration-label">Interval:</span>
            <span class="duration-value">{{ gameStore.currentPreset?.intervalBetweenReels || 0 }}ms</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 20px;
  white-space: nowrap;
  overflow-x: auto;
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-label {
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.divider {
  width: 1px;
  height: 32px;
  background-color: #e5e7eb;
}

.btn {
  height: 28px;
  padding: 0 12px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn:hover {
  background-color: #e5e7eb;
  border-color: #d1d5db;
}

.btn:active {
  transform: translateY(1px);
}

.btn.active {
  background-color: #4b5563;
  color: #ffffff;
  border-color: #374151;
}

.btn.btn-cocos {
  background-color: #14532d;
  color: #86efac;
  border-color: #166534;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  letter-spacing: 0.2px;
}

.btn.btn-cocos:hover {
  background-color: #166534;
  border-color: #15803d;
  color: #bbf7d0;
}

.segmented-control {
  display: flex;
  gap: 2px;
  background-color: #f3f4f6;
  padding: 2px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.segmented-control .btn {
  background-color: transparent;
  border: none;
  border-radius: 4px;
  height: 24px;
  padding: 0 10px;
}

.segmented-control .btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.segmented-control .btn.active {
  background-color: #ffffff;
  color: #111827;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.timeline-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  background-color: #f9fafb;
}

.timeline-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.physics-info-panel {
  width: 200px;
  background-color: #ffffff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.panel-header {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.duration-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.duration-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background-color: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.duration-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.duration-value {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
}
</style>
