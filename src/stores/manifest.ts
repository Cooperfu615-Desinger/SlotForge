import { defineStore } from 'pinia'
import { computed } from 'vue'
import { DEFAULT_CONFIG, TEMPLATES } from '../features/manifest/templateRegistry'
import { buildManifest } from '../features/manifest/services/sceneBuilder'
import { useEditorStore } from '../features/manifest/stores/editorStore'
import type { SlotManifest, TemplateConfig } from '../features/manifest/types'

// --------------------------------------------------------
// Store Definition
// --------------------------------------------------------

export const useManifestStore = defineStore('manifest', () => {
    const editorStore = useEditorStore()

    // Reactive Grid Configuration
    const gridConfig = computed<TemplateConfig['grid']>(() => {
        const t = TEMPLATES[editorStore.currentTemplateId]
        return t ? t.grid : DEFAULT_CONFIG.grid
    })
    const reelAreaRect = computed(() => {
        const t = TEMPLATES[editorStore.currentTemplateId]
        return t ? t.reel_area_rect : DEFAULT_CONFIG.reel_area_rect
    })
    const clippingRect = computed(() => {
        const t = TEMPLATES[editorStore.currentTemplateId]
        return t?.clipping_rect || t?.reel_area_rect || DEFAULT_CONFIG.reel_area_rect
    })

    // Construct the full manifest primarily based on 'currentGrid'
    const manifest = computed<SlotManifest>(() => {
        const template = TEMPLATES[editorStore.currentTemplateId] || DEFAULT_CONFIG
        return buildManifest(template)
    })

    return {
        manifest,
        selectedElementId: editorStore.selectedElementId,
        setSelected: editorStore.setSelected,
        loadTemplate: editorStore.loadTemplate,
        currentGrid: editorStore.currentTemplateId,
        gridConfig,     // Export for ReelArea
        reelAreaRect,   // Export for ReelArea
        clippingRect,   // Export for ReelArea (visual clipping mask)
        reelCount: computed(() => gridConfig.value.cols) // Export total reel count
    }
})
