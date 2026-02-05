<script setup lang="ts">
import { computed, ref, watchEffect, watch } from 'vue'
import type { LayoutElement } from '../stores/manifest'
import { useManifestStore } from '../stores/manifest'
import { useGameStore } from '../stores/gameStore'
import { useReelController } from '../composables/useReelController'

const props = defineProps<{
  element: LayoutElement
}>()

const store = useManifestStore()
const gameStore = useGameStore()
const image = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const isError = ref(false)

// Determine if this element is selected
const isSelected = computed(() => store.selectedElementId === props.element.id)

// Config - default landscape for now
const rect = computed(() => props.element.rect_landscape)

watchEffect(() => {
  const src = props.element.asset_src
  if (!src) {
    isLoaded.value = false
    isError.value = true
    return
  }
  
  const img = new Image()
  img.src = src
  img.onload = () => {
    image.value = img
    isLoaded.value = true
    isError.value = false
  }
  img.onerror = () => {
    isLoaded.value = false
    isError.value = true
  }
})

// ========================================
// Reel Animation Logic (for Symbol elements only)
// ========================================

// Determine which reel (column) this symbol belongs to
const reelId = computed(() => {
  if (props.element.type !== 'symbol') return null
  const match = props.element.id.match(/sym_c(\d+)_r\d+/)
  if (!match || !match[1]) return null
  return parseInt(match[1]) - 1
})

// Initialize reel controller if this is a symbol
const reelController = reelId.value !== null 
  ? useReelController(
      {
        reelId: reelId.value,
        symbolHeight: 125  // 120px symbol + 5px gap
      },
      // Callback when all reels have stopped (triggered by last reel)
      () => {
        console.log('[GameElement] All reels stopped, resetting game state')
        gameStore.stopSpin()
      }
    )
  : null

// Watch game state and trigger animation
if (reelController) {
  watch(() => gameStore.gameState, (newState) => {
    if (newState === 'SPINNING') {
      console.log(`[Symbol ${props.element.id}] Starting reel animation`)
      reelController.spin(gameStore.currentPreset)
    }
  })
}

// Main Config with animated Y position
const config = computed(() => ({
  x: rect.value.x,
  y: rect.value.y + (reelController?.offsetY.value || 0),  // Apply animation offset
  width: rect.value.w,
  height: rect.value.h,
  listening: props.element.listening ?? true,
  
  // Center Anchor Logic for Buttons
  offsetX: props.element.anchor === 'center' ? rect.value.w / 2 : 0,
  offsetY: props.element.anchor === 'center' ? rect.value.h / 2 : 0,
}))

const handleClick = () => {
  if (props.element.listening !== false) {
    // Mode Check
    if (gameStore.isSequencerEnabled) {
      // --- Play Mode (Sequencer ON) ---
      // Only Spin Button works
      if (props.element.id === 'btn_spin') {
        console.log('[GameElement] Spin button clicked (Play Mode)!')
        gameStore.startSpin()
      }
      // Ignore all other clicks (no inspector selection)
      return
    }

    // --- Inspector Mode (Sequencer OFF) ---
    // Allow selecting everything for inspection, even the spin button
    store.setSelected(props.element.id)
    console.log(`Selected for Inspection: ${props.element.id}`)
  }
}

</script>

<template>
  <v-group :config="config" @click="handleClick" @tap="handleClick">
    
    <!-- Success: Render Image -->
    <v-image 
      v-if="isLoaded && image" 
      :config="{
        image: image,
        width: rect.w,
        height: rect.h
      }"
    />

    <!-- Fallback: Smart Fallback (White Rect + Black Border + ID) -->
    <v-group v-else>
      <v-rect 
        :config="{
          width: rect.w,
          height: rect.h,
          fill: '#FFFFFF',
          stroke: '#000000',
          strokeWidth: 2
        }"
      />
      <v-text 
        :config="{
          text: props.element.id,
          width: rect.w,
          height: rect.h,
          align: 'center',
          verticalAlign: 'middle',
          fontSize: 14,
          fontStyle: 'bold',
          fill: '#000000'
        }"
      />
    </v-group>

    <!-- Selection Highlight (Cyan Border) -->
    <v-rect 
      v-if="isSelected"
      :config="{
        width: rect.w,
        height: rect.h,
        stroke: '#06b6d4',
        strokeWidth: 4,
        listening: false
      }"
    />

  </v-group>
</template>
