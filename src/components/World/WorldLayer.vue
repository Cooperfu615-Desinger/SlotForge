<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useForgeStore } from '@/stores/forge'
import PhoneGroup from './PhoneGroup.vue'

const forgeStore = useForgeStore()

// Viewport State
const viewport = ref<HTMLElement | null>(null)
// We track our own transform state for smooth interactions
const transform = ref({
    x: 0,
    y: 0,
    scale: 0.8 // Initial scale
})

// Bind manual zoom from store (if set)
// When forgeStore.manualZoom changes, we should animate/snap to it?
// Or does the store drive us?
// Plan says: "Bind forge.ts manual zoom to WorldLayer transform".
// If manualZoom is set, we lock scale? Or just use it as target?
// Let's make scale sync with store if not null.

// Mouse interaction state
const isDragging = ref(false)
const lastPos = { x: 0, y: 0 }

function handleWheel(e: WheelEvent) {
    e.preventDefault()
    
    // Zoom logic
    // Standard Google Maps style zoom
    const zoomIntensity = 0.1
    const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity
    const newScale = Math.max(0.1, Math.min(5, transform.value.scale + delta * transform.value.scale))
    
    // Optional: Zoom towards mouse pointer logic (omitted for simplicity first, centering zoom is safer for now)
    transform.value.scale = newScale
    
    // Update store for UI consistency (if we want the slider to move)
    // forgeStore.setManualZoom(newScale) // Only if we want bidirectional sync
}

function handlePointerDown(e: PointerEvent) {
    if (e.button === 1 || e.button === 0) { // Middle mouse or Left mouse (if we treat background as draggable)
        // Only drag if clicking on background (not stage) - but stage is in the world.
        // Actually, "Infinite Whiteboard" usually implies space-drag or background drag.
        // Let's allow dragging anywhere for now via this layer.
        isDragging.value = true
        lastPos.x = e.clientX
        lastPos.y = e.clientY
        viewport.value?.setPointerCapture(e.pointerId)
    }
}

function handlePointerMove(e: PointerEvent) {
    if (!isDragging.value) return
    
    const dx = e.clientX - lastPos.x
    const dy = e.clientY - lastPos.y
    
    transform.value.x += dx
    transform.value.y += dy
    
    lastPos.x = e.clientX
    lastPos.y = e.clientY
}

function handlePointerUp(e: PointerEvent) {
    isDragging.value = false
    viewport.value?.releasePointerCapture(e.pointerId)
}

// Watch store manual zoom
import { watch } from 'vue'
watch(() => forgeStore.manualZoom, (newZoom) => {
    if (newZoom !== null) {
        transform.value.scale = newZoom
    }
})

// Center on mount
onMounted(() => {
    if (viewport.value) {
        // Center initial position
        const vw = viewport.value.clientWidth
        const vh = viewport.value.clientHeight
        transform.value.x = vw / 2
        transform.value.y = vh / 2
    }
})

</script>

<template>
    <div 
        ref="viewport"
        class="world-layer w-full h-full relative overflow-hidden bg-slate-100 cursor-grab active:cursor-grabbing"
        @wheel="handleWheel"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
    >
        <!-- The Infinite Canvas Container -->
        <div 
            class="world-content absolute origin-center"
            :style="{
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale}) translate(-50%, -50%)`
            }"
        >
            <!-- Phone Group centered at (0,0) of this content div (handled by translate -50% -50% above) -->
            <PhoneGroup />
        </div>
        
        <!-- Debug/Grid Background could go here -->
    </div>
</template>

<style scoped>
.world-layer {
    touch-action: none; /* Prevent browser scrolling */
}
</style>
