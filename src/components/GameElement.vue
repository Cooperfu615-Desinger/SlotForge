<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import type { LayoutElement } from '../stores/manifest'
import { useManifestStore } from '../stores/manifest'

const props = defineProps<{
  element: LayoutElement
}>()

const store = useManifestStore()
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

// Main Config
const config = computed(() => ({
  x: rect.value.x,
  y: rect.value.y,
  width: rect.value.w,
  height: rect.value.h,
  listening: props.element.listening ?? true,
  draggable: store.isEditMode, // Enable dragging in edit mode
  
  // Center Anchor Logic for Buttons
  offsetX: props.element.anchor === 'center' ? rect.value.w / 2 : 0,
  offsetY: props.element.anchor === 'center' ? rect.value.h / 2 : 0,
}))

const handleClick = () => {
  if (props.element.listening !== false) {
    store.setSelected(props.element.id)
    console.log(`Selected: ${props.element.id}`)
  }
}

const handleDragEnd = (e: any) => {
  const node = e.target
  let x = node.x()
  let y = node.y()
  
  // Adjust for center anchor
  if (props.element.anchor === 'center') {
    x += rect.value.w / 2
    y += rect.value.h / 2
  }
  
  store.updateElementPosition(props.element.id, x, y)
}

</script>

<template>
  <v-group 
    :config="config" 
    @click="handleClick" 
    @tap="handleClick"
    @dragend="handleDragEnd"
  >
    
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
          fontSize: 14, // Smaller font for dense grids
          fontStyle: 'bold',
          fill: '#000000'
        }"
      />
    </v-group>

    <!-- Edit Mode Indicator (Cyan Dashed Border) -->
    <v-rect 
      v-if="store.isEditMode && isSelected"
      :config="{
        width: rect.w,
        height: rect.h,
        stroke: '#06b6d4', // Cyan-500
        strokeWidth: 2,
        dash: [10, 5], // Dashed line
        listening: false
      }"
    />

    <!-- Selection Highlight (Cyan Border) -->
    <v-rect 
      v-if="isSelected && !store.isEditMode"
      :config="{
        width: rect.w,
        height: rect.h,
        stroke: '#06b6d4', // Cyan-500
        strokeWidth: 4,
        listening: false // Visual only, don't block clicks
      }"
    />

  </v-group>
</template>
