import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SPEED_PRESETS, type SpeedMode, useGameStore } from './gameStore'

export interface TimelineBlock {
    id: string
    trackId: string
    start: number   // ms
    duration: number // ms
    label: string
    color: string
    textColor?: string
    phase?: 'spin' | 'decelerate' | 'align' | 'settle'
}

export interface TimelineTrack {
    id: string
    label: string
}

// Duration constraints
// Duration constraints
const MIN_DURATION = 100  // ms (Lower min for short phases like settle)
const MAX_DURATION = 10000 // ms

export const useTimelineStore = defineStore('timeline', () => {
    // State
    const currentTime = ref(0)
    const totalDuration = ref(5000) // Default view range 5s
    const isPlaying = ref(false)

    const tracks = ref<TimelineTrack[]>([
        { id: 'global', label: 'Global' },
        { id: 'reel1', label: 'Reel 1' },
        { id: 'reel2', label: 'Reel 2' },
        { id: 'reel3', label: 'Reel 3' },
        { id: 'reel4', label: 'Reel 4' },
        { id: 'reel5', label: 'Reel 5' },
        { id: 'win', label: 'Win Demo' },
        { id: 'audio', label: 'Audio/FX' }
    ])

    const blocks = ref<TimelineBlock[]>([])

    // Actions
    const setTime = (time: number) => {
        currentTime.value = Math.max(0, Math.min(time, totalDuration.value))
    }

    const generateFromPreset = (mode: SpeedMode) => {
        // Clear existing
        blocks.value = []
        currentTime.value = 0

        const preset = SPEED_PRESETS[mode]
        if (!preset) return

        const baseId = `seq-${Date.now()}`

        // Get phase durations
        const spinDuration = preset.spinDuration
        const decelerateDuration = preset.decelerateDuration
        const alignDuration = preset.alignDuration
        const settleDuration = preset.settleDuration
        const interval = preset.intervalBetweenReels // P5

        // Generate blocks for each of the 5 reels
        for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
            const reelNum = reelIndex + 1
            const trackId = `reel${reelNum}`

            // Calculate stagger offset: (n-1) × P5
            const staggerOffset = reelIndex * interval

            let currentTimeOffset = staggerOffset

            // Phase 1: Spin (Darker Gray)
            blocks.value.push({
                id: `${baseId}-r${reelNum}-spin`,
                trackId,
                start: currentTimeOffset,
                duration: spinDuration,
                label: 'SPIN',
                color: '#4b5563', // gray-600
                phase: 'spin'
            })
            currentTimeOffset += spinDuration

            // Phase 2: Decelerate (Medium Gray)
            blocks.value.push({
                id: `${baseId}-r${reelNum}-dec`,
                trackId,
                start: currentTimeOffset,
                duration: decelerateDuration,
                label: 'DEC',
                color: '#6b7280', // gray-500
                phase: 'decelerate'
            })
            currentTimeOffset += decelerateDuration

            // Phase 3: Align (Light Gray)
            blocks.value.push({
                id: `${baseId}-r${reelNum}-aln`,
                trackId,
                start: currentTimeOffset,
                duration: alignDuration,
                label: 'ALN',
                color: '#9ca3af', // gray-400
                phase: 'align'
            })
            currentTimeOffset += alignDuration

            // Phase 4: Settle (Lighter Gray)
            blocks.value.push({
                id: `${baseId}-r${reelNum}-set`,
                trackId,
                start: currentTimeOffset,
                duration: settleDuration,
                label: 'SET',
                color: '#d1d5db', // gray-300
                textColor: '#374151', // gray-700
                phase: 'settle'
            })
        }

        // Calculate total duration: (4 × P5) + (P1 + P2 + P3 + P4) + padding
        const totalPhaseDuration = spinDuration + decelerateDuration + alignDuration + settleDuration
        const totalStagger = 4 * interval
        totalDuration.value = Math.max(5000, totalStagger + totalPhaseDuration + 1000)
    }

    const reset = () => {
        currentTime.value = 0
        isPlaying.value = false
    }

    /**
     * Update block duration with constraints
     * Automatically adjusts subsequent blocks to prevent overlap
     */
    const updateBlockDuration = (blockId: string, newDuration: number) => {
        // Find the block
        const blockIndex = blocks.value.findIndex(b => b.id === blockId)
        if (blockIndex === -1) return

        const block = blocks.value[blockIndex]
        if (!block) return // Guard against undefined

        // Apply constraints
        const constrainedDuration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, newDuration))

        // Calculate the change in duration
        const durationDelta = constrainedDuration - block.duration

        // Update the block
        block.duration = constrainedDuration

        // Adjust subsequent blocks on the same track
        for (let i = blockIndex + 1; i < blocks.value.length; i++) {
            const subsequentBlock = blocks.value[i]
            if (subsequentBlock && subsequentBlock.trackId === block.trackId) {
                subsequentBlock.start += durationDelta
            }
        }

        // Update total duration if needed
        const maxEnd = Math.max(...blocks.value.map(b => b.start + b.duration))
        totalDuration.value = Math.max(5000, maxEnd + 1000)

        // Sync with gameStore physics
        if (block.phase) {
            const gameStore = useGameStore()
            gameStore.updatePhaseDuration(block.phase, constrainedDuration)
        }
    }

    return {
        currentTime,
        totalDuration,
        isPlaying,
        tracks,
        blocks,
        setTime,
        generateFromPreset,
        reset,
        updateBlockDuration
    }
})
