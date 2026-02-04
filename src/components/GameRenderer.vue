<script setup lang="ts">
import { computed } from 'vue'
import { useManifestStore } from '../stores/manifest'
import GameElement from './GameElement.vue'

const store = useManifestStore()

// Fixed Logical Resolution
const STAGE_CONFIG = {
  width: 1280,
  height: 720
}

// Sort elements by z_index to ensure correct layering
const sortedElements = computed(() => {
  return [...store.manifest.layout_elements].sort((a, b) => a.z_index - b.z_index)
})

</script>

<template>
  <v-stage :config="STAGE_CONFIG">
    <v-layer>
      <!-- Background Color (Fallback for Stage) -->
      <v-rect :config="{ width: 1280, height: 720, fill: '#f9f9f9' }" />
      
      <!-- Render Loop -->
      <GameElement 
        v-for="element in sortedElements" 
        :key="element.id" 
        :element="element" 
      />
    </v-layer>
  </v-stage>
</template>
