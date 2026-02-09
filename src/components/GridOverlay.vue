<script setup lang="ts">
import { computed } from 'vue'

// Grid Configuration
const GRID_SIZE = 20  // 20px spacing = 64 vertical + 36 horizontal = 100 lines
const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 720

// Generate grid line positions
const verticalLines = computed(() => 
  Array.from({ length: Math.ceil(CANVAS_WIDTH / GRID_SIZE) }, (_, i) => i * GRID_SIZE)
)

const horizontalLines = computed(() => 
  Array.from({ length: Math.ceil(CANVAS_HEIGHT / GRID_SIZE) }, (_, i) => i * GRID_SIZE)
)
</script>

<template>
  <!-- Grid Overlay Layer (Top-most, non-interactive) -->
  <v-layer :config="{ listening: false }">
    <!-- Vertical Grid Lines -->
    <v-line 
      v-for="(x, i) in verticalLines" 
      :key="`v-${i}`"
      :config="{
        points: [x, 0, x, 720],
        stroke: i % 2 === 0 ? '#3b82f6' : '#8b5cf6',
        strokeWidth: 1,
        opacity: 0.3,
        dash: [5, 5],
        listening: false
      }"
    />
    
    <!-- Horizontal Grid Lines -->
    <v-line 
      v-for="(y, i) in horizontalLines" 
      :key="`h-${i}`"
      :config="{
        points: [0, y, 1280, y],
        stroke: i % 2 === 0 ? '#3b82f6' : '#8b5cf6',
        strokeWidth: 1,
        opacity: 0.3,
        dash: [5, 5],
        listening: false
      }"
    />
  </v-layer>
</template>
