<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useForgeStore } from '../../stores/forgeStore'

const gameStore = useGameStore()
const forgeStore = useForgeStore()

// --- Tier Logic ---
const currentTier = computed(() => {
    // If target is small, stick to small
    if (gameStore.targetWinAmount < 1000) return 'win_small'

    const amt = gameStore.currentWinAmount
    if (amt >= 50000) return 'win_epic'
    if (amt >= 20000) return 'win_super'
    if (amt >= 5000) return 'win_mega'
    return 'win_big' // Start from Big for >= 1000
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
    gameStore.killWinAnimation()
}

// --- Formatting ---
const formattedAmount = computed(() => {
    return gameStore.currentWinAmount.toLocaleString()
})

</script>

<template>
    <div 
        v-if="gameStore.winState !== 'IDLE'"
        class="win-presentation-layer absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm cursor-pointer"
        @click="handleClick"
    >
        <!-- Scale Transition Wrapper -->
        <transition name="pop" appear>
            <div :key="currentTier" class="relative flex flex-col items-center justify-center">
                
                <!-- 1. Image / Fallback -->
                <div 
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

                <!-- 2. Rollup Number -->
                <div class="mt-8 text-7xl font-black text-white tracking-wide drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] score-text">
                    {{ formattedAmount }}
                </div>

                <div class="mt-4 text-white/70 text-sm font-bold uppercase tracking-widest animate-pulse">
                    Tap to Skip
                </div>

            </div>
        </transition>
    </div>
</template>

<style scoped>
.pop-enter-active {
    animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pop-leave-active {
    transition: opacity 0.2s;
}
.pop-leave-to {
    opacity: 0;
}

@keyframes pop-in {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

/* Stroke effect for text */
.score-text {
    -webkit-text-stroke: 2px black;
}
</style>
