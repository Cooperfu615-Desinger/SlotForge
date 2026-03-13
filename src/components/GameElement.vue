<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import type { LayoutElement } from '../features/manifest/types'
import { useManifestStore } from '../stores/manifest'
import { useGameStore } from '../stores/gameStore'
import { useForgeStore } from '../stores/forgeStore'

const props = defineProps<{
  element: LayoutElement
}>()

const store = useManifestStore()
const gameStore = useGameStore()
const forgeStore = useForgeStore()
const image = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const isError = ref(false)

// Extract asset ID from asset_src path
const assetId = computed(() => {
  if (!props.element.asset_src) return null
  const match = props.element.asset_src.match(/\/([^/]+)\.(png|jpg|jpeg|webp|svg)$/i)
  return match?.[1] || null
})

// Check if custom asset exists
const customAsset = computed(() => {
  if (!assetId.value) return null
  return forgeStore.getAsset(assetId.value)
})

// Determine if this element is selected
const isSelected = computed(() => store.selectedElementId === props.element.id)

// Config - default landscape for now
const rect = computed(() => props.element.rect_landscape)

watchEffect(() => {
  // Priority: custom asset > default asset_src
  const src = customAsset.value?.url || props.element.asset_src
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

// Main Config with animated Y position and custom asset dimensions
const config = computed(() => {
  // CRITICAL: Always use the layout element's defined size (Auto-Fit Scaling)
  // UNLESS: The user has explicitly overridden the size in AssetManagerPanel
  const width = customAsset.value?.displayW ?? rect.value.w
  const height = customAsset.value?.displayH ?? rect.value.h
  const offsetX = customAsset.value?.offsetX ?? 0
  const offsetY = customAsset.value?.offsetY ?? 0
  
  return {
    x: rect.value.x + offsetX,
    y: rect.value.y + offsetY,
    width: width,
    height: height,
    listening: props.element.listening ?? true,
    
    // Center Anchor Logic for Buttons
    offsetX: props.element.anchor === 'center' ? width / 2 : 0,
    offsetY: props.element.anchor === 'center' ? height / 2 : 0,
  }
})

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
    
    <!-- Success: Render Image with custom asset dimensions -->
    <v-image 
      v-if="isLoaded && image" 
      :config="{
        image: image,
        width: config.width,
        height: config.height
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
