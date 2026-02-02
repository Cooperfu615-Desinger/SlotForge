<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Layer, Rect as VRect, Image as VImage } from 'vue-konva'
import { useForgeStore } from '@/stores/forge'
import type { LayoutElement, Rect } from '@/types/manifest'

const forgeStore = useForgeStore()

// Get manifest data
const manifest = computed(() => forgeStore.manifest)
const layoutElements = computed(() => forgeStore.layoutElements)
const orientation = computed(() => forgeStore.orientation)

// Image cache
const imageCache = ref<Map<string, HTMLImageElement>>(new Map())

// Get current rect based on orientation
function getCurrentRect(element: LayoutElement): Rect {
  return orientation.value === 'landscape' 
    ? element.rect_landscape 
    : element.rect_portrait
}

// Load image from URL
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// Watch for asset URL changes and preload images
watch(() => layoutElements.value, async (elements) => {
  for (const element of elements) {
    if (element.asset_url && !imageCache.value.has(element.asset_url)) {
      try {
        const img = await loadImage(element.asset_url)
        imageCache.value.set(element.asset_url, img)
      } catch (error) {
        console.error(`Failed to load image: ${element.asset_url}`, error)
      }
    }
  }
}, { deep: true, immediate: true })

// Handle element click for selection
function handleElementClick(element: LayoutElement) {
  forgeStore.selectElement(element)
}

// Color scheme for fallback rectangles
const colors = {
  reel_group: '#3b82f6',
  symbol: '#10b981',
  button: '#f59e0b',
  panel: '#8b5cf6',
  effect: '#ec4899'
}

function getColorByType(type: string): string {
  return colors[type as keyof typeof colors] || '#8b5cf6'
}

// Generate prototype elements (sorted by z-index)
const prototypeElements = computed(() => {
  if (!manifest.value) return []
  
  return [...layoutElements.value]
    .sort((a, b) => a.z_index - b.z_index)
    .map(element => {
      const rect = getCurrentRect(element)
      const color = getColorByType(element.type)
      const image = element.asset_url ? imageCache.value.get(element.asset_url) : null
      
      return {
        element,
        rect,
        color,
        image,
        hasAsset: !!element.asset_url
      }
    })
})
</script>

<template>
  <Layer v-if="manifest">
    <template v-for="item in prototypeElements" :key="item.element.id">
      <!-- Render image if asset exists -->
      <VImage
        v-if="item.hasAsset && item.image"
        :config="{
          x: item.rect.x,
          y: item.rect.y,
          width: item.rect.w,
          height: item.rect.h,
          image: item.image,
          listening: true
        }"
        @click="() => handleElementClick(item.element)"
        @tap="() => handleElementClick(item.element)"
      />
      
      <!-- Fallback to rectangle if no asset -->
      <VRect
        v-else
        :config="{
          x: item.rect.x,
          y: item.rect.y,
          width: item.rect.w,
          height: item.rect.h,
          stroke: item.color,
          strokeWidth: 2,
          fill: item.color + '20',
          listening: true,
          dash: [10, 5]
        }"
        @click="() => handleElementClick(item.element)"
        @tap="() => handleElementClick(item.element)"
      />
    </template>
  </Layer>
</template>
