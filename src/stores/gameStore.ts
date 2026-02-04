import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type GameState = 'IDLE' | 'SPINNING' | 'STOPPING' | 'STOPPED'

export interface RhythmSpec {
    spinDuration: number        // Total spin time (ms)
    intervalBetweenReels: number  // Delay between each reel stop (ms)
}

export const useGameStore = defineStore('game', () => {
    // Game State
    const gameState = ref<GameState>('IDLE')
    const isSpinning = computed(() => gameState.value !== 'IDLE')

    // Spin Configuration (Rhythm Spec)
    const rhythmSpec = ref<RhythmSpec>({
        spinDuration: 2000,           // 2 seconds spin
        intervalBetweenReels: 300     // 300ms delay between each reel
    })

    // Actions
    const startSpin = () => {
        if (gameState.value !== 'IDLE') {
            console.warn('[GameStore] Already spinning, ignoring startSpin()')
            return
        }
        console.log('[GameStore] Starting spin...')
        gameState.value = 'SPINNING'
    }

    const stopSpin = () => {
        console.log('[GameStore] Stopping spin...')
        gameState.value = 'IDLE'
    }

    return {
        gameState,
        isSpinning,
        rhythmSpec,
        startSpin,
        stopSpin
    }
})
