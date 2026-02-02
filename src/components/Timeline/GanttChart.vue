<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForgeStore } from '@/stores/forge'

const forgeStore = useForgeStore()
const rhythmSpec = computed(() => forgeStore.rhythmSpec)
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
    const time = (x / PIXELS_PER_SECOND) * 1000
    
    // Clamp
    const clampedTime = Math.max(0, Math.min(DURATION, time))
    
    // If playing, pause while scrubbing
    if (forgeStore.isPlaying) {
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
    background-color: transparent;
    color: #fafafa;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    user-select: none;
}

/* Timeline Track */
.timeline-track {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
    cursor: text;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Grid Markers */
.marker {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: rgba(255, 255, 255, 0.1);
}

.marker span {
    position: absolute;
    top: 4px;
    left: 4px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
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
    top: 10px;
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

/* Playhead - Neon Purple */
.playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    border-left: 3px solid #a78bfa;
    box-shadow: 0 0 10px #a78bfa, 0 0 20px rgba(167, 139, 250, 0.5);
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
    border-top: 10px solid #a78bfa;
    filter: drop-shadow(0 0 6px #a78bfa);
}

.playhead .line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -1.5px;
    width: 3px;
    background: #a78bfa;
}
</style>
