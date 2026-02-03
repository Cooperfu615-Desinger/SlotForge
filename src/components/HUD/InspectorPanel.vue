<script setup lang="ts">
import { computed } from 'vue'
import { useForgeStore } from '@/stores/forge'
import { transformCoordinate } from '@/logic/coordinate'
import type { Rect } from '@/types/manifest'

const forgeStore = useForgeStore()

// If an element is selected, we show its coordinate info
const selected = computed(() => forgeStore.selectedElement)

// Computed coordinate details
const coordDetails = computed(() => {
    if (!selected.value) return null
    if (!forgeStore.baseResolution) return null
    
    // Resolve rect based on orientation
    const orientation = forgeStore.orientation
    // Fallback to landscape if specific rect missing (though types say they exist)
    const rawRect = orientation === 'portrait' 
        ? selected.value.rect_portrait 
        : selected.value.rect_landscape

    const rect: Rect = {
        x: rawRect.x,
        y: rawRect.y,
        w: rawRect.w,
        h: rawRect.h
    }
    
    // Use the logic/coordinate.ts to get the Cocos equivalent
    return transformCoordinate(rect, 'center', forgeStore.baseResolution) // Defaulting to center anchor for display? Or read from element?
})

// Mock fallback for "Empty State" or "Hover State" (if we had hover)
</script>

<template>
    <div class="inspector-panel w-80 bg-white border-l border-slate-200 shadow-xl flex flex-col pointer-events-auto overflow-y-auto">
        <div class="header px-4 py-3 border-b border-slate-100">
            <h2 class="font-bold text-slate-800">Inspector</h2>
        </div>

        <div class="p-4 space-y-6">
            <!-- Selection Info -->
            <div v-if="selected" class="section">
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Selected Element</h3>
                <div class="info-grid grid grid-cols-2 gap-y-2 text-sm">
                    <div class="text-slate-500">ID</div>
                    <div class="font-mono truncate text-right text-slate-800" :title="selected.id">{{ selected.id }}</div>
                    
                    <div class="text-slate-500">Type</div>
                    <div class="text-right text-slate-800">{{ selected.type }}</div>
                </div>
            </div>

            <div v-else class="section py-8 text-center text-slate-400">
                <p class="text-sm">Select an element to inspect</p>
            </div>

            <!-- Coordinate Transformation Logic -->
            <div v-if="coordDetails" class="section">
                <h3 class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Coordinate Bridge</h3>
                
                <div class="bg-slate-50 rounded p-3 text-xs border border-slate-100">
                    <div class="mb-2 font-semibold text-slate-700">Web Coordinates (Top-Left)</div>
                    <div class="grid grid-cols-2 gap-1 font-mono text-slate-600 mb-3">
                        <span>x: {{ coordDetails.webRect.x }}</span>
                        <span>y: {{ coordDetails.webRect.y }}</span>
                    </div>

                    <div class="mb-2 font-semibold text-purple-700">Cocos Coordinates (Center)</div>
                    <div class="grid grid-cols-2 gap-1 font-mono text-purple-600 mb-3">
                        <span>x: {{ coordDetails.cocosRect.x.toFixed(1) }}</span>
                        <span>y: {{ coordDetails.cocosRect.y.toFixed(1) }}</span>
                    </div>

                    <div class="divider border-t border-slate-200 my-2"></div>
                    
                    <div class="formula text-[10px] text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">
                        {{ coordDetails.formula.calculation }}
                    </div>
                </div>
            </div>

            <!-- Store State Debug -->
            <div class="section">
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Store State</h3>
                <div class="text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded">
                    <div>Ornt: {{ forgeStore.orientation }}</div>
                    <div>Zoom: {{ forgeStore.manualZoom?.toFixed(2) }}</div>
                    <div>Base: {{ forgeStore.baseResolution?.w }}x{{ forgeStore.baseResolution?.h }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Scrollbar polish could go here */
</style>
