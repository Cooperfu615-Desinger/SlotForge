<script setup lang="ts">
import { computed } from 'vue'
import { useTimelineStore } from '../../stores/timelineStore'

const store = useTimelineStore()

// --- Ruler Logic ---
const ticks = computed(() => {
    const totalMs = store.totalDuration
    const tickInterval = 500 // ms
    const count = Math.ceil(totalMs / tickInterval)
    
    return Array.from({ length: count + 1 }, (_, i) => {
        const time = i * tickInterval
        return {
            time,
            label: (time / 1000).toFixed(1) + 's',
            left: (time / totalMs) * 100 + '%'
        }
    })
})

// --- Block Rendering ---
const getBlockStyle = (block: any) => {
    const left = (block.start / store.totalDuration) * 100
    const width = (block.duration / store.totalDuration) * 100
    return {
        left: `${left}%`,
        width: `${width}%`,
        backgroundColor: block.color
    }
}

// --- Playhead ---
const playheadLeft = computed(() => {
    return (store.currentTime / store.totalDuration) * 100 + '%'
})

// --- Interaction (Scrubbing - Optional for now) ---
// We can add click-to-seek later if needed based on "Scrubbing" request?
// For now user asked for "Visual" only.

</script>

<template>
    <div class="timeline-view flex flex-col h-full bg-gray-50 select-none">
        
        <!-- Ruler -->
        <div class="ruler h-6 border-b border-gray-200 relative bg-white">
            <div 
                v-for="tick in ticks" 
                :key="tick.time"
                class="absolute top-0 h-full border-l border-gray-300 pl-1 text-[9px] text-gray-400 select-none pointer-events-none"
                :style="{ left: tick.left }"
            >
                {{ tick.label }}
            </div>
            
            <!-- Playhead Top Triangle -->
            <div 
                class="absolute top-0 w-3 h-3 -ml-1.5 z-20 pointer-events-none transition-transform duration-75"
                :style="{ left: playheadLeft }"
            >
                <svg viewBox="0 0 10 10" class="fill-red-500 drop-shadow-sm">
                    <path d="M0 0 L10 0 L5 8 Z" />
                </svg>
            </div>
        </div>

        <!-- Tracks -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden relative">
            <div 
                v-for="track in store.tracks" 
                :key="track.id"
                class="track-row h-8 border-b border-gray-200 relative flex items-center bg-gray-50/50 hover:bg-white transition-colors"
            >
                <!-- Track Header (Label) -->
                <!-- We might want headers on the left outside this scrolling area? 
                     But user requirement implies "below Sequencer Panel" which had internal headers.
                     Let's verify SequencerPanel layout. It had "track-headers" and "track-lanes".
                     We should probably reproduce that layout here or expect the parent to handle headers.
                     "TimelineView" usually implies the timeline part. 
                     Let's include the headers here for a self-contained component. 
                -->
                
                <!-- Left Header Column -->
                <div class="w-32 flex-shrink-0 border-r border-gray-200 h-full flex items-center px-3 text-xs font-medium text-gray-500 bg-white z-10 sticky left-0">
                    {{ track.label }}
                </div>

                <!-- Right Lane (Timeline) -->
                <div class="flex-1 h-full relative">
                    <!-- Grid Lines matching ruler -->
                    <div 
                        v-for="tick in ticks" 
                        :key="`grid-${tick.time}`"
                        class="absolute top-0 bottom-0 border-l border-gray-100 h-full pointer-events-none"
                        :style="{ left: tick.left }"
                    ></div>

                    <!-- Blocks -->
                    <div 
                        v-for="block in store.blocks.filter(b => b.trackId === track.id)"
                        :key="block.id"
                        class="absolute top-1 bottom-1 rounded-sm flex items-center px-2 text-[10px] text-white font-bold shadow-sm overflow-hidden whitespace-nowrap"
                        :style="getBlockStyle(block)"
                    >
                        {{ block.label }}
                    </div>
                </div>
            </div>

            <!-- Global Playhead Line (spanning all tracks) -->
            <div 
                class="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-none shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                :style="{ left: playheadLeft, marginLeft: '128px' /* Offset by header width */ }"
            ></div>
        </div>

    </div>
</template>

<style scoped>
/* Custom scrollbar for tracks if needed */
.timeline-view ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
.timeline-view ::-webkit-scrollbar-track {
    background: transparent;
}
.timeline-view ::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 3px;
}
.timeline-view ::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
}
</style>
