import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SlotManifest, Orientation, LayoutElement } from '@/types/manifest'

export const useForgeStore = defineStore('forge', () => {
    // State: Current active manifest
    const manifest = ref<SlotManifest | null>(null)

    // State: Current orientation mode
    const currentOrientation = ref<Orientation>('landscape')

    // State: Selected element for inspection
    const selectedElement = ref<LayoutElement | null>(null)

    // State: Timeline control
    const currentTime = ref<number>(0)
    const isPlaying = ref<boolean>(false)

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

    // Computed: Get rhythm spec
    const rhythmSpec = computed(() => {
        return manifest.value?.rhythm_spec
    })

    // Action: Load manifest from JSON
    function loadManifest(data: SlotManifest) {
        manifest.value = data
        currentOrientation.value = data.meta.orientation
        // Reset timeline on load
        currentTime.value = 0
        isPlaying.value = false
    }

    // Action: Update manifest
    function updateManifest(data: SlotManifest) {
        manifest.value = data
    }

    // Action: Set specific orientation
    function setOrientation(orientation: Orientation) {
        currentOrientation.value = orientation
        if (manifest.value) {
            manifest.value.meta.orientation = orientation
        }
    }

    // Action: Select element for inspection
    function selectElement(element: LayoutElement | null) {
        selectedElement.value = element
    }

    // Action: Update element asset URL
    function updateElementAsset(elementId: string, assetUrl: string) {
        if (!manifest.value) return

        const element = manifest.value.layout_elements.find(el => el.id === elementId)
        if (element) {
            element.asset_url = assetUrl
            // Trigger reactivity
            manifest.value = { ...manifest.value }
        }
    }

    // Action: Timeline Controls
    function setTime(time: number) {
        currentTime.value = Math.max(0, time)
    }

    function togglePlayback(playing?: boolean) {
        if (typeof playing === 'boolean') {
            isPlaying.value = playing
        } else {
            isPlaying.value = !isPlaying.value
        }
    }

    return {
        manifest,
        currentOrientation,
        selectedElement,
        currentTime,
        isPlaying,
        orientation,
        baseResolution,
        artSpec,
        layoutElements,
        rhythmSpec,
        loadManifest,
        updateManifest,
        setOrientation,
        selectElement,
        updateElementAsset,
        setTime,
        togglePlayback
    }
})
