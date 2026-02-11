import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type GameState = 'IDLE' | 'SPINNING' | 'STOPPING' | 'STOPPED'
export type WinState = 'IDLE' | 'ROLLUP' | 'COMPLETED'
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

    // Win Demo State
    const winDuration = ref(2000) // Base duration per tier
    const currentWinAmount = ref(0)
    const targetWinAmount = ref(0)
    const winState = ref<WinState>('IDLE')
    const currentWinTier = ref<string>('win_small') // Track current tier explicitly
    let winTweenRequest: number | null = null

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

    // Win Demo Actions
    const triggerWin = (amount: number) => {
        if (winState.value !== 'IDLE') {
            if (winTweenRequest) cancelAnimationFrame(winTweenRequest)
        }

        console.log(`[GameStore] Trigger Win: ${amount}`)
        targetWinAmount.value = amount
        currentWinAmount.value = 0
        winState.value = 'ROLLUP'

        // 1. Determine Phases
        // If amount < 1000, just do a quick generic spin (Small Win)
        if (amount < 1000) {
            currentWinTier.value = 'win_small'
            runSimpleTween(0, amount, 1500) // 1.5s for small win
            return
        }

        // Build Sequence
        const sequence: { start: number, end: number, tier: string }[] = []

        // Phase 1: 0 -> 5000 (Big)
        sequence.push({ start: 0, end: Math.min(amount, 5000), tier: 'win_big' })

        // Phase 2: 5000 -> 20000 (Mega)
        if (amount > 5000) {
            sequence.push({ start: 5000, end: Math.min(amount, 20000), tier: 'win_mega' })
        }

        // Phase 3: 20000 -> 50000 (Super)
        if (amount > 20000) {
            sequence.push({ start: 20000, end: Math.min(amount, 50000), tier: 'win_super' })
        }

        // Phase 4: > 50000 (Epic)
        if (amount > 50000) {
            sequence.push({ start: 50000, end: amount, tier: 'win_epic' })
        }

        // Execute Sequence
        runSequentialTween(sequence)
    }

    const runSimpleTween = (start: number, end: number, duration: number) => {
        const startTime = performance.now()

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 4) // Ease Out Quart

            currentWinAmount.value = Math.floor(start + (end - start) * ease)

            if (progress < 1) {
                winTweenRequest = requestAnimationFrame(animate)
            } else {
                currentWinAmount.value = end
                winState.value = 'COMPLETED'
                winTweenRequest = null
            }
        }
        winTweenRequest = requestAnimationFrame(animate)
    }

    const runSequentialTween = (sequence: { start: number, end: number, tier: string }[]) => {
        let phaseIndex = 0
        const durationPerPhase = 2000 // 2s per phase
        let phaseStartTime = performance.now()

        const animate = (currentTime: number) => {
            const phase = sequence[phaseIndex]
            if (!phase) return

            // Sync Tier
            if (currentWinTier.value !== phase.tier) {
                currentWinTier.value = phase.tier
            }

            const elapsed = currentTime - phaseStartTime
            const progress = Math.min(elapsed / durationPerPhase, 1)

            // Ease Out Quart for each phase
            const ease = 1 - Math.pow(1 - progress, 4)

            currentWinAmount.value = Math.floor(phase.start + (phase.end - phase.start) * ease)

            if (progress < 1) {
                winTweenRequest = requestAnimationFrame(animate)
            } else {
                // Phase Complete
                currentWinAmount.value = phase.end
                phaseIndex++

                if (phaseIndex < sequence.length) {
                    // Next Phase
                    phaseStartTime = performance.now()
                    winTweenRequest = requestAnimationFrame(animate)
                } else {
                    // All Done
                    winState.value = 'COMPLETED'
                    winTweenRequest = null
                }
            }
        }

        // Set initial tier
        if (sequence.length > 0) currentWinTier.value = sequence[0].tier
        phaseStartTime = performance.now()
        winTweenRequest = requestAnimationFrame(animate)
    }

    const killWinAnimation = () => {
        if (winState.value === 'ROLLUP') {
            if (winTweenRequest) cancelAnimationFrame(winTweenRequest)
            currentWinAmount.value = targetWinAmount.value

            // Set final tier based on target
            if (targetWinAmount.value >= 50000) currentWinTier.value = 'win_epic'
            else if (targetWinAmount.value >= 20000) currentWinTier.value = 'win_super'
            else if (targetWinAmount.value >= 5000) currentWinTier.value = 'win_mega'
            else if (targetWinAmount.value >= 0) currentWinTier.value = 'win_big'

            winState.value = 'COMPLETED'
        } else if (winState.value === 'COMPLETED') {
            winState.value = 'IDLE'
            currentWinAmount.value = 0
        }
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
        winDuration,
        currentWinAmount,
        targetWinAmount,
        winState,
        currentWinTier,
        triggerWin,
        killWinAnimation
    }
})
