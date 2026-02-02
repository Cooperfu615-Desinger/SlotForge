import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SlotManifest, Orientation } from '@/types/manifest'

export const useForgeStore = defineStore('forge', () => {
    // State: Current active manifest
    const manifest = ref<SlotManifest | null>(null)

    // State: Current orientation mode
    const currentOrientation = ref<Orientation>('landscape')

    // Computed: Get current orientation based on manifest
    const orientation = computed(() => {
        return manifest.value?.meta.orientation || currentOrientation.value
    })

    // Computed: Get base resolution
    const baseResolution = computed(() => {
        return manifest.value?.meta.base_resolution || { w: 1920, h: 1080 }
    })

    // Computed: Get art spec
    const artSpec = computed(() => {
        return manifest.value?.art_spec
    })

    // Computed: Get layout elements
    const layoutElements = computed(() => {
        return manifest.value?.layout_elements || []
    })

    // Action: Load manifest from JSON
    function loadManifest(data: SlotManifest) {
        manifest.value = data
        currentOrientation.value = data.meta.orientation
    }

    // Action: Update manifest
    function updateManifest(data: SlotManifest) {
        manifest.value = data
    }

    // Action: Toggle orientation
    function toggleOrientation() {
        currentOrientation.value = currentOrientation.value === 'landscape' ? 'portrait' : 'landscape'
    }

    return {
        manifest,
        currentOrientation,
        orientation,
        baseResolution,
        artSpec,
        layoutElements,
        loadManifest,
        updateManifest,
        toggleOrientation
    }
})
