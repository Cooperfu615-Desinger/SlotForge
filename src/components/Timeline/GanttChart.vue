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
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #ffffff;
    color: #18181b;
    font-family: 'Monaco', 'Consolas', monospace;
    user-select: none;
}

/* Header / Controls */
.controls-header {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: #fafafa;
    border-bottom: 1px solid #e4e4e7;
    gap: 16px;
}

.buttons button {
    background: white;
    border: 1px solid #d4d4d8;
    color: #18181b;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
}

.buttons button:hover {
    background: #f4f4f5;
}

.buttons button.active {
    background: #eff6ff;
    color: #3b82f6;
    border-color: #3b82f6;
}

.time-display {
    font-size: 14px;
    font-weight: bold;
    color: #3b82f6;
    min-width: 80px;
    text-align: right;
}

/* Timeline Track */
.timeline-track {
    flex: 1;
    position: relative;
    overflow: hidden; /* Scroll logic handled by transform */
    background: #f4f4f5; /* Track bg */
    cursor: text; /* I-beam cursor for scrubbing */
    margin: 10px;
    border-radius: 6px;
    border: 1px solid #e4e4e7;
}

/* Grid Markers */
.marker {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: #d4d4d8;
}

.marker span {
    position: absolute;
    top: 4px;
    left: 4px;
    font-size: 10px;
    color: #71717a;
}

/* Blocks */
.blocks-layer {
    position: absolute;
    top: 30px;
    bottom: 0;
    left: 0;
    right: 0;
}

.event-block {
    position: absolute;
    height: 24px;
    top: 10px; /* Offset from top */
    background-color: #3b82f6;
    border-radius: 4px;
    opacity: 0.8;
    color: white;
    font-size: 10px;
    display: flex;
    align-items: center;
    padding-left: 6px;
    white-space: nowrap;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* Playhead */
.playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    border-left: 2px solid #ef4444; /* Red line */
    z-index: 10;
    pointer-events: none;
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
