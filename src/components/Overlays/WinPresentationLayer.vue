<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useForgeStore } from '../../stores/forgeStore'
import { useManifestStore } from '../../stores/manifest'
import { useGridLayout } from '../../composables/useGridLayout'

const gameStore = useGameStore()
const forgeStore = useForgeStore()
const manifestStore = useManifestStore()
const { getCoordinatesFromIndex } = useGridLayout()

// --- Tier Logic ---
const currentTier = computed(() => {
    return gameStore.currentWinTier
})

// --- Asset Resolution ---
const currentAsset = computed(() => {
    const assetId = currentTier.value
    const custom = forgeStore.getAsset(assetId)
    return custom ? custom.url : null
})

// --- Fallback Colors ---
const fallbackColor = computed(() => {
    switch (currentTier.value) {
        case 'win_small': return '#3b82f6' // Blue
        case 'win_big': return '#10b981'   // Green
        case 'win_mega': return '#8b5cf6'  // Purple
        case 'win_super': return '#f59e0b' // Orange
        case 'win_epic': return '#ef4444'  // Red
        default: return '#6b7280'
    }
})

const getTierLabel = (tier: string) => {
    switch (tier) {
        case 'win_small': return 'WIN'
        case 'win_big': return 'BIG WIN'
        case 'win_mega': return 'MEGA WIN'
        case 'win_super': return 'SUPER WIN'
        case 'win_epic': return 'EPIC WIN'
        default: return ''
    }
}

// --- Interaction ---
const handleClick = () => {
    if (gameStore.winState !== 'IDLE') {
        gameStore.killWinAnimation()
    }
}

// --- Formatting ---
const formattedAmount = computed(() => {
    return gameStore.currentWinAmount.toLocaleString()
})

// --- FX Logic ---
const symbolDimensions = computed(() => {
    const { cell_w, cell_h } = manifestStore.gridConfig
    return { w: cell_w, h: cell_h }
})

const linePathData = computed(() => {
    if (gameStore.winEffect !== 'LINE') return ''
    // data is array of indices
    const indices = gameStore.winEffectData
    if (!indices || indices.length === 0) return ''

    return indices.map((idx, i) => {
        const { x, y } = getCoordinatesFromIndex(idx)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
})

const wayRects = computed(() => {
    if (gameStore.winEffect !== 'WAY') return []
    const indices = gameStore.winEffectData
    const { w, h } = symbolDimensions.value
    
    return indices.map(idx => {
        const { x: cx, y: cy } = getCoordinatesFromIndex(idx)
        return {
            x: cx - w / 2,
            y: cy - h / 2,
            w,
            h
        }
    })
})
</script>

<template>
    <!-- Root Container: Handles both FX and Win Rollup -->
    <!-- Pointer events only if interactive state is active (Rollup) -->
    <div 
        v-if="gameStore.winState !== 'IDLE' || gameStore.winEffect !== 'IDLE'"
        class="win-presentation-layer absolute inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300"
        :class="{ 'pointer-events-auto cursor-pointer': gameStore.winState !== 'IDLE', 'pointer-events-none': gameStore.winState === 'IDLE' }"
        @click="handleClick"
    >
        <!-- Layer 1: FX Overlay (Line / Way) -->
        <!-- Z-Index 40 (Below Rollup Text) -->
        <svg 
            v-if="gameStore.winEffect !== 'IDLE'"
            class="absolute inset-0 z-40 pointer-events-none" 
            width="1280" 
            height="720" 
            viewBox="0 0 1280 720"
        >
            <defs>
                <!-- Line Glow Filter -->
                <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <!-- Way Mask (Dimmer Holes) -->
                <mask id="way-mask">
                    <!-- White fills everything (Visible) -->
                    <rect x="0" y="0" width="1280" height="720" fill="white" />
                    <!-- Black rects cut holes (Transparent) -->
                    <rect 
                        v-for="(r, i) in wayRects" :key="i"
                        :x="r.x" :y="r.y" :width="r.w" :height="r.h"
                        fill="black"
                    />
                </mask>
            </defs>

            <!-- Line FX -->
            <path 
                v-if="gameStore.winEffect === 'LINE'"
                :d="linePathData"
                stroke="#06b6d4" 
                stroke-width="10" 
                fill="none" 
                filter="url(#line-glow)"
                stroke-linecap="round" 
                stroke-linejoin="round"
                stroke-dasharray="20 10"
                class="animate-flow-dash"
            />

            <!-- Way FX: Dimmer -->
            <!-- Use a full rect with mask to create holes -->
            <rect 
                v-if="gameStore.winEffect === 'WAY'"
                x="0" y="0" width="1280" height="720"
                fill="black" fill-opacity="0.6"
                mask="url(#way-mask)"
            />

            <!-- Way FX: Highlight Frames -->
            <rect 
                v-if="gameStore.winEffect === 'WAY'"
                v-for="(r, i) in wayRects" :key="`outline-${i}`"
                :x="r.x" :y="r.y" :width="r.w" :height="r.h"
                fill="none"
                stroke="#fbbf24"
                stroke-width="6"
                class="animate-pulse-fast"
            />
        </svg>

        <!-- Layer 2: Win Rollup UI (Backdrop + Text) -->
        <div 
            v-if="gameStore.winState !== 'IDLE'" 
            class="relative z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm w-full h-full"
        >
            <!-- 1. Image / Fallback (Animated) -->
            <transition name="pop" mode="out-in">
                <div 
                    :key="currentTier"
                    class="asset-container flex items-center justify-center shadow-2xl rounded-xl overflow-hidden"
                    :style="{ 
                        width: '600px', 
                        height: '300px',
                        backgroundColor: currentAsset ? 'transparent' : fallbackColor,
                        border: currentAsset ? 'none' : '4px solid white'
                    }"
                >
                    <img 
                        v-if="currentAsset" 
                        :src="currentAsset" 
                        class="w-full h-full object-contain"
                    />
                    <div v-else class="text-white text-6xl font-black italic tracking-tighter uppercase drop-shadow-md">
                        {{ getTierLabel(currentTier) }}
                    </div>
                </div>
            </transition>

            <!-- 2. Rollup Number (Static Position) -->
            <div class="mt-8 text-[10rem] leading-none font-black text-white tracking-wide drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                {{ formattedAmount }}
            </div>

            <div class="mt-4 text-white/70 text-xl font-bold uppercase tracking-widest animate-pulse">
                Tap to Skip
            </div>

        </div>
    </div>
</template>

<style scoped>
.pop-enter-active {
    animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pop-leave-active {
    animation: pop-in 0.2s reverse;
}

@keyframes pop-in {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

.animate-flow-dash {
    animation: flowDash 1s linear infinite;
}

@keyframes flowDash {
    to {
        stroke-dashoffset: -30;
    }
}

.animate-pulse-fast {
    animation: pulseFast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulseFast {
    0%, 100% { opacity: 1; stroke-width: 6px; }
    50% { opacity: 0.5; stroke-width: 4px; }
}
</style>
