import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

interface Resolution {
    w: number
    h: number
}

interface AutoFitOptions {
    baseResolution: Ref<Resolution>
    containerRef: Ref<HTMLElement | null>
    orientation: Ref<'landscape' | 'portrait'>
    manualZoom?: Ref<number | null> // NEW: null = auto-fit, number = manual zoom
}

/**
 * Auto-fit composable for scaling Konva stage to container
 * Ensures content is fully visible without clipping
 */
export function useAutoFit(options: AutoFitOptions) {
    const { baseResolution, containerRef, orientation, manualZoom } = options

    // Container dimensions
    const containerWidth = ref(0)
    const containerHeight = ref(0)

    // Scale factor to fit content in container
    const scaleFactor = computed(() => {
        if (!containerWidth.value || !containerHeight.value) return 1

        // If manual zoom is set, use it instead of auto-fit
        if (manualZoom?.value !== null && manualZoom?.value !== undefined) {
            return manualZoom.value
        }

        const scaleX = containerWidth.value / baseResolution.value.w
        const scaleY = containerHeight.value / baseResolution.value.h

        // Use the smaller scale to ensure content fits (contain mode)
        return Math.min(scaleX, scaleY)
    })

    // Actual stage dimensions (scaled)
    const stageWidth = computed(() => baseResolution.value.w)
    const stageHeight = computed(() => baseResolution.value.h)

    // Offset to center the stage in container
    const stageOffsetX = computed(() => {
        const scaledWidth = stageWidth.value * scaleFactor.value
        return (containerWidth.value - scaledWidth) / 2
    })

    const stageOffsetY = computed(() => {
        const scaledHeight = stageHeight.value * scaleFactor.value
        return (containerHeight.value - scaledHeight) / 2
    })

    // Update container dimensions
    function updateDimensions() {
        if (!containerRef.value) return

        const rect = containerRef.value.getBoundingClientRect()
        containerWidth.value = rect.width
        containerHeight.value = rect.height
    }

    // Convert screen coordinates to stage coordinates
    function screenToStage(screenX: number, screenY: number) {
        if (!containerRef.value) return { x: 0, y: 0 }

        const rect = containerRef.value.getBoundingClientRect()
        const x = (screenX - rect.left - stageOffsetX.value) / scaleFactor.value
        const y = (screenY - rect.top - stageOffsetY.value) / scaleFactor.value

        return { x, y }
    }

    // Watch for orientation changes
    watch(orientation, () => {
        updateDimensions()
    })

    // Setup resize observer
    let resizeObserver: ResizeObserver | null = null

    onMounted(() => {
        updateDimensions()

        // Observe container size changes
        if (containerRef.value) {
            resizeObserver = new ResizeObserver(() => {
                updateDimensions()
            })
            resizeObserver.observe(containerRef.value)
        }
    })

    onUnmounted(() => {
        if (resizeObserver) {
            resizeObserver.disconnect()
        }
    })

    return {
        scaleFactor,
        stageWidth,
        stageHeight,
        stageOffsetX,
        stageOffsetY,
        containerWidth,
        containerHeight,
        screenToStage,
        updateDimensions
    }
}
