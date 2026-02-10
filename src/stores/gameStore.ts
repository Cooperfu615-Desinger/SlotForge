import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type GameState = 'IDLE' | 'SPINNING' | 'STOPPING' | 'STOPPED'
export type SpeedMode = 'fast' | 'normal' | 'slow' | 'instant'

export interface SpeedPreset {
    name: SpeedMode
    // Phase Durations (ms)
    spinDuration: number        // Phase 1: 高速滾動
    decelerateDuration: number  // Phase 2: 減速
    alignDuration: number       // Phase 3: 對齊
    settleDuration: number      // Phase 4: 微彈
    // Sequential Stop Timing
    intervalBetweenReels: number
    // Physics
    spinSymbolCount: number     // Phase 1 滾動符號數
    decelerateSymbolCount: number // Phase 2 減速符號數
    overshootSymbols: number    // Phase 3 過衝符號數 (0 = 無)
    bounceStrength: number      // Phase 4 回彈力道 (0 = 無)
}

// 三種速度預設
export const SPEED_PRESETS: Record<SpeedMode, SpeedPreset> = {
    instant: {
        name: 'instant',
        spinDuration: 500,
        decelerateDuration: 0,
        alignDuration: 0,
        settleDuration: 0,
        intervalBetweenReels: 50,
        spinSymbolCount: 0,
        decelerateSymbolCount: 0,
        overshootSymbols: 0,
        bounceStrength: 0.6
    },
    fast: {
        name: 'fast',
        spinDuration: 1000,
        decelerateDuration: 500,
        alignDuration: 200,
        settleDuration: 100,
        intervalBetweenReels: 100,
        spinSymbolCount: 30,
        decelerateSymbolCount: 8,
        overshootSymbols: 0,
        bounceStrength: 0.6
    },
    normal: {
        name: 'normal',
        spinDuration: 2000,
        decelerateDuration: 1000,
        alignDuration: 300,
        settleDuration: 200,
        intervalBetweenReels: 200,
        spinSymbolCount: 40,
        decelerateSymbolCount: 10,
        overshootSymbols: 0.5,
        bounceStrength: 1.2
    },
    slow: {
        name: 'slow',
        spinDuration: 3000,
        decelerateDuration: 1500,
        alignDuration: 400,
        settleDuration: 300,
        intervalBetweenReels: 300,
        spinSymbolCount: 50,
        decelerateSymbolCount: 15,
        overshootSymbols: 1,
        bounceStrength: 1.5
    }
}

export const useGameStore = defineStore('game', () => {
    // Game State
    const gameState = ref<GameState>('IDLE')
    const isSpinning = computed(() => gameState.value !== 'IDLE')

    // Sequencer / Inspector Mode Toggle
    const isSequencerEnabled = ref(false) // false = Inspector Mode, true = Play Mode

    // Grid Overlay Toggle (Inspector Tool)
    const showGrid = ref(false)

    // Speed Mode
    const currentSpeedMode = ref<SpeedMode>('normal')
    const currentPreset = computed(() => SPEED_PRESETS[currentSpeedMode.value])

    // Auto Spin
    const isAutoSpin = ref(false)

    // Lines / Template
    const currentLines = ref<number>(25)

    // Actions
    const startSpin = () => {
        if (gameState.value !== 'IDLE') {
            console.warn('[GameStore] Already spinning, ignoring startSpin()')
            return
        }
        console.log(`[GameStore] Starting spin (speed: ${currentSpeedMode.value})...`)
        gameState.value = 'SPINNING'
    }

    const stopSpin = () => {
        console.log('[GameStore] Stopping spin...')
        gameState.value = 'IDLE'

        if (isAutoSpin.value) {
            console.log('[GameStore] Auto Spin active. Restarting in 500ms...')
            setTimeout(() => {
                if (isAutoSpin.value) { // Check again in case user cancelled
                    startSpin()
                }
            }, 500)
        }
    }

    const setSpeedMode = (mode: SpeedMode) => {
        console.log(`[GameStore] Speed mode changed to: ${mode}`)
        currentSpeedMode.value = mode
    }

    const setSpeed = setSpeedMode

    const toggleAutoSpin = () => {
        isAutoSpin.value = !isAutoSpin.value
        console.log(`[GameStore] Auto Spin: ${isAutoSpin.value}`)
    }

    const setLines = (lines: number) => {
        currentLines.value = lines
    }

    const toggleGrid = () => {
        showGrid.value = !showGrid.value
        console.log(`[GameStore] Grid overlay: ${showGrid.value ? 'ON' : 'OFF'}`)
    }

    return {
        gameState,
        isSpinning,
        currentSpeedMode,
        currentPreset,
        isAutoSpin,
        startSpin,
        stopSpin,
        setSpeedMode,
        setSpeed,
        toggleAutoSpin,
        currentLines,
        setLines,
        isSequencerEnabled,
        showGrid,
        toggleGrid,
    }
})
