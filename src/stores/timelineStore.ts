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
}

export interface TimelineTrack {
    id: string
    label: string
}

// Duration constraints
const MIN_DURATION = 500  // ms
const MAX_DURATION = 10000 // ms

export const useTimelineStore = defineStore('timeline', () => {
    // State
    const currentTime = ref(0)
    const totalDuration = ref(5000) // Default view range 5s
    const isPlaying = ref(false)

    const tracks = ref<TimelineTrack[]>([
        { id: 'global', label: 'Global' },
        { id: 'reels', label: 'Reels Group' },
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

        // Create a block representing the Spin Sequence
        // Main Spin (Red/Gray based on speed)
        let color = '#9ca3af' // gray-400
        if (mode === 'fast') color = '#fbbf24' // amber-400
        if (mode === 'instant') color = '#ef4444' // red-500

        // Total spin duration from preset
        // For visualization, we use spinDuration as the main block
        // Actually the total time is spin + decelerate + align + settle
        // But the preset structure is a bit complex. 
        // Let's simplified visualization: "Spinning" block.

        // Duration = spinDuration (Base spin time)
        // Note: spinDuration in preset is often the "Max" time or base time.
        // Let's use `preset.spinDuration` as the block length for now.

        blocks.value.push({
            id: `spin-${Date.now()}`,
            trackId: 'reels',
            start: 0,
            duration: preset.spinDuration,
            label: `Spin (${mode})`,
            color: color
        })

        // Adjust view duration to fit
        totalDuration.value = Math.max(5000, preset.spinDuration + 1000)
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

        // Sync with gameStore preset to update reel animation speed
        const gameStore = useGameStore()
        gameStore.updateSpinDuration(constrainedDuration)
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
