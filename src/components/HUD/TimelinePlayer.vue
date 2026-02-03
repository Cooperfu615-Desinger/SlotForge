<script setup lang="ts">
import { computed } from 'vue'
import { useForgeStore } from '@/stores/forge'

const forgeStore = useForgeStore()

const isPlaying = computed(() => forgeStore.isPlaying)
const currentTime = computed(() => forgeStore.currentTime)
const duration = computed(() => (forgeStore.rhythmSpec?.profiles.normal.spin_duration || 1000) * 5)

function togglePlay() {
    forgeStore.togglePlayback()
}

function handleRangeInput(e: Event) {
    const target = e.target as HTMLInputElement
    forgeStore.setTime(parseFloat(target.value))
}

function formatTime(ms: number) {
    const s = (ms / 1000).toFixed(1)
    return `${s}s`
}
</script>

<template>
    <div class="timeline-player flex items-center gap-4 px-6 py-3 bg-white rounded-full shadow-lg border border-slate-100 pointer-events-auto">
        <button 
            @click="togglePlay"
            class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
            <span v-if="isPlaying">⏸</span>
            <span v-else>▶</span>
        </button>

        <div class="time-display text-xs font-mono text-slate-600 min-w-[60px] text-center">
            {{ formatTime(currentTime) }}
        </div>

        <div class="slider-container flex-1 w-64">
            <input 
                type="range" 
                min="0" 
                :max="duration" 
                step="100" 
                :value="currentTime" 
                @input="handleRangeInput"
                class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
            />
        </div>

        <div class="duration-display text-xs font-mono text-slate-400">
            {{ formatTime(duration) }}
        </div>
    </div>
</template>

<style scoped>
/* Simple styling */
</style>
