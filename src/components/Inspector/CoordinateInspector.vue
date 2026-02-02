<script setup lang="ts">
import { computed } from 'vue'
import { useForgeStore } from '@/stores/forge'
import { transformCoordinate } from '@/logic/coordinate'
import type { LayoutElement } from '@/types/manifest'

const forgeStore = useForgeStore()

// Props
interface Props {
  selectedElement: LayoutElement | null
}

const props = defineProps<Props>()

// Get current orientation
const orientation = computed(() => forgeStore.orientation)
const baseResolution = computed(() => forgeStore.baseResolution)

// Transform result
const transformResult = computed(() => {
  if (!props.selectedElement) return null
  
  const rect = orientation.value === 'landscape'
    ? props.selectedElement.rect_landscape
    : props.selectedElement.rect_portrait
  
  return transformCoordinate(
    rect,
    props.selectedElement.anchor,
    baseResolution.value
  )
})
</script>

<template>
  <div class="coordinate-inspector">
    <div class="inspector-header">
      <h3>Coordinate Inspector</h3>
      <p v-if="!selectedElement" class="hint">點擊畫布上的元素以查看座標資訊</p>
    </div>

    <div v-if="selectedElement && transformResult" class="inspector-content">
      <!-- Element Info -->
      <div class="info-section">
        <h4>元素資訊</h4>
        <div class="info-row">
          <span class="label">ID:</span>
          <span class="value">{{ selectedElement.id }}</span>
        </div>
        <div class="info-row">
          <span class="label">Name:</span>
          <span class="value">{{ selectedElement.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">Type:</span>
          <span class="value">{{ selectedElement.type }}</span>
        </div>
        <div class="info-row">
          <span class="label">Anchor:</span>
          <span class="value anchor">{{ selectedElement.anchor }}</span>
        </div>
        <div class="info-row">
          <span class="label">Z-Index:</span>
          <span class="value">{{ selectedElement.z_index }}</span>
        </div>
      </div>

      <!-- Web Coordinates -->
      <div class="info-section web-coords">
        <h4>🌐 Web 座標 (Top-Left Origin)</h4>
        <div class="coord-grid">
          <div class="coord-item">
            <span class="coord-label">X:</span>
            <span class="coord-value">{{ transformResult.webRect.x }}px</span>
          </div>
          <div class="coord-item">
            <span class="coord-label">Y:</span>
            <span class="coord-value">{{ transformResult.webRect.y }}px</span>
          </div>
          <div class="coord-item">
            <span class="coord-label">W:</span>
            <span class="coord-value">{{ transformResult.webRect.w }}px</span>
          </div>
          <div class="coord-item">
            <span class="coord-label">H:</span>
            <span class="coord-value">{{ transformResult.webRect.h }}px</span>
          </div>
        </div>
      </div>

      <!-- Cocos Coordinates -->
      <div class="info-section cocos-coords">
        <h4>🎮 Cocos 座標 (Center Origin)</h4>
        <div class="coord-grid">
          <div class="coord-item">
            <span class="coord-label">X:</span>
            <span class="coord-value">{{ transformResult.cocosRect.x.toFixed(2) }}</span>
          </div>
          <div class="coord-item">
            <span class="coord-label">Y:</span>
            <span class="coord-value">{{ transformResult.cocosRect.y.toFixed(2) }}</span>
          </div>
          <div class="coord-item">
            <span class="coord-label">W:</span>
            <span class="coord-value">{{ transformResult.cocosRect.w }}</span>
          </div>
          <div class="coord-item">
            <span class="coord-label">H:</span>
            <span class="coord-value">{{ transformResult.cocosRect.h }}</span>
          </div>
        </div>
      </div>

      <!-- Formula Details -->
      <div class="info-section formula">
        <h4>📐 轉換公式</h4>
        <div class="formula-content">
          <div class="formula-row">
            <span class="formula-label">Anchor X:</span>
            <span class="formula-value">{{ transformResult.formula.anchorX }}</span>
          </div>
          <div class="formula-row">
            <span class="formula-label">Anchor Y:</span>
            <span class="formula-value">{{ transformResult.formula.anchorY }}</span>
          </div>
          <pre class="formula-calc">{{ transformResult.formula.calculation }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coordinate-inspector {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #e4e4e7;
  overflow-y: auto;
}

.inspector-header {
  padding: 16px;
  border-bottom: 1px solid #3f3f46;
}

.inspector-header h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #a1a1aa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: #71717a;
  font-style: italic;
}

.inspector-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-section {
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  padding: 12px;
}

.info-section h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #e4e4e7;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #3f3f46;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 12px;
  color: #a1a1aa;
}

.value {
  font-size: 12px;
  color: #e4e4e7;
  font-family: 'Courier New', monospace;
}

.value.anchor {
  color: #fbbf24;
  font-weight: 600;
}

.coord-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.coord-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: #18181c;
  border-radius: 4px;
}

.coord-label {
  font-size: 11px;
  color: #a1a1aa;
  font-weight: 600;
}

.coord-value {
  font-size: 12px;
  color: #e4e4e7;
  font-family: 'Courier New', monospace;
}

.web-coords h4 {
  color: #3b82f6;
}

.cocos-coords h4 {
  color: #10b981;
}

.formula h4 {
  color: #f59e0b;
}

.formula-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formula-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background: #18181c;
  border-radius: 4px;
}

.formula-label {
  font-size: 11px;
  color: #a1a1aa;
}

.formula-value {
  font-size: 12px;
  color: #fbbf24;
  font-family: 'Courier New', monospace;
}

.formula-calc {
  margin: 8px 0 0 0;
  padding: 12px;
  background: #18181c;
  border-radius: 4px;
  font-size: 11px;
  color: #a1a1aa;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
}
</style>
