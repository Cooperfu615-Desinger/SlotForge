<script setup lang="ts">
import { computed } from 'vue'
import { Layer, Rect as VRect, Line as VLine, Text as VText } from 'vue-konva'
import { useForgeStore } from '@/stores/forge'
import type { LayoutElement, Rect } from '@/types/manifest'

const forgeStore = useForgeStore()

// Get manifest data
const manifest = computed(() => forgeStore.manifest)
const artSpec = computed(() => forgeStore.artSpec)
const layoutElements = computed(() => forgeStore.layoutElements)
const baseResolution = computed(() => forgeStore.baseResolution)
const orientation = computed(() => forgeStore.orientation)

// Get current rect based on orientation
function getCurrentRect(element: LayoutElement): Rect {
  return orientation.value === 'landscape' 
    ? element.rect_landscape 
    : element.rect_portrait
}

// Handle element click for selection
function handleElementClick(element: LayoutElement) {
  forgeStore.selectElement(element)
}

// Color scheme
const colors = {
  reelFrame: '#3b82f6',      // Blue for reel frames
  symbol: '#10b981',         // Green for symbols
  button: '#f59e0b',         // Amber for buttons
  panel: '#8b5cf6',          // Purple for panels
  effect: '#ec4899',         // Pink for effects
  safeArea: '#22c55e',       // Green for safe area
  bleed: '#ef4444',          // Red for bleed
  dimension: '#a1a1aa',      // Gray for dimensions
  text: '#e4e4e7'            // Light gray for text
}

// Get color by element type
function getColorByType(type: string): string {
  return colors[type as keyof typeof colors] || colors.panel
}

// Generate dimension lines for a rect
function generateDimensionLines(rect: Rect, color: string) {
  const lines = []
  const offset = 10
  
  // Top dimension line (width)
  lines.push({
    points: [rect.x, rect.y - offset, rect.x + rect.w, rect.y - offset],
    stroke: color,
    strokeWidth: 1,
    dash: [5, 5]
  })
  
  // Left dimension line (height)
  lines.push({
    points: [rect.x - offset, rect.y, rect.x - offset, rect.y + rect.h],
    stroke: color,
    strokeWidth: 1,
    dash: [5, 5]
  })
  
  return lines
}

// Generate dimension text
function generateDimensionText(rect: Rect, color: string) {
  const texts = []
  const offset = 20
  
  // Width text
  texts.push({
    x: rect.x + rect.w / 2,
    y: rect.y - offset - 5,
    text: `${rect.w}px`,
    fontSize: 12,
    fill: color,
    align: 'center'
  })
  
  // Height text
  texts.push({
    x: rect.x - offset - 30,
    y: rect.y + rect.h / 2 - 6,
    text: `${rect.h}px`,
    fontSize: 12,
    fill: color,
    align: 'right'
  })
  
  return texts
}

// Generate safe area and bleed rectangles
const safeAreaRect = computed(() => {
  if (!artSpec.value) return null
  const margin = artSpec.value.safe_area_margin
  return {
    x: margin,
    y: margin,
    width: baseResolution.value.w - margin * 2,
    height: baseResolution.value.h - margin * 2,
    stroke: colors.safeArea,
    strokeWidth: 2,
    dash: [10, 5]
  }
})

const bleedRect = computed(() => {
  if (!artSpec.value) return null
  const bleed = artSpec.value.background_bleed
  return {
    x: -bleed,
    y: -bleed,
    width: baseResolution.value.w + bleed * 2,
    height: baseResolution.value.h + bleed * 2,
    stroke: colors.bleed,
    strokeWidth: 2,
    dash: [15, 10]
  }
})

// Generate all blueprint elements
const blueprintElements = computed(() => {
  if (!manifest.value) return []
  
  return layoutElements.value.map(element => {
    const rect = getCurrentRect(element)
    const color = getColorByType(element.type)
    
    return {
      element,
      rect,
      color,
      dimensionLines: generateDimensionLines(rect, colors.dimension),
      dimensionTexts: generateDimensionText(rect, colors.text)
    }
  })
})
</script>

<template>
  <Layer v-if="manifest">
    <!-- Base resolution frame -->
    <VRect
      :config="{
        x: 0,
        y: 0,
        width: baseResolution.w,
        height: baseResolution.h,
        stroke: '#52525b',
        strokeWidth: 2,
        listening: false
      }"
    />
    
    <!-- Bleed area -->
    <VRect
      v-if="bleedRect"
      :config="{ ...bleedRect, listening: false }"
    />
    
    <!-- Safe area -->
    <VRect
      v-if="safeAreaRect"
      :config="{ ...safeAreaRect, listening: false }"
    />
    
    <!-- Layout elements -->
    <template v-for="item in blueprintElements" :key="item.element.id">
      <!-- Element rectangle -->
      <VRect
        :config="{
          x: item.rect.x,
          y: item.rect.y,
          width: item.rect.w,
          height: item.rect.h,
          stroke: item.color,
          strokeWidth: 2,
          fill: item.color + '20',
          listening: true
        }"
        @click="() => handleElementClick(item.element)"
        @tap="() => handleElementClick(item.element)"
      />
      
      <!-- Element label -->
      <VText
        :config="{
          x: item.rect.x + 5,
          y: item.rect.y + 5,
          text: `${item.element.name} (${item.element.type})`,
          fontSize: 14,
          fill: colors.text,
          listening: false
        }"
      />
      
      <!-- Z-index badge -->
      <VText
        :config="{
          x: item.rect.x + item.rect.w - 30,
          y: item.rect.y + 5,
          text: `z:${item.element.z_index}`,
          fontSize: 11,
          fill: '#71717a',
          listening: false
        }"
      />
      
      <!-- Dimension lines -->
      <VLine
        v-for="(line, idx) in item.dimensionLines"
        :key="`line-${item.element.id}-${idx}`"
        :config="{ ...line, listening: false }"
      />
      
      <!-- Dimension texts -->
      <VText
        v-for="(text, idx) in item.dimensionTexts"
        :key="`text-${item.element.id}-${idx}`"
        :config="{ ...text, listening: false }"
      />
    </template>
    
    <!-- Legend -->
    <VRect
      :config="{
        x: 10,
        y: 10,
        width: 200,
        height: 120,
        fill: '#18181c',
        stroke: '#3f3f46',
        strokeWidth: 1,
        cornerRadius: 4,
        listening: false
      }"
    />
    
    <VText
      :config="{
        x: 20,
        y: 20,
        text: 'Blueprint Legend',
        fontSize: 13,
        fill: colors.text,
        fontStyle: 'bold',
        listening: false
      }"
    />
    
    <VText
      :config="{
        x: 20,
        y: 45,
        text: `Safe Area: ${artSpec?.safe_area_margin || 0}px`,
        fontSize: 11,
        fill: colors.safeArea,
        listening: false
      }"
    />
    
    <VText
      :config="{
        x: 20,
        y: 65,
        text: `Bleed: ${artSpec?.background_bleed || 0}px`,
        fontSize: 11,
        fill: colors.bleed,
        listening: false
      }"
    />
    
    <VText
      :config="{
        x: 20,
        y: 85,
        text: `Symbol: ${artSpec?.symbol_size.w || 0} x ${artSpec?.symbol_size.h || 0}`,
        fontSize: 11,
        fill: colors.text,
        listening: false
      }"
    />
    
    <VText
      :config="{
        x: 20,
        y: 105,
        text: `Elements: ${layoutElements.length}`,
        fontSize: 11,
        fill: colors.text,
        listening: false
      }"
    />
  </Layer>
</template>
