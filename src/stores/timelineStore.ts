import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SpeedMode } from '../features/reels/config/speedPresets'
import { buildTimelineBlocksFromPreset, getTimelineTotalDuration } from '../features/sequencer/services/timelineMapper'
import { useGameStore } from './gameStore'

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
    const zoomLevel = ref(1.0) // Zoom level: 0.5 to 2.0

    // Computed: Pixels per millisecond for timeline positioning
    const pxPerMs = computed(() => {
        // Base scale: 1000px for totalDuration at zoom 1.0
        const baseWidth = 1000
        return (baseWidth / totalDuration.value) * zoomLevel.value
    })

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
        const gameStore = useGameStore()
        currentTime.value = 0

        const preset = gameStore.getPreset(mode)
        if (!preset) return

        blocks.value = buildTimelineBlocksFromPreset(preset)
        totalDuration.value = getTimelineTotalDuration(preset)
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
        zoomLevel,
        pxPerMs,
        setTime,
        generateFromPreset,
        reset,
        updateBlockDuration
    }
})
