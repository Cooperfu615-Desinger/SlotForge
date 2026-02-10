<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const trackHeight = 200

const isDragging = ref(false)

// Convert Scale (0.5 - 1.5) to Percentage (0 - 1)
// Scale 1.0 = 50%
const percentage = computed(() => {
    return (props.modelValue - 0.5) / 1.0 // Range is 1.0 (1.5 - 0.5)
})

const handleMouseDown = (e: MouseEvent) => {
    isDragging.value = true
    updateFromEvent(e)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (e: MouseEvent) => {
    if (isDragging.value) {
        updateFromEvent(e)
    }
}

const onMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
}

const updateFromEvent = (e: MouseEvent) => {
    const track = document.querySelector('.zoom-track')
    if (!track) return

    const rect = track.getBoundingClientRect()
    // Calculate Y relative to bottom (since slider usually goes up... wait, typically sliders go up for zoom?)
    // Let's say Top is Max Zoom (1.5) and Bottom is Min Zoom (0.5)
    // So Y=0 relative to top is 1.5
    // Y=height is 0.5
    
    // Relative Y from top
    let relativeY = e.clientY - rect.top
    // Clamp
    if (relativeY < 0) relativeY = 0
    if (relativeY > trackHeight) relativeY = trackHeight

    // Percent from top (0 = Top/Max, 1 = Bottom/Min)
    const pct = 1 - (relativeY / trackHeight)

    // Map to scale
    // Scale = 0.5 + (pct * 1.0)
    let newScale = 0.5 + (pct * 1.0)
    
    // Snap to 1.0 if close
    if (Math.abs(newScale - 1.0) < 0.05) newScale = 1.0

    emit('update:modelValue', newScale)
}

const resetZoom = () => {
    emit('update:modelValue', 1.0)
}

</script>

<template>
  <div class="zoom-slider" @dblclick="resetZoom">
    <div class="zoom-label">{{ Math.round(props.modelValue * 100) }}%</div>
    
    <div class="zoom-track" :style="{ height: trackHeight + 'px' }" @mousedown="handleMouseDown">
        <div class="zoom-fill" :style="{ height: (percentage * 100) + '%' }"></div>
        <div class="zoom-knob" :style="{ bottom: (percentage * 100) + '%' }"></div>
    </div>
  </div>
</template>

<style scoped>
.zoom-slider {
    position: fixed;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    user-select: none;
    z-index: 60; /* Higher than windows */
}

.zoom-label {
    font-size: 12px;
    font-weight: bold;
    color: #374151;
    background-color: white;
    padding: 2px 6px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.zoom-track {
    width: 6px;
    background-color: #e5e7eb; /* gray-200 */
    border-radius: 3px;
    position: relative;
    cursor: pointer;
}

.zoom-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #3b82f6; /* blue-500 */
    border-radius: 3px;
    pointer-events: none;
}

.zoom-knob {
    position: absolute;
    left: 50%;
    width: 16px;
    height: 16px;
    background-color: white;
    border: 2px solid #3b82f6;
    border-radius: 50%;
    transform: translate(-50%, 50%); /* Center on bottom/top coords */
    cursor: grab;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.zoom-knob:active {
    cursor: grabbing;
    transform: translate(-50%, 50%) scale(1.1);
}
</style>
