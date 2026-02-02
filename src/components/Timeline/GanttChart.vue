<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForgeStore } from '@/stores/forge'

const forgeStore = useForgeStore()
const rhythmSpec = computed(() => forgeStore.rhythmSpec)
const isPlaying = computed(() => forgeStore.isPlaying)
const currentTime = computed(() => forgeStore.currentTime)

// Timeline Config
const PIXELS_PER_SECOND = 100
const DURATION = 5000 // Total timeline duration in ms (5s)

// DOM Refs
const containerRef = ref<HTMLElement | null>(null)

// Formatting
function formatTime(ms: number) {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(ms % 1000 / 10) // 2 digits
    return `${s}.${m.toString().padStart(2, '0')}s`
}

// Markers for grid
const markers = computed(() => {
    const count = DURATION / 500 // Every 500ms
    return Array.from({ length: count + 1 }, (_, i) => ({
        time: i * 500,
        left: (i * 500 / 1000) * PIXELS_PER_SECOND
    }))
})

// Playback Controls
function togglePlay() {
    forgeStore.togglePlayback()
}

function stop() {
    forgeStore.togglePlayback(false)
    forgeStore.setTime(0)
}

// Scrubbing Logic
const isScrubbing = ref(false)

function handleMouseDown(e: MouseEvent) {
    if (!containerRef.value) return
    isScrubbing.value = true
    updateTimeFromMouse(e)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
    if (isScrubbing.value) {
        updateTimeFromMouse(e)
    }
}

function handleMouseUp() {
    isScrubbing.value = false
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
}

function updateTimeFromMouse(e: MouseEvent) {
    if (!containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    
    // Convert px to ms
    // x = (ms / 1000) * PPS
    // ms = (x / PPS) * 1000
    const time = (x / PIXELS_PER_SECOND) * 1000
    
    // Clamp
    const clampedTime = Math.max(0, Math.min(DURATION, time))
    
    // If playing, pause while scrubbing
    if (isPlaying.value) {
        forgeStore.togglePlayback(false)
    }
    
    forgeStore.setTime(clampedTime)
}

// Playhead Position
const playheadStyle = computed(() => {
    const left = (currentTime.value / 1000) * PIXELS_PER_SECOND
    return { transform: `translateX(${left}px)` }
})

// Spin Event Block (Visualization)
const spinBlocks = computed(() => {
    if (!rhythmSpec.value) return []
    const profile = rhythmSpec.value.profiles.normal
    const duration = profile.spin_duration + profile.reel_stop_interval // Just visualize Reel 1 + 2
    
    return [
        {
            label: 'Spin Phase',
            left: 0,
            width: (duration / 1000) * PIXELS_PER_SECOND,
            color: '#3b82f6'
        }
    ]
})

</script>

<template>
    <div class="gantt-chart">
        <!-- Controls Header -->
        <div class="controls-header">
            <div class="buttons">
                <button @click="togglePlay" :class="{ active: isPlaying }">
                    {{ isPlaying ? '⏸ Pause' : '▶ Play' }}
                </button>
                <button @click="stop">⏹ Stop</button>
            </div>
            <div class="time-display">
                {{ formatTime(currentTime) }}
            </div>
        </div>

        <!-- Timeline Area -->
        <div 
            class="timeline-track" 
            ref="containerRef"
            @mousedown="handleMouseDown"
        >
            <!-- Grid Markers -->
            <div 
                v-for="m in markers" 
                :key="m.time" 
                class="marker"
                :style="{ left: m.left + 'px' }"
            >
                <span>{{ formatTime(m.time) }}</span>
            </div>

            <!-- Visualization Blocks -->
            <div class="blocks-layer">
                <div 
                    v-for="(block, idx) in spinBlocks" 
                    :key="idx"
                    class="event-block"
                    :style="{ 
                        left: block.left + 'px', 
                        width: block.width + 'px',
                        backgroundColor: block.color
                    }"
                >
                    {{ block.label }}
                </div>
            </div>

            <!-- Playhead -->
            <div class="playhead" :style="playheadStyle">
                <div class="head"></div>
                <div class="line"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.gantt-chart {
    height: 100%;
    background: #18181c;
    color: #e4e4e7;
    display: flex;
    flex-direction: column;
    user-select: none;
    border-top: 1px solid #3f3f46;
}

.controls-header {
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background: #27272a;
    border-bottom: 1px solid #3f3f46;
    gap: 16px;
}

.buttons {
    display: flex;
    gap: 8px;
}

button {
    background: #3f3f46;
    border: none;
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

button:hover {
    background: #52525b;
}

button.active {
    background: #2563eb;
}

.time-display {
    font-family: monospace;
    font-weight: bold;
    color: #fbbf24;
}

.timeline-track {
    flex: 1;
    position: relative;
    overflow-x: auto; /* Allow horizontal scroll if needed */
    overflow-y: hidden;
    background: #18181c;
    cursor: text; /* Suggest scrubbing */
}

.marker {
    position: absolute;
    top: 0;
    bottom: 0;
    border-left: 1px solid #3f3f46;
    pointer-events: none;
}

.marker span {
    position: absolute;
    top: 4px;
    left: 4px;
    font-size: 10px;
    color: #71717a;
}

.blocks-layer {
    position: absolute;
    top: 24px;
    left: 0;
    right: 0;
    height: 30px;
}

.event-block {
    position: absolute;
    height: 100%;
    border-radius: 4px;
    opacity: 0.5;
    display: flex;
    align-items: center;
    padding-left: 8px;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    pointer-events: none;
}

.playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    z-index: 10;
    pointer-events: none; /* Mouse events handled by container */
}

.playhead .head {
    position: absolute;
    top: 0;
    left: -6px;
    width: 0; 
    height: 0; 
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #ef4444;
}

.playhead .line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -1px;
    width: 2px;
    background: #ef4444;
}
</style>
