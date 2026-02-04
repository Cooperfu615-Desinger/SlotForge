<script setup lang="ts">
import { computed } from 'vue'
import { useManifestStore } from '../stores/manifest'
import GameElement from './GameElement.vue'
import ReelArea from './ReelArea.vue'

const store = useManifestStore()

// Fixed Logical Resolution
const STAGE_CONFIG = {
  width: 1280,
  height: 720
}

// Filter out symbol elements (now handled by ReelArea)
// Only render non-symbol elements (background, buttons, etc.)
const nonSymbolElements = computed(() => {
  return [...store.manifest.layout_elements]
    .filter(el => el.type !== 'symbol')
    .sort((a, b) => a.z_index - b.z_index)
})

</script>

<template>
  <v-stage :config="STAGE_CONFIG">
    <v-layer>
      <!-- Background Color (Fallback for Stage) -->
      <v-rect :config="{ width: 1280, height: 720, fill: '#f9f9f9' }" />
      
      <!-- Non-Symbol Elements (background, buttons, etc.) -->
      <GameElement 
        v-for="element in nonSymbolElements" 
        :key="element.id" 
        :element="element" 
      />
      
      <!-- Reel Area (New: 5 Reels with Clipping Mask) -->
      <ReelArea />
    </v-layer>
  </v-stage>
</template>
