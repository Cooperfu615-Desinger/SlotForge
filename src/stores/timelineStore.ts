import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SPEED_PRESETS, type SpeedMode } from './gameStore'

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

    return {
        currentTime,
        totalDuration,
        isPlaying,
        tracks,
        blocks,
        setTime,
        generateFromPreset,
        reset
    }
})
