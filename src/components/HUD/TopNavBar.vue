<script setup lang="ts">
import { useForgeStore } from '@/stores/forge'

const forgeStore = useForgeStore()

function handleZoom(e: Event) {
    const target = e.target as HTMLInputElement
    const val = parseFloat(target.value)
    forgeStore.setManualZoom(val)
}

function resetZoom() {
    forgeStore.setManualZoom(1.0)
}
</script>

<template>
    <div class="top-nav-bar flex items-center px-4 h-14 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm pointer-events-auto">
        <div class="brand font-bold text-lg text-slate-800 mr-8">
            SlotForge <span class="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded ml-2">Phase 6</span>
        </div>

        <div class="separator w-px h-6 bg-slate-200 mx-2"></div>

        <div class="zoom-control flex items-center gap-3">
            <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Zoom</span>
            <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                :value="forgeStore.manualZoom || 0.8" 
                @input="handleZoom"
                class="w-32 accent-blue-600"
            />
            <span class="text-xs text-slate-600 font-mono w-10 text-right">
                {{ Math.round((forgeStore.manualZoom || 0.8) * 100) }}%
            </span>
            <button @click="resetZoom" class="text-xs text-blue-600 hover:text-blue-700 font-medium px-2">
                Reset
            </button>
        </div>

        <div class="spacer flex-1"></div>

        <div class="actions">
            <!-- Save/Load buttons could go here -->
        </div>
    </div>
</template>

<style scoped>
/* Scoped styles if needed */
</style>
