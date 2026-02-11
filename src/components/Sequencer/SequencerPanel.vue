<script setup lang="ts">
import { useGameStore, type SpeedMode } from '../../stores/gameStore'
import { useManifestStore } from '../../stores/manifest'

const gameStore = useGameStore()
const manifestStore = useManifestStore()

// --- Actions (Mock & Real) ---

const setSpeed = (mode: SpeedMode) => {
  gameStore.setSpeed(mode)
  console.log(`Trigger: Set Speed ${mode}`)
}

const handleMainButton = () => {
  if (gameStore.isSpinning) {
    gameStore.stopSpin()
  } else {
    gameStore.startSpin()
  }
}

const triggerWin = (amount: number) => {
  gameStore.triggerWin(amount)
}

const triggerLineFX = () => {
    // Determine indices based on grid size (3x3 vs 5x3)
    // Default to diagonal down
    const { rows, cols } = manifestStore.gridConfig
    const indices: number[] = []
    
    // Create a V-shape or Diagonal
    for (let c = 0; c < cols; c++) {
        // Diagonal: Row = c % rows
        // Index = col * rows + row
        const r = c % rows
        indices.push(c * rows + r)
    }
    
    gameStore.triggerWinEffect('LINE', indices)
}

const triggerWayFX = () => {
     // X Shape or first column
     const { rows, cols } = manifestStore.gridConfig
     // Highlight first 2 columns fully
     const indices: number[] = []
     for (let c = 0; c < Math.min(cols, 2); c++) {
         for (let r = 0; r < rows; r++) {
             indices.push(c * rows + r)
         }
     }
     gameStore.triggerWinEffect('WAY', indices)
}

// Duration Binding
const updateWinDuration = (e: Event) => {
  const val = parseFloat((e.target as HTMLInputElement).value)
  if (!isNaN(val)) {
    gameStore.winDuration = val * 1000 // Convert to ms
  }
}

// --- Timeline Data ---
const tracks = ['Global', 'Reel 1', 'Reel 2', 'Reel 3', 'Reel 4', 'Reel 5', 'Audio/FX']

defineProps<{
    embedded?: boolean
}>()

</script>

<template>
  <div class="sequencer-content h-full flex flex-col bg-white">
        
    <!-- TOOLBAR -->
    <div class="toolbar flex-shrink-0">
        <!-- Group A: Control -->
        <div class="tool-group">
            <div class="group-label">CONTROL</div>
            <div class="btn-row">
                <div class="segmented-control">
                    <button class="btn" :class="{ active: gameStore.currentSpeedMode === 'normal' }" @click="setSpeed('normal')">1x</button>
                    <button class="btn" :class="{ active: gameStore.currentSpeedMode === 'fast' }" @click="setSpeed('fast')">2x</button>
                    <button class="btn" :class="{ active: gameStore.currentSpeedMode === 'instant' }" @click="setSpeed('instant')">3x</button>
                </div>
                <button class="btn action-btn text-bold" :class="{ active: gameStore.isSpinning }" @click="handleMainButton">
                    {{ gameStore.isSpinning ? 'STOP' : 'SPIN' }}
                </button>
            </div>
        </div>

        <div class="divider"></div>

        <!-- Group B: Win Demo -->
        <div class="tool-group">
            <div class="group-label">WIN DEMO</div>
            <div class="btn-row">
                <button class="btn" @click="triggerWin(150)">Small</button>
                <button class="btn" @click="triggerWin(5000)">Big</button>
                <button class="btn" @click="triggerWin(20000)">Mega</button>
                <button class="btn" @click="triggerWin(50000)">Super</button>
                <button class="btn" @click="triggerWin(100000)">Epic</button>
                
                <!-- Spacer/Divider -->
                <div class="h-4 w-px bg-gray-300 mx-1"></div>

                <!-- Duration Setting (Inline) -->
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

        <!-- Group C: FX Test -->
        <div class="tool-group">
            <div class="group-label">FX TEST</div>
            <div class="btn-row">
                <button class="btn" @click="triggerLineFX">Line</button>
                <button class="btn" @click="triggerWayFX">Way</button>
            </div>
        </div>
    </div>

    <!-- TIMELINE -->
    <div class="timeline-container flex-1 min-h-0">
        <div class="track-headers">
            <div class="header-item placeholder"></div>
            <div v-for="track in tracks" :key="track" class="header-item">{{ track }}</div>
        </div>
        <div class="track-lanes">
            <div class="ruler">
                <span v-for="i in 20" :key="i" class="tick" :style="{ left: (i * 50) + 'px' }">{{ (i * 0.5).toFixed(1) }}s</span>
                <div class="playhead"></div>
            </div>
            <div v-for="track in tracks" :key="'lane-'+track" class="lane"></div>
        </div>
    </div>

  </div>
</template>

<style scoped>
/* --- TOOLBAR --- */
.toolbar {
    height: 60px;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 20px;
    white-space: nowrap;
    overflow-x: auto; /* Handle smaller screens gracefully */
}

.tool-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.group-label {
    font-size: 10px;
    font-weight: 700;
    color: #9ca3af; /* gray-400 */
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

/* --- BUTTONS (Gray/White Theme) --- */
.btn {
    height: 28px;
    padding: 0 12px;
    background-color: #f3f4f6; /* gray-100 */
    border: 1px solid #e5e7eb; /* gray-200 */
    color: #374151; /* gray-700 */
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}

.btn:hover {
    background-color: #e5e7eb; /* gray-200 */
    border-color: #d1d5db;
}

.btn:active {
    transform: translateY(1px);
}

.btn.active {
    background-color: #4b5563; /* gray-600 */
    color: #ffffff;
    border-color: #374151;
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
    background-color: rgba(0,0,0,0.05);
}

.segmented-control .btn.active {
    background-color: #ffffff;
    color: #111827;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.text-bold {
    font-weight: 600;
}

/* --- TIMELINE --- */
.timeline-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    background-color: #f9fafb; /* gray-50 */
}

.track-headers {
    width: 120px;
    border-right: 1px solid #e5e7eb;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
}

.header-item {
    height: 24px;
    display: flex;
    align-items: center;
    padding-left: 12px;
    font-size: 11px;
    color: #6b7280; /* gray-500 */
    border-bottom: 1px solid #f3f4f6;
}

.header-item.placeholder {
    height: 20px;
    border-bottom: 1px solid #e5e7eb;
    background-color: #f9fafb;
}

.track-lanes {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: auto;
}

.ruler {
    height: 20px;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    position: relative;
    min-width: 1000px;
}

.tick {
    position: absolute;
    top: 4px;
    font-size: 9px;
    color: #9ca3af;
    border-left: 1px solid #d1d5db;
    padding-left: 2px;
    height: 100%;
}

.playhead {
    position: absolute;
    left: 0;
    top: 0;
    height: 1000px;
    width: 1px;
    background-color: #ef4444; /* red-500 */
    z-index: 10;
}

.playhead::before {
    content: '▼';
    color: #ef4444;
    font-size: 8px;
    position: absolute;
    top: -6px;
    left: -3px;
}

.lane {
    height: 24px;
    border-bottom: 1px solid #e5e7eb;
    min-width: 1000px;
    background-image: linear-gradient(90deg, #f3f4f6 1px, transparent 1px);
    background-size: 50px 100%;
}
</style>
